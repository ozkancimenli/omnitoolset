import { DateTime } from 'luxon';

import { logger, maskIdentifier, maskPhoneNumber, previewText } from '../../core/logging/logger.js';
import {
  env,
  getDefaultBusinessSeed,
  hasOpenAICredentials,
  hasTwilioCredentials
} from '../../config/env.js';
import { generateSmsReply } from '../../integrations/openai/openai-client.js';
import { sendSms } from '../../integrations/twilio/client.js';
import {
  createMissedCallPlan,
  createReplyPlan,
  serializeSlots
} from './booking-planner.js';
import {
  assessPromptInjectionRisk,
  createTrafficProtector,
  isSelfOriginPhone,
  validateDialResultPayload,
  validateInboundSmsPayload
} from './security.js';

const MISSED_CALL_STATUSES = new Set(['no-answer', 'busy', 'failed', 'canceled']);
const DETERMINISTIC_PLAN_TYPES = new Set(['confirm_booking', 'opt_out', 'not_now', 'booked_follow_up']);

function buildConversationMetadata(conversation, plan) {
  const metadata = {
    ...(conversation.metadata || {}),
    lastPlanType: plan.type
  };

  if (plan.type !== 'opt_out') {
    delete metadata.optedOut;
  }

  if (plan.type !== 'not_now') {
    delete metadata.pausedAt;
  }

  if (plan.type === 'offer_slots' || plan.type === 'clarify_choice' || plan.type === 'price_answer') {
    metadata.offeredSlots = serializeSlots(plan.offeredSlots);
  }

  if (plan.type === 'confirm_booking' && plan.selectedSlot) {
    metadata.offeredSlots = [];
    metadata.confirmedSlot = plan.selectedSlot.toISO();
  }

  if (plan.type === 'opt_out') {
    metadata.optedOut = true;
    metadata.offeredSlots = [];
  }

  if (plan.type === 'not_now') {
    metadata.offeredSlots = [];
    metadata.pausedAt = DateTime.utc().toISO();
  }

  if (plan.type === 'clarify_request') {
    metadata.offeredSlots = [];
  }

  return metadata;
}

export function createSmsAssistantService({ repositories }) {
  const trafficProtector = createTrafficProtector();

  function resolveBusinessPhone(phoneNumber) {
    return phoneNumber || env.twilio.phoneNumber || env.defaultBusiness.twilioPhone;
  }

  function isLiveBusinessReady(business) {
    return Boolean(business && business.status === 'active' && business.twilioPhone);
  }

  function isAutomationEnabled(business) {
    return business?.automationEnabled !== false;
  }

  async function resolveBusiness(phoneNumber, { allowFallbackBusiness = true } = {}) {
    const resolvedPhone = resolveBusinessPhone(phoneNumber);
    const liveBusiness = await repositories.businesses.getByTwilioPhone(resolvedPhone);

    if (isLiveBusinessReady(liveBusiness)) {
      return liveBusiness;
    }

    if (!allowFallbackBusiness) {
      return null;
    }

    return repositories.businesses.ensureBusiness(
      getDefaultBusinessSeed({
        twilioPhone: null,
        status: 'demo'
      })
    );
  }

  async function resolveContact({ businessId, phone, name = null, source }) {
    return repositories.contacts.findOrCreate({
      businessId,
      phone,
      name,
      source,
      status: 'active'
    });
  }

  async function saveConversationState(
    conversation,
    { status, currentStage, metadata, lastInboundAt, lastOutboundAt }
  ) {
    return repositories.conversations.saveState({
      id: conversation.id,
      status,
      currentStage,
      metadata,
      lastInboundAt,
      lastOutboundAt
    });
  }

  async function recordMessage({
    businessId,
    conversationId,
    direction,
    channel,
    body,
    providerSid,
    fromPhone,
    toPhone,
    metadata
  }) {
    return repositories.messages.create({
      businessId,
      conversationId,
      direction,
      channel,
      body,
      providerSid,
      fromPhone,
      toPhone,
      metadata
    });
  }

  async function saveBookingForPlan({ plan, business, conversation, contact }) {
    if (
      plan.type !== 'offer_slots' &&
      plan.type !== 'clarify_choice' &&
      plan.type !== 'confirm_booking'
    ) {
      return repositories.bookings.latestByConversation(conversation.id);
    }

    return repositories.bookings.saveForConversation({
      businessId: business.id,
      conversationId: conversation.id,
      contactId: contact.id,
      requestedSlot: plan.selectedSlot?.toISO() || plan.offeredSlots?.[0]?.toISO() || null,
      confirmedSlot: plan.selectedSlot?.toISO() || null,
      status: plan.type === 'confirm_booking' ? 'confirmed' : 'pending',
      notes: plan.type === 'confirm_booking' ? 'Booked via SMS assistant' : 'Awaiting customer confirmation',
      metadata: {
        offeredSlots: serializeSlots(plan.offeredSlots),
        workflow: plan.type
      }
    });
  }

  async function sendMissedCallReply({ to, from, body, callSid }) {
    try {
      return await sendSms({ to, from, body });
    } catch (error) {
      logger.error('sms_assistant.missed_call_reply_failed', {
        callSid: maskIdentifier(callSid),
        to: maskPhoneNumber(to),
        from: maskPhoneNumber(from),
        error: error.message
      });

      return {
        sid: `failed:${callSid}`,
        status: 'failed',
        mock: false,
        error: error.message
      };
    }
  }

  async function evaluateInboundTraffic({
    business,
    from,
    to,
    channel,
    body = '',
    providerSid = null,
    eventType,
    allowFallbackBusiness = true
  }) {
    const resolvedBusiness = business || (await resolveBusiness(to, { allowFallbackBusiness }));

    if (!resolvedBusiness) {
      return {
        allowed: false,
        reason: 'business_not_active'
      };
    }

    if (
      isSelfOriginPhone({
        from,
        businessPhone: resolvedBusiness.twilioPhone,
        twilioPhone: env.twilio.phoneNumber,
        forwardingPhone: resolvedBusiness.forwardingPhone || env.defaultBusiness.forwardingPhone
      })
    ) {
      return {
        allowed: false,
        reason: 'self_origin'
      };
    }

    if (channel === 'voice') {
      return trafficProtector.checkVoice({
        from,
        callSid: providerSid,
        eventType
      });
    }

    return trafficProtector.checkSms({
      from,
      to,
      body,
      messageSid: providerSid
    });
  }

  async function handleIncomingSms(
    { from, to, body, messageSid = null, customerName = null },
    { allowFallbackBusiness = true } = {}
  ) {
    const validation = validateInboundSmsPayload({
      from,
      to,
      body,
      messageSid,
      customerName
    });

    if (!validation.ok) {
      throw new Error('Incoming SMS payload failed validation.');
    }

    const sanitizedPayload = validation.sanitized;
    const business = await resolveBusiness(sanitizedPayload.to, {
      allowFallbackBusiness
    });

    if (!business) {
      logger.warn('sms_assistant.incoming_sms_unmapped', {
        from: maskPhoneNumber(sanitizedPayload.from),
        to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to)),
        messageSid: maskIdentifier(sanitizedPayload.messageSid)
      });

      return {
        duplicate: true,
        blocked: true,
        business: null,
        blockReason: 'business_not_active'
      };
    }

    logger.info('sms_assistant.incoming_sms_received', {
      from: maskPhoneNumber(sanitizedPayload.from),
      to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to)),
      messageSid: maskIdentifier(sanitizedPayload.messageSid),
      requestIssues: validation.issues
    });

    if (
      sanitizedPayload.messageSid &&
      (await repositories.messages.existsByProviderSid(sanitizedPayload.messageSid))
    ) {
      logger.warn('sms_assistant.duplicate_incoming_sms', {
        from: maskPhoneNumber(sanitizedPayload.from),
        to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to)),
        messageSid: maskIdentifier(sanitizedPayload.messageSid)
      });

      return {
        duplicate: true,
        business
      };
    }

    const trafficDecision = await evaluateInboundTraffic({
      business,
      from: sanitizedPayload.from,
      to: sanitizedPayload.to,
      channel: 'sms',
      body: sanitizedPayload.body,
      providerSid: sanitizedPayload.messageSid,
      eventType: 'sms',
      allowFallbackBusiness
    });

    if (!trafficDecision.allowed) {
      logger.warn('security.sms_inbound_blocked', {
        reason: trafficDecision.reason,
        retryAfterSeconds: trafficDecision.retryAfterSeconds || 0,
        from: maskPhoneNumber(sanitizedPayload.from),
        to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to)),
        messageSid: maskIdentifier(sanitizedPayload.messageSid),
        bodyPreview: previewText(sanitizedPayload.body)
      });

      return {
        duplicate: true,
        blocked: true,
        business,
        blockReason: trafficDecision.reason
      };
    }

    const contact = await resolveContact({
      businessId: business.id,
      phone: sanitizedPayload.from,
      name: sanitizedPayload.customerName,
      source: 'sms'
    });

    let conversation = await repositories.conversations.findOrCreate({
      businessId: business.id,
      contactId: contact.id,
      channel: 'sms'
    });

    const nowIso = DateTime.utc().toISO();

    await recordMessage({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'inbound',
      channel: 'sms',
      body: sanitizedPayload.body,
      providerSid: sanitizedPayload.messageSid,
      fromPhone: sanitizedPayload.from,
      toPhone: sanitizedPayload.to,
      metadata: {
        source: 'twilio-webhook'
      }
    });

    conversation = await saveConversationState(conversation, {
      status: conversation.status,
      currentStage: conversation.currentStage,
      metadata: conversation.metadata,
      lastInboundAt: nowIso,
      lastOutboundAt: conversation.lastOutboundAt
    });

    if (!isAutomationEnabled(business)) {
      logger.info('sms_assistant.automation_disabled_inbound_logged', {
        conversationId: conversation.id,
        businessId: business.id,
        from: maskPhoneNumber(sanitizedPayload.from)
      });

      return {
        duplicate: false,
        blocked: false,
        automationDisabled: true,
        business,
        contact,
        conversation,
        booking: await repositories.bookings.latestByConversation(conversation.id),
        plan: null,
        replyText: null
      };
    }

    const history = await repositories.messages.listRecentByConversation(conversation.id, 8);
    const plan = createReplyPlan({
      messageText: sanitizedPayload.body,
      conversation,
      business,
      now: DateTime.utc()
    });

    conversation = await saveConversationState(conversation, {
      status: plan.conversationStatus,
      currentStage: plan.nextStage,
      metadata: buildConversationMetadata(conversation, plan),
      lastInboundAt: nowIso,
      lastOutboundAt: conversation.lastOutboundAt
    });

    const booking = await saveBookingForPlan({
      plan,
      business,
      conversation,
      contact
    });

    const promptRisk = assessPromptInjectionRisk(sanitizedPayload.body);
    const skipModel =
      promptRisk.suspicious || DETERMINISTIC_PLAN_TYPES.has(plan.type) || validation.issues.length > 0;

    if (promptRisk.suspicious) {
      logger.warn('security.sms_prompt_injection_detected', {
        from: maskPhoneNumber(sanitizedPayload.from),
        conversationId: conversation.id,
        reasons: promptRisk.reasons,
        bodyPreview: previewText(promptRisk.normalizedText)
      });
    }

    const replyText = await generateSmsReply({
      business,
      history,
      plan,
      customerMessage: sanitizedPayload.body,
      safety: {
        skipModel,
        reasons: promptRisk.reasons,
        usedFallback: skipModel
      }
    });

    await recordMessage({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'outbound',
      channel: 'sms',
      body: replyText,
      providerSid: null,
      fromPhone: sanitizedPayload.to || business.twilioPhone,
      toPhone: sanitizedPayload.from,
      metadata: {
        source: 'assistant',
        workflow: plan.type,
        modelBypassed: skipModel
      }
    });

    conversation = await saveConversationState(conversation, {
      status: conversation.status,
      currentStage: conversation.currentStage,
      metadata: conversation.metadata,
      lastInboundAt: conversation.lastInboundAt,
      lastOutboundAt: DateTime.utc().toISO()
    });

    logger.info('sms_assistant.incoming_sms_replied', {
      conversationId: conversation.id,
      from: maskPhoneNumber(sanitizedPayload.from),
      planType: plan.type,
      bookingStatus: booking?.status || null,
      modelBypassed: skipModel
    });

    return {
      duplicate: false,
      blocked: false,
      business,
      contact,
      conversation,
      booking,
      plan,
      replyText
    };
  }

  async function handleMissedCall(
    { from, to, callSid, callStatus },
    { allowFallbackBusiness = true } = {}
  ) {
    const validation = validateDialResultPayload({
      from,
      to,
      callSid,
      callStatus
    });

    if (!validation.ok) {
      throw new Error('Missed call payload failed validation.');
    }

    const sanitizedPayload = validation.sanitized;

    if (!MISSED_CALL_STATUSES.has(sanitizedPayload.callStatus)) {
      return {
        skipped: true
      };
    }

    const business = await resolveBusiness(sanitizedPayload.to, {
      allowFallbackBusiness
    });

    if (!business) {
      logger.warn('sms_assistant.missed_call_unmapped', {
        callSid: maskIdentifier(sanitizedPayload.callSid),
        from: maskPhoneNumber(sanitizedPayload.from),
        to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to))
      });

      return {
        skipped: true,
        blocked: true
      };
    }

    if (!isAutomationEnabled(business)) {
      logger.info('sms_assistant.automation_disabled_missed_call_skipped', {
        callSid: maskIdentifier(sanitizedPayload.callSid),
        businessId: business.id,
        from: maskPhoneNumber(sanitizedPayload.from)
      });

      return {
        skipped: true,
        automationDisabled: true
      };
    }

    const trafficDecision = await evaluateInboundTraffic({
      business,
      from: sanitizedPayload.from,
      to: sanitizedPayload.to,
      channel: 'voice',
      providerSid: sanitizedPayload.callSid,
      eventType: 'voice-dial-result',
      allowFallbackBusiness
    });

    if (!trafficDecision.allowed) {
      logger.warn('security.voice_event_blocked', {
        reason: trafficDecision.reason,
        retryAfterSeconds: trafficDecision.retryAfterSeconds || 0,
        from: maskPhoneNumber(sanitizedPayload.from),
        to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to)),
        callSid: maskIdentifier(sanitizedPayload.callSid),
        callStatus: sanitizedPayload.callStatus
      });

      return {
        skipped: true,
        blocked: true
      };
    }

    const eventId = sanitizedPayload.callSid || `call:${sanitizedPayload.from}:${Date.now()}`;
    const outboundMarker = `call:${eventId}:auto-sms`;

    if (await repositories.messages.existsByProviderSid(outboundMarker)) {
      return {
        skipped: true,
        duplicate: true
      };
    }

    logger.info('sms_assistant.missed_call_received', {
      callSid: maskIdentifier(sanitizedPayload.callSid),
      callStatus: sanitizedPayload.callStatus,
      from: maskPhoneNumber(sanitizedPayload.from),
      to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to))
    });

    const contact = await resolveContact({
      businessId: business.id,
      phone: sanitizedPayload.from,
      source: 'voice'
    });

    let conversation = await repositories.conversations.findOrCreate({
      businessId: business.id,
      contactId: contact.id,
      channel: 'sms'
    });

    const eventMarker = `call:${eventId}:event`;
    if (!(await repositories.messages.existsByProviderSid(eventMarker))) {
      await recordMessage({
        businessId: business.id,
        conversationId: conversation.id,
        direction: 'inbound',
        channel: 'voice',
        body: `Missed call detected (${sanitizedPayload.callStatus}).`,
        providerSid: eventMarker,
        fromPhone: sanitizedPayload.from,
        toPhone: sanitizedPayload.to,
        metadata: {
          callStatus: sanitizedPayload.callStatus
        }
      });
    }

    const plan = createMissedCallPlan({
      business,
      now: DateTime.utc()
    });
    const replyText = await generateSmsReply({
      business,
      history: [],
      plan,
      customerMessage: 'Missed call follow-up',
      safety: {
        skipModel: !hasOpenAICredentials(),
        reasons: []
      }
    });

    const delivery = await sendMissedCallReply({
      to: sanitizedPayload.from,
      from: sanitizedPayload.to || business.twilioPhone,
      body: replyText,
      callSid: sanitizedPayload.callSid
    });

    await recordMessage({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'outbound',
      channel: 'sms',
      body: replyText,
      providerSid: outboundMarker,
      fromPhone: sanitizedPayload.to || business.twilioPhone,
      toPhone: sanitizedPayload.from,
      metadata: {
        source: 'missed-call-follow-up',
        callSid: sanitizedPayload.callSid,
        deliveryStatus: delivery.status
      }
    });

    conversation = await saveConversationState(conversation, {
      status: 'open',
      currentStage: plan.nextStage,
      metadata: buildConversationMetadata(conversation, plan),
      lastInboundAt: conversation.lastInboundAt,
      lastOutboundAt: DateTime.utc().toISO()
    });

    await saveBookingForPlan({
      plan,
      business,
      conversation,
      contact
    });

    logger.info('sms_assistant.missed_call_replied', {
      callSid: maskIdentifier(sanitizedPayload.callSid),
      conversationId: conversation.id,
      deliveryStatus: delivery.status
    });

    return {
      skipped: false,
      delivery,
      replyText,
      conversation
    };
  }

  async function getVoiceRouting(phoneNumber, { allowFallbackBusiness = false } = {}) {
    const business = await resolveBusiness(phoneNumber, {
      allowFallbackBusiness
    });

    if (!business) {
      return {
        active: false,
        callerId: null,
        forwardingPhone: null
      };
    }

    return {
      active: isLiveBusinessReady(business),
      automationEnabled: isAutomationEnabled(business),
      callerId: business.twilioPhone || resolveBusinessPhone(phoneNumber),
      forwardingPhone: business.forwardingPhone || null
    };
  }

  function getModuleOverview() {
    return {
      product: 'SMS AI Assistant',
      status: 'Live',
      hasOpenAI: hasOpenAICredentials(),
      hasTwilio: hasTwilioCredentials()
    };
  }

  return {
    evaluateInboundTraffic,
    handleIncomingSms,
    handleMissedCall,
    getVoiceRouting,
    getModuleOverview
  };
}

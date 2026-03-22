import { DateTime } from 'luxon';

import { logger, maskIdentifier, maskPhoneNumber, previewText } from '../../core/logging/logger.js';
import {
  env,
  getDefaultBusinessSeed,
  hasOpenAICredentials,
  hasTwilioCredentials
} from '../../config/env.js';
import { generateSmsReply } from '../../integrations/openai/openai-client.js';
import { buildAbsoluteUrl, sendSms } from '../../integrations/twilio/client.js';
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

  function resolveBusiness(phoneNumber) {
    const resolvedPhone = resolveBusinessPhone(phoneNumber);

    return (
      repositories.businesses.getByTwilioPhone(resolvedPhone) ||
      repositories.businesses.ensureBusiness(getDefaultBusinessSeed())
    );
  }

  function resolveContact({ businessId, phone, name = null, source }) {
    return repositories.contacts.findOrCreate({
      businessId,
      phone,
      name,
      source,
      status: 'active'
    });
  }

  function saveConversationState(conversation, { status, currentStage, metadata, lastInboundAt, lastOutboundAt }) {
    return repositories.conversations.saveState({
      id: conversation.id,
      status,
      currentStage,
      metadata,
      lastInboundAt,
      lastOutboundAt
    });
  }

  function recordMessage({
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

  function saveBookingForPlan({ plan, business, conversation, contact }) {
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

  function evaluateInboundTraffic({ business, from, to, channel, body = '', providerSid = null, eventType }) {
    const resolvedBusiness = business || resolveBusiness(to);

    if (
      isSelfOriginPhone({
        from,
        businessPhone: resolvedBusiness.twilio_phone,
        twilioPhone: env.twilio.phoneNumber,
        forwardingPhone: resolvedBusiness.forwarding_phone || env.defaultBusiness.forwardingPhone
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

  async function handleIncomingSms({
    from,
    to,
    body,
    messageSid = null,
    customerName = null
  }) {
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
    const business = resolveBusiness(sanitizedPayload.to);

    logger.info('sms_assistant.incoming_sms_received', {
      from: maskPhoneNumber(sanitizedPayload.from),
      to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to)),
      messageSid: maskIdentifier(sanitizedPayload.messageSid),
      requestIssues: validation.issues
    });

    if (
      sanitizedPayload.messageSid &&
      repositories.messages.existsByProviderSid(sanitizedPayload.messageSid)
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

    const trafficDecision = evaluateInboundTraffic({
      business,
      from: sanitizedPayload.from,
      to: sanitizedPayload.to,
      channel: 'sms',
      body: sanitizedPayload.body,
      providerSid: sanitizedPayload.messageSid,
      eventType: 'sms'
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

    if (validation.issues.length > 0) {
      logger.warn('security.sms_inbound_sanitized', {
        issues: validation.issues,
        from: maskPhoneNumber(sanitizedPayload.from),
        messageSid: maskIdentifier(sanitizedPayload.messageSid)
      });
    }

    const contact = resolveContact({
      businessId: business.id,
      phone: sanitizedPayload.from,
      name: sanitizedPayload.customerName,
      source: 'sms'
    });

    let conversation = repositories.conversations.findOrCreate({
      businessId: business.id,
      contactId: contact.id,
      channel: 'sms'
    });

    const nowIso = DateTime.utc().toISO();

    recordMessage({
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

    conversation = saveConversationState(conversation, {
      status: conversation.status,
      currentStage: conversation.current_stage,
      metadata: conversation.metadata,
      lastInboundAt: nowIso,
      lastOutboundAt: conversation.last_outbound_at
    });

    const history = repositories.messages.listRecentByConversation(conversation.id, 8);
    const plan = createReplyPlan({
      messageText: sanitizedPayload.body,
      conversation,
      business,
      now: DateTime.utc()
    });

    conversation = saveConversationState(conversation, {
      status: plan.conversationStatus,
      currentStage: plan.nextStage,
      metadata: buildConversationMetadata(conversation, plan),
      lastInboundAt: nowIso,
      lastOutboundAt: conversation.last_outbound_at
    });

    const booking = saveBookingForPlan({
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

    recordMessage({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'outbound',
      channel: 'sms',
      body: replyText,
      providerSid: null,
      fromPhone: sanitizedPayload.to || business.twilio_phone,
      toPhone: sanitizedPayload.from,
      metadata: {
        source: 'assistant',
        workflow: plan.type,
        modelBypassed: skipModel
      }
    });

    conversation = saveConversationState(conversation, {
      status: conversation.status,
      currentStage: conversation.current_stage,
      metadata: conversation.metadata,
      lastInboundAt: conversation.last_inbound_at,
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

  async function handleMissedCall({ from, to, callSid, callStatus }) {
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

    const business = resolveBusiness(sanitizedPayload.to);
    const trafficDecision = evaluateInboundTraffic({
      business,
      from: sanitizedPayload.from,
      to: sanitizedPayload.to,
      channel: 'voice',
      providerSid: sanitizedPayload.callSid,
      eventType: 'voice-dial-result'
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

    if (repositories.messages.existsByProviderSid(outboundMarker)) {
      logger.warn('sms_assistant.duplicate_missed_call', {
        callSid: maskIdentifier(sanitizedPayload.callSid),
        from: maskPhoneNumber(sanitizedPayload.from),
        to: maskPhoneNumber(resolveBusinessPhone(sanitizedPayload.to))
      });

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

    const contact = resolveContact({
      businessId: business.id,
      phone: sanitizedPayload.from,
      source: 'voice'
    });

    let conversation = repositories.conversations.findOrCreate({
      businessId: business.id,
      contactId: contact.id,
      channel: 'sms'
    });

    const nowIso = DateTime.utc().toISO();

    const eventMarker = `call:${eventId}:event`;
    if (!repositories.messages.existsByProviderSid(eventMarker)) {
      recordMessage({
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

    conversation = saveConversationState(conversation, {
      status: 'open',
      currentStage: plan.nextStage,
      metadata: buildConversationMetadata(conversation, plan),
      lastInboundAt: nowIso,
      lastOutboundAt: conversation.last_outbound_at
    });

    saveBookingForPlan({
      plan,
      business,
      conversation,
      contact
    });

    const history = repositories.messages.listRecentByConversation(conversation.id, 8);
    const replyText = await generateSmsReply({
      business,
      history,
      plan,
      customerMessage: 'Customer called but the business missed the call.',
      safety: {
        skipModel: true,
        reasons: ['missed_call_fallback'],
        usedFallback: true
      }
    });

    const delivery = await sendMissedCallReply({
      to: sanitizedPayload.from,
      from: business.twilio_phone || env.twilio.phoneNumber,
      body: replyText,
      callSid: sanitizedPayload.callSid
    });

    recordMessage({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'outbound',
      channel: 'sms',
      body: replyText,
      providerSid: outboundMarker,
      fromPhone: sanitizedPayload.to || business.twilio_phone,
      toPhone: sanitizedPayload.from,
      metadata: {
        source: 'missed-call-auto-sms',
        externalSid: delivery.sid,
        deliveryStatus: delivery.status,
        mock: delivery.mock,
        error: delivery.error || null
      }
    });

    saveConversationState(conversation, {
      status: 'open',
      currentStage: conversation.current_stage,
      metadata: conversation.metadata,
      lastInboundAt: conversation.last_inbound_at,
      lastOutboundAt: DateTime.utc().toISO()
    });

    logger.info('sms_assistant.missed_call_replied', {
      callSid: maskIdentifier(sanitizedPayload.callSid),
      conversationId: conversation.id,
      deliveryStatus: delivery.status
    });

    return {
      skipped: false,
      replyText,
      delivery
    };
  }

  function getVoiceRouting(phoneNumber) {
    const business = resolveBusiness(phoneNumber || env.twilio.phoneNumber || env.defaultBusiness.twilioPhone);

    return {
      forwardingPhone: business.forwarding_phone || env.defaultBusiness.forwardingPhone,
      callerId: business.twilio_phone || env.twilio.phoneNumber
    };
  }

  function getModuleOverview() {
    const businesses = repositories.businesses.listAll();

    return {
      product: 'SMS AI Assistant',
      status: 'Live',
      configured: {
        openai: hasOpenAICredentials(),
        twilio: hasTwilioCredentials()
      },
      businesses,
      metrics: {
        openConversations: repositories.conversations.countOpen(),
        totalMessages: repositories.messages.countAll(),
        confirmedBookings: repositories.bookings.countConfirmed()
      },
      webhooks: {
        sms: buildAbsoluteUrl('/api/sms-assistant/webhooks/sms'),
        voiceIncoming: buildAbsoluteUrl('/api/sms-assistant/webhooks/voice/incoming'),
        voiceDialResult: buildAbsoluteUrl('/api/sms-assistant/webhooks/voice/dial-result')
      }
    };
  }

  return {
    evaluateInboundTraffic,
    getModuleOverview,
    getVoiceRouting,
    handleIncomingSms,
    handleMissedCall
  };
}

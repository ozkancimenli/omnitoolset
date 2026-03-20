import { DateTime } from 'luxon';

import { env, hasOpenAICredentials, hasTwilioCredentials } from '../../config/env.js';
import { generateSmsReply } from '../../integrations/openai/openai-client.js';
import { buildAbsoluteUrl, sendSms } from '../../integrations/twilio/client.js';
import {
  createMissedCallPlan,
  createReplyPlan,
  serializeSlots
} from './booking-service.js';

const MISSED_CALL_STATUSES = new Set(['no-answer', 'busy', 'failed', 'canceled']);

function buildConversationMetadata(conversation, plan) {
  const metadata = {
    ...(conversation.metadata || {}),
    lastPlanType: plan.type
  };

  if (plan.type === 'offer_slots' || plan.type === 'clarify_choice') {
    metadata.offeredSlots = serializeSlots(plan.offeredSlots);
  }

  if (plan.type === 'confirm_booking' && plan.selectedSlot) {
    metadata.offeredSlots = [];
    metadata.confirmedSlot = plan.selectedSlot.toISO();
  }

  if (plan.type === 'opt_out') {
    metadata.optedOut = true;
  }

  return metadata;
}

export function createSmsAssistantService({ repositories }) {
  function resolveBusiness(phoneNumber) {
    return (
      repositories.businesses.getByTwilioPhone(phoneNumber) ||
      repositories.businesses.ensureBusiness({
        name: env.defaultBusiness.name,
        slug: env.defaultBusiness.slug,
        twilioPhone: env.defaultBusiness.twilioPhone,
        timezone: env.defaultBusiness.timezone,
        forwardingPhone: env.defaultBusiness.forwardingPhone,
        servicesSummary: env.defaultBusiness.servicesSummary,
        hoursSummary: env.defaultBusiness.hoursSummary,
        bookingDurationMinutes: env.defaultBusiness.bookingDurationMinutes,
        bookingWindowDays: env.defaultBusiness.bookingWindowDays
      })
    );
  }

  function saveBookingForPlan({ plan, business, conversation, customerPhone, customerName }) {
    if (plan.type !== 'offer_slots' && plan.type !== 'clarify_choice' && plan.type !== 'confirm_booking') {
      return repositories.bookings.latestByConversation(conversation.id);
    }

    return repositories.bookings.saveForConversation({
      businessId: business.id,
      conversationId: conversation.id,
      customerPhone,
      customerName,
      requestedSlot: plan.offeredSlots?.[0]?.toISO() || plan.selectedSlot?.toISO() || null,
      confirmedSlot: plan.selectedSlot?.toISO() || null,
      status: plan.type === 'confirm_booking' ? 'confirmed' : 'pending',
      notes: plan.type === 'confirm_booking' ? 'Booked via SMS assistant' : 'Awaiting customer confirmation',
      metadata: {
        offeredSlots: serializeSlots(plan.offeredSlots),
        workflow: plan.type
      }
    });
  }

  async function handleIncomingSms({
    from,
    to,
    body,
    messageSid = null,
    customerName = null
  }) {
    const business = resolveBusiness(to || env.twilio.phoneNumber || env.defaultBusiness.twilioPhone);

    if (messageSid && repositories.messages.existsByProviderSid(messageSid)) {
      return {
        duplicate: true,
        business
      };
    }

    let conversation = repositories.conversations.findOrCreate({
      businessId: business.id,
      customerPhone: from,
      customerName,
      channel: 'sms'
    });

    const nowIso = DateTime.utc().toISO();

    repositories.messages.create({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'inbound',
      channel: 'sms',
      body,
      providerSid: messageSid,
      fromPhone: from,
      toPhone: to,
      metadata: {
        source: 'twilio-webhook'
      }
    });

    conversation = repositories.conversations.saveState({
      id: conversation.id,
      customerName,
      status: conversation.status,
      currentStage: conversation.current_stage,
      metadata: conversation.metadata,
      lastInboundAt: nowIso,
      lastOutboundAt: conversation.last_outbound_at
    });

    const history = repositories.messages.listRecentByConversation(conversation.id, 8);
    const plan = createReplyPlan({
      messageText: body,
      conversation,
      business,
      now: DateTime.utc()
    });

    conversation = repositories.conversations.saveState({
      id: conversation.id,
      customerName,
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
      customerPhone: from,
      customerName
    });

    const replyText = await generateSmsReply({
      business,
      history,
      plan,
      customerMessage: body
    });

    repositories.messages.create({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'outbound',
      channel: 'sms',
      body: replyText,
      providerSid: null,
      fromPhone: to || business.twilio_phone,
      toPhone: from,
      metadata: {
        source: 'assistant',
        workflow: plan.type
      }
    });

    conversation = repositories.conversations.saveState({
      id: conversation.id,
      customerName,
      status: conversation.status,
      currentStage: conversation.current_stage,
      metadata: conversation.metadata,
      lastInboundAt: conversation.last_inbound_at,
      lastOutboundAt: DateTime.utc().toISO()
    });

    return {
      duplicate: false,
      business,
      conversation,
      booking,
      plan,
      replyText
    };
  }

  async function handleMissedCall({ from, to, callSid, callStatus }) {
    if (!MISSED_CALL_STATUSES.has((callStatus || '').toLowerCase())) {
      return {
        skipped: true
      };
    }

    const business = resolveBusiness(to || env.twilio.phoneNumber || env.defaultBusiness.twilioPhone);
    const outboundMarker = `call:${callSid}:auto-sms`;

    if (repositories.messages.existsByProviderSid(outboundMarker)) {
      return {
        skipped: true,
        duplicate: true
      };
    }

    let conversation = repositories.conversations.findOrCreate({
      businessId: business.id,
      customerPhone: from,
      customerName: null,
      channel: 'sms'
    });

    const nowIso = DateTime.utc().toISO();

    const eventMarker = `call:${callSid}:event`;
    if (!repositories.messages.existsByProviderSid(eventMarker)) {
      repositories.messages.create({
        businessId: business.id,
        conversationId: conversation.id,
        direction: 'inbound',
        channel: 'voice',
        body: `Missed call detected (${callStatus}).`,
        providerSid: eventMarker,
        fromPhone: from,
        toPhone: to,
        metadata: {
          callStatus
        }
      });
    }

    const plan = createMissedCallPlan({
      business,
      now: DateTime.utc()
    });

    conversation = repositories.conversations.saveState({
      id: conversation.id,
      customerName: conversation.customer_name,
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
      customerPhone: from,
      customerName: conversation.customer_name
    });

    const history = repositories.messages.listRecentByConversation(conversation.id, 8);
    const replyText = await generateSmsReply({
      business,
      history,
      plan,
      customerMessage: 'Customer called but the business missed the call.'
    });

    const delivery = await sendSms({
      to: from,
      from: business.twilio_phone || env.twilio.phoneNumber,
      body: replyText
    });

    repositories.messages.create({
      businessId: business.id,
      conversationId: conversation.id,
      direction: 'outbound',
      channel: 'sms',
      body: replyText,
      providerSid: outboundMarker,
      fromPhone: to || business.twilio_phone,
      toPhone: from,
      metadata: {
        source: 'missed-call-auto-sms',
        externalSid: delivery.sid,
        deliveryStatus: delivery.status,
        mock: delivery.mock
      }
    });

    repositories.conversations.saveState({
      id: conversation.id,
      customerName: conversation.customer_name,
      status: 'open',
      currentStage: conversation.current_stage,
      metadata: conversation.metadata,
      lastInboundAt: conversation.last_inbound_at,
      lastOutboundAt: DateTime.utc().toISO()
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
    getModuleOverview,
    getVoiceRouting,
    handleIncomingSms,
    handleMissedCall
  };
}

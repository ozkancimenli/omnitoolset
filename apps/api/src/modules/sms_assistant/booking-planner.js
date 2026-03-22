import { DateTime } from 'luxon';

const WEEKDAY_INDEX = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7
};

const SLOT_TEMPLATES = [
  { hour: 10, minute: 0, period: 'morning' },
  { hour: 14, minute: 30, period: 'afternoon' }
];

function normalizeText(value) {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function isBusinessDay(dateTime) {
  return dateTime.weekday >= 1 && dateTime.weekday <= 5;
}

function detectTimePreference(message) {
  if (/\b(afternoon|later|pm|after work)\b/.test(message)) {
    return 'afternoon';
  }

  if (/\b(morning|earlier|am)\b/.test(message)) {
    return 'morning';
  }

  return null;
}

function detectSpecificWeekday(message) {
  return Object.entries(WEEKDAY_INDEX).find(([label]) => message.includes(label))?.[1] ?? null;
}

function nextWeekday(now, weekday) {
  let cursor = now.startOf('day');

  while (cursor.weekday !== weekday || cursor <= now.startOf('day')) {
    cursor = cursor.plus({ days: 1 });
  }

  return cursor;
}

function buildCandidateDates({ message, now, windowDays }) {
  const dates = [];
  const searchWindowDays = Math.max(windowDays, 14);
  const addDate = (candidate) => {
    if (!candidate) {
      return;
    }

    const key = candidate.toISODate();
    if (!dates.find((date) => date.toISODate() === key)) {
      dates.push(candidate.startOf('day'));
    }
  };

  if (message.includes('today')) {
    addDate(now);
  }

  if (message.includes('tomorrow')) {
    addDate(now.plus({ days: 1 }));
  }

  const weekday = detectSpecificWeekday(message);
  if (weekday) {
    addDate(nextWeekday(now, weekday));
  }

  for (let offset = 0; offset <= searchWindowDays; offset += 1) {
    addDate(now.plus({ days: offset }));
  }

  return dates.filter(isBusinessDay);
}

function orderedSlotTemplates(preference) {
  if (preference === 'afternoon') {
    return [SLOT_TEMPLATES[1], SLOT_TEMPLATES[0]];
  }

  return SLOT_TEMPLATES;
}

function matchesTime(slot, message) {
  const shortHour = slot.toFormat('h');
  const shortTime = slot.toFormat('h:mm');
  const meridiem = slot.toFormat('a').toLowerCase();
  const weekday = slot.toFormat('cccc').toLowerCase();
  const shortWeekday = slot.toFormat('ccc').toLowerCase();

  return (
    message.includes(`${shortHour}${meridiem}`) ||
    message.includes(`${shortHour} ${meridiem}`) ||
    message.includes(`${shortTime}${meridiem}`) ||
    message.includes(`${shortTime} ${meridiem}`) ||
    (message.includes(shortHour) && (message.includes(weekday) || message.includes(shortWeekday)))
  );
}

function selectOfferedSlot(message, offeredSlots) {
  if (!offeredSlots.length) {
    return null;
  }

  if (/\b(first|1st|earlier|morning)\b/.test(message)) {
    return offeredSlots[0];
  }

  if (offeredSlots[1] && /\b(second|2nd|later|afternoon)\b/.test(message)) {
    return offeredSlots[1];
  }

  return offeredSlots.find((slot) => matchesTime(slot, message)) || null;
}

function isAffirmative(message) {
  return /\b(yes|yep|yeah|works|that works|sounds good|perfect|great|ok|okay|sure)\b/.test(message);
}

function isOptOut(message) {
  return /^(stop|unsubscribe|cancel|end|quit)\b/.test(message);
}

function asksForPrice(message) {
  return /\b(price|prices|pricing|cost|costs|how much|rate|rates|fee|fees)\b/.test(message);
}

function isNotNow(message) {
  return /\b(not now|maybe later|another time|not today|not yet|i'?ll pass|i'?ll let you know|maybe another day)\b/.test(
    message
  );
}

function isGreetingOnly(message) {
  return /^(hi|hello|hey|good morning|good afternoon|good evening)$/.test(message);
}

function isUnclearMessage(message) {
  if (!message) {
    return true;
  }

  return (
    isGreetingOnly(message) ||
    /^(help|info|information|available|availability|question|can you help|interested)$/.test(
      message
    )
  );
}

function generateSlots({ business, messageText, now = DateTime.utc() }) {
  const zoneNow = now.setZone(business.timezone);
  const preference = detectTimePreference(messageText);
  const candidates = buildCandidateDates({
    message: messageText,
    now: zoneNow,
    windowDays: business.bookingWindowDays || 10
  });

  const minimumLeadTime = zoneNow.plus({ hours: 2 });
  const slots = [];

  for (const candidate of candidates) {
    for (const template of orderedSlotTemplates(preference)) {
      const slot = candidate.set({
        hour: template.hour,
        minute: template.minute,
        second: 0,
        millisecond: 0
      });

      if (slot > minimumLeadTime && !slots.find((existing) => existing.toISO() === slot.toISO())) {
        slots.push(slot);
      }

      if (slots.length >= 2) {
        return slots;
      }
    }
  }

  return slots;
}

export function serializeSlots(slots) {
  return (slots || []).map((slot) => slot.toISO());
}

export function deserializeSlots(values, timezone) {
  return (values || [])
    .map((value) => DateTime.fromISO(value, { zone: timezone }))
    .filter((slot) => slot.isValid);
}

export function formatSlotForSms(slot, timezone) {
  return slot.setZone(timezone).toFormat("ccc, LLL d 'at' h:mm a");
}

export function createReplyPlan({ messageText, conversation, business, now = DateTime.utc() }) {
  const normalized = normalizeText(messageText);
  const offeredSlots = deserializeSlots(conversation.metadata?.offeredSlots, business.timezone);
  const confirmedSlot = conversation.metadata?.confirmedSlot
    ? DateTime.fromISO(conversation.metadata.confirmedSlot, { zone: business.timezone })
    : null;

  if (isOptOut(normalized)) {
    return {
      type: 'opt_out',
      customerIntent: 'opt_out',
      goal: 'Acknowledge the opt out and confirm messaging will stop.',
      replyGuidance: 'Confirm the opt out in one short sentence.',
      nextStage: 'closed',
      conversationStatus: 'closed',
      offeredSlots: [],
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  if (isNotNow(normalized)) {
    return {
      type: 'not_now',
      customerIntent: 'defer',
      goal: 'Acknowledge the pause politely and leave the door open without pushing.',
      replyGuidance: 'Keep it warm, brief, and low-pressure.',
      nextStage: 'paused',
      conversationStatus: 'open',
      offeredSlots: [],
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  if (conversation.currentStage === 'booked' && confirmedSlot?.isValid) {
    return {
      type: 'booked_follow_up',
      customerIntent: 'post_booking',
      goal: 'Confirm the existing booking and keep the tone warm.',
      replyGuidance: 'Restate the booking and stay concise.',
      nextStage: 'booked',
      conversationStatus: 'open',
      offeredSlots: [],
      selectedSlot: confirmedSlot,
      timezone: business.timezone
    };
  }

  const matchedOfferedSlot = selectOfferedSlot(normalized, offeredSlots);
  if (matchedOfferedSlot) {
    return {
      type: 'confirm_booking',
      customerIntent: 'booking_confirmation',
      goal: 'Confirm the booking clearly and restate the selected appointment time.',
      replyGuidance: 'Confirm the chosen time in one or two short sentences.',
      nextStage: 'booked',
      conversationStatus: 'open',
      offeredSlots,
      selectedSlot: matchedOfferedSlot,
      timezone: business.timezone
    };
  }

  if (
    conversation.currentStage === 'awaiting_booking_confirmation' &&
    isAffirmative(normalized) &&
    offeredSlots.length === 1
  ) {
    return {
      type: 'confirm_booking',
      customerIntent: 'booking_confirmation',
      goal: 'Confirm the only offered booking time clearly and restate it.',
      replyGuidance: 'Confirm the chosen time in one or two short sentences.',
      nextStage: 'booked',
      conversationStatus: 'open',
      offeredSlots,
      selectedSlot: offeredSlots[0],
      timezone: business.timezone
    };
  }

  if (
    conversation.currentStage === 'awaiting_booking_confirmation' &&
    isAffirmative(normalized) &&
    offeredSlots.length > 1
  ) {
    return {
      type: 'clarify_choice',
      customerIntent: 'booking_confirmation',
      goal: 'Ask the customer to pick one of the offered slots.',
      replyGuidance: 'Ask exactly one short follow-up question.',
      nextStage: 'awaiting_booking_confirmation',
      conversationStatus: 'open',
      offeredSlots,
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  if (asksForPrice(normalized)) {
    const pricingSlots = generateSlots({ business, messageText: normalized, now });

    return {
      type: 'price_answer',
      customerIntent: 'pricing',
      goal: 'Answer the pricing question simply and gently move toward booking.',
      replyGuidance: 'Use one short pricing sentence and one short booking nudge.',
      nextStage: pricingSlots.length ? 'awaiting_booking_confirmation' : 'open',
      conversationStatus: 'open',
      offeredSlots: pricingSlots,
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  if (isUnclearMessage(normalized)) {
    return {
      type: 'clarify_request',
      customerIntent: 'unclear',
      goal: 'Ask one short clarifying question so the customer can move forward.',
      replyGuidance: 'Ask exactly one short clarifying question.',
      nextStage: 'awaiting_customer_goal',
      conversationStatus: 'open',
      offeredSlots: [],
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  const newSlots = generateSlots({ business, messageText: normalized, now });

  return {
    type: 'offer_slots',
    customerIntent: 'booking',
    goal: 'Offer one or two appointment options and ask which works better.',
    replyGuidance: 'Move directly toward a booking with one or two options.',
    nextStage: newSlots.length ? 'awaiting_booking_confirmation' : 'open',
    conversationStatus: 'open',
    offeredSlots: newSlots,
    selectedSlot: null,
    timezone: business.timezone
  };
}

export function createMissedCallPlan({ business, now = DateTime.utc() }) {
  const offeredSlots = generateSlots({
    business,
    messageText: 'missed call follow-up',
    now
  });

  return {
    type: 'offer_slots',
    customerIntent: 'booking',
    goal: 'Text the caller after a missed call and offer one or two times to book.',
    replyGuidance: 'Acknowledge the missed call briefly and offer one or two times.',
    nextStage: offeredSlots.length ? 'awaiting_booking_confirmation' : 'open',
    conversationStatus: 'open',
    offeredSlots,
    selectedSlot: null,
    timezone: business.timezone
  };
}

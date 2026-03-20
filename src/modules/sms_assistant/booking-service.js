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

  for (let offset = 0; offset <= windowDays; offset += 1) {
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

function generateSlots({ business, messageText, now = DateTime.utc() }) {
  const zoneNow = now.setZone(business.timezone);
  const preference = detectTimePreference(messageText);
  const candidates = buildCandidateDates({
    message: messageText,
    now: zoneNow,
    windowDays: business.booking_window_days || 10
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
      goal: 'Acknowledge the opt out and confirm messaging will stop.',
      nextStage: 'closed',
      conversationStatus: 'closed',
      offeredSlots: [],
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  if (conversation.current_stage === 'booked' && confirmedSlot?.isValid) {
    return {
      type: 'booked_follow_up',
      goal: 'Confirm the existing booking and keep the tone warm.',
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
      goal: 'Confirm the booking clearly and restate the selected appointment time.',
      nextStage: 'booked',
      conversationStatus: 'open',
      offeredSlots,
      selectedSlot: matchedOfferedSlot,
      timezone: business.timezone
    };
  }

  if (conversation.current_stage === 'awaiting_booking_confirmation' && isAffirmative(normalized) && offeredSlots.length > 1) {
    return {
      type: 'clarify_choice',
      goal: 'Ask the customer to pick one of the offered slots.',
      nextStage: 'awaiting_booking_confirmation',
      conversationStatus: 'open',
      offeredSlots,
      selectedSlot: null,
      timezone: business.timezone
    };
  }

  const newSlots = generateSlots({ business, messageText: normalized, now });

  return {
    type: 'offer_slots',
    goal: 'Offer one or two appointment options and ask which works better.',
    nextStage: 'awaiting_booking_confirmation',
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
    goal: 'Text the caller after a missed call and offer one or two times to book.',
    nextStage: 'awaiting_booking_confirmation',
    conversationStatus: 'open',
    offeredSlots,
    selectedSlot: null,
    timezone: business.timezone
  };
}

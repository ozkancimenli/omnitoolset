import test from 'node:test';
import assert from 'node:assert/strict';

import { DateTime } from 'luxon';

import {
  createReplyPlan,
  serializeSlots
} from '../src/modules/sms_assistant/booking-planner.js';
import {
  parseDialResultPayload,
  parseInboundSmsPayload,
  parseIncomingCallPayload
} from '../src/modules/sms_assistant/webhook-parsers.js';

const business = {
  timezone: 'America/New_York',
  booking_window_days: 10
};

test('blank inbound sms falls back to a clarifying question instead of offering slots immediately', () => {
  const plan = createReplyPlan({
    messageText: '',
    conversation: {
      current_stage: 'new',
      metadata: {}
    },
    business,
    now: DateTime.fromISO('2026-03-20T10:00:00.000Z')
  });

  assert.equal(plan.type, 'clarify_request');
  assert.equal(plan.nextStage, 'awaiting_customer_goal');
});

test('a single previously offered slot can be confirmed from a plain affirmative reply', () => {
  const offeredSlot = DateTime.fromISO('2026-03-21T14:00:00.000Z', {
    zone: business.timezone
  });

  const plan = createReplyPlan({
    messageText: 'That works for me',
    conversation: {
      current_stage: 'awaiting_booking_confirmation',
      metadata: {
        offeredSlots: serializeSlots([offeredSlot])
      }
    },
    business,
    now: DateTime.fromISO('2026-03-20T10:00:00.000Z')
  });

  assert.equal(plan.type, 'confirm_booking');
  assert.equal(plan.selectedSlot.toISO(), offeredSlot.toISO());
});

test('webhook parsers accept lowercase payload keys and do not invent provider ids for real webhooks', () => {
  const inbound = parseInboundSmsPayload({
    from: '+15550000001',
    to: '+15551234567',
    body: 'hello'
  });
  const incomingCall = parseIncomingCallPayload({
    from: '+15550000001',
    to: '+15551234567',
    callSid: 'CA-lowercase-001'
  });
  const dialResult = parseDialResultPayload({
    from: '+15550000001',
    to: '+15551234567',
    dialCallSid: 'CA-lowercase-002',
    dialCallStatus: 'no-answer'
  });
  const simulatedInbound = parseInboundSmsPayload(
    {
      from: '+15550000001',
      to: '+15551234567',
      body: 'hello'
    },
    { allowSyntheticSid: true }
  );

  assert.equal(inbound.messageSid, null);
  assert.equal(incomingCall.callSid, 'CA-lowercase-001');
  assert.equal(dialResult.callSid, 'CA-lowercase-002');
  assert.equal(dialResult.callStatus, 'no-answer');
  assert.match(simulatedInbound.messageSid, /^sms:/);
});

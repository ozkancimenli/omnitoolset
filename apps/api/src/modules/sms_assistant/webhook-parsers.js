import {
  normalizeInboundBody,
  normalizeMessageSid,
  normalizeOptionalText,
  normalizePhoneNumber
} from './security.js';

export function parseInboundSmsPayload(payload = {}, options = {}) {
  return {
    from: normalizePhoneNumber(payload.From ?? payload.from),
    to: normalizePhoneNumber(payload.To ?? payload.to),
    body: normalizeInboundBody(payload.Body ?? payload.body).body,
    messageSid: normalizeMessageSid(
      payload.MessageSid ?? payload.messageSid,
      'sms',
      options.allowSyntheticSid
    ),
    customerName: normalizeOptionalText(payload.ProfileName ?? payload.customerName, 120)
  };
}

export function parseIncomingCallPayload(payload = {}, options = {}) {
  return {
    from: normalizePhoneNumber(payload.From ?? payload.from),
    to: normalizePhoneNumber(payload.To ?? payload.to),
    callSid: normalizeMessageSid(payload.CallSid ?? payload.callSid, 'call', options.allowSyntheticSid)
  };
}

export function parseDialResultPayload(payload = {}, options = {}) {
  return {
    from: normalizePhoneNumber(payload.From ?? payload.from),
    to: normalizePhoneNumber(payload.To ?? payload.to),
    callSid: normalizeMessageSid(
      payload.CallSid ?? payload.DialCallSid ?? payload.callSid ?? payload.dialCallSid,
      'call',
      options.allowSyntheticSid
    ),
    callStatus: normalizeInboundBody(
      payload.DialCallStatus ?? payload.CallStatus ?? payload.dialCallStatus ?? payload.callStatus
    ).body.toLowerCase()
  };
}

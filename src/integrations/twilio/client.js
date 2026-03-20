import twilio from 'twilio';

import { env, hasTwilioCredentials } from '../../config/env.js';

const client = hasTwilioCredentials()
  ? twilio(env.twilio.accountSid, env.twilio.authToken)
  : null;

export function buildAbsoluteUrl(pathname) {
  return new URL(pathname, env.appUrl).toString();
}

export async function sendSms({ to, body, from = env.twilio.phoneNumber }) {
  if (!client || !from) {
    return {
      sid: `mock:${Date.now()}`,
      status: 'simulated',
      mock: true
    };
  }

  const message = await client.messages.create({
    to,
    from,
    body
  });

  return {
    sid: message.sid,
    status: message.status,
    mock: false
  };
}

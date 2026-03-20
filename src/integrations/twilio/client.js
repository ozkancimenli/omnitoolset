import twilio from 'twilio';

import { env, hasTwilioCredentials } from '../../config/env.js';

const client = hasTwilioCredentials()
  ? twilio(env.twilio.accountSid, env.twilio.authToken)
  : null;

export function buildAbsoluteUrl(pathname) {
  return new URL(pathname, env.appUrl).toString();
}

export function buildAbsoluteUrlFromRequest(req, pathname) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const protocol =
    (typeof forwardedProto === 'string' && forwardedProto.split(',')[0]) || req.protocol || 'https';
  const host =
    (typeof forwardedHost === 'string' && forwardedHost.split(',')[0]) || req.get('host');

  if (!host) {
    return buildAbsoluteUrl(pathname);
  }

  return new URL(pathname, `${protocol}://${host}`).toString();
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

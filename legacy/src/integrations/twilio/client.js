import twilio from 'twilio';

import { env, hasTwilioCredentials } from '../../config/env.js';

const client = hasTwilioCredentials()
  ? twilio(env.twilio.accountSid, env.twilio.authToken)
  : null;
const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function buildAbsoluteUrl(pathname) {
  try {
    return new URL(pathname, env.appUrl).toString();
  } catch {
    return `${env.appUrl.replace(/\/$/, '')}${pathname}`;
  }
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

  try {
    return new URL(pathname, `${protocol}://${host}`).toString();
  } catch {
    return buildAbsoluteUrl(pathname);
  }
}

export function validateTwilioWebhookRequest(req) {
  if (!env.twilio.validateSignatures) {
    return {
      valid: true,
      skipped: true
    };
  }

  if (!env.twilio.authToken) {
    return {
      valid: false,
      reason: 'missing_auth_token'
    };
  }

  if (!req.get('x-twilio-signature')) {
    return {
      valid: false,
      reason: 'missing_signature'
    };
  }

  const url = buildAbsoluteUrlFromRequest(req, req.originalUrl || req.path);

  try {
    const valid = twilio.validateExpressRequest(req, env.twilio.authToken, {
      url
    });

    return {
      valid,
      url,
      reason: valid ? null : 'invalid_signature'
    };
  } catch (error) {
    return {
      valid: false,
      url,
      reason: 'signature_validation_error',
      error: error.message
    };
  }
}

export async function sendSms({ to, body, from = env.twilio.phoneNumber }) {
  const normalizedTo = typeof to === 'string' ? to.trim() : '';
  const normalizedFrom = typeof from === 'string' ? from.trim() : '';
  const normalizedBody = typeof body === 'string' ? body.trim() : '';

  if (!normalizedTo || !normalizedBody) {
    throw new Error('A destination phone number and SMS body are required.');
  }

  if (!E164_PHONE_PATTERN.test(normalizedTo)) {
    throw new Error('Destination phone number must be in E.164 format.');
  }

  if (normalizedFrom && !E164_PHONE_PATTERN.test(normalizedFrom)) {
    throw new Error('Sender phone number must be in E.164 format.');
  }

  if (!client || !normalizedFrom) {
    return {
      sid: `mock:${Date.now()}`,
      status: 'simulated',
      mock: true
    };
  }

  const message = await client.messages.create({
    to: normalizedTo,
    from: normalizedFrom,
    body: normalizedBody
  });

  return {
    sid: message.sid,
    status: message.status,
    mock: false
  };
}

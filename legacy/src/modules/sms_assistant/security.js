import crypto from 'crypto';

import { env } from '../../config/env.js';

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const SID_PATTERN = /^[A-Za-z0-9:_-]{6,160}$/;
const ALLOWED_CALL_STATUSES = new Set([
  'answered',
  'busy',
  'canceled',
  'completed',
  'failed',
  'no-answer',
  'ringing'
]);
const CONTROL_CHARS_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const PROMPT_INJECTION_RULES = [
  ['instruction_override', /\bignore\b.{0,40}\b(previous|prior|system|developer|all)\b.{0,20}\binstruction/i],
  ['prompt_exfiltration', /\b(show|reveal|print|dump)\b.{0,20}\b(prompt|system message|developer message|hidden instruction)\b/i],
  ['role_override', /\b(act as|pretend to be|roleplay as|you are now)\b/i],
  ['unsafe_markup', /<script\b|<\/script>|javascript:|data:text\/html/i],
  ['dialogue_injection', /\b(system|developer|assistant)\s*:/i],
  ['format_override', /```|<xml|<\/xml>|<json|<\/json>/i]
];

function trimString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizePhoneNumber(value) {
  const normalized = trimString(value)
    .replace(/[^\d+]/g, '')
    .replace(/^00/, '+');

  return PHONE_PATTERN.test(normalized) ? normalized : '';
}

export function normalizeOptionalText(value, maxLength = 120) {
  const cleaned = trimString(value)
    .replace(CONTROL_CHARS_PATTERN, ' ')
    .replace(/\s+/g, ' ');

  return cleaned ? cleaned.slice(0, maxLength).trim() : null;
}

export function normalizeMessageSid(value, fallbackPrefix = 'event', allowSynthetic = false) {
  const normalized = trimString(value);

  if (normalized && SID_PATTERN.test(normalized)) {
    return normalized;
  }

  if (!allowSynthetic) {
    return null;
  }

  return `${fallbackPrefix}:${Date.now()}`;
}

export function normalizeInboundBody(value, maxLength = env.security.smsMaxBodyChars) {
  const cleaned = trimString(value)
    .replace(CONTROL_CHARS_PATTERN, ' ')
    .replace(/\s+/g, ' ');
  const truncated = cleaned.length > maxLength;
  const body = truncated ? cleaned.slice(0, maxLength).trim() : cleaned;

  return {
    body,
    truncated
  };
}

export function validateInboundSmsPayload(payload = {}, options = {}) {
  const normalizedBody = normalizeInboundBody(payload.body, options.maxBodyLength);
  const sanitized = {
    from: normalizePhoneNumber(payload.from),
    to: payload.to ? normalizePhoneNumber(payload.to) : '',
    body: normalizedBody.body,
    messageSid: normalizeMessageSid(payload.messageSid, 'sms', options.allowSyntheticSid),
    customerName: normalizeOptionalText(payload.customerName, 120)
  };
  const fieldErrors = {};
  const issues = [];

  if (!sanitized.from) {
    fieldErrors.from = 'A valid sender phone number is required.';
  }

  if (payload.to && !sanitized.to) {
    fieldErrors.to = 'A valid business phone number is required.';
  }

  if (normalizedBody.truncated) {
    issues.push('body_truncated');
  }

  return {
    ok: Object.keys(fieldErrors).length === 0,
    sanitized,
    fieldErrors,
    issues
  };
}

export function validateIncomingCallPayload(payload = {}) {
  const sanitized = {
    from: normalizePhoneNumber(payload.from),
    to: payload.to ? normalizePhoneNumber(payload.to) : '',
    callSid: normalizeMessageSid(payload.callSid, 'call', false)
  };
  const fieldErrors = {};

  if (!sanitized.from) {
    fieldErrors.from = 'A valid caller phone number is required.';
  }

  if (payload.to && !sanitized.to) {
    fieldErrors.to = 'A valid business phone number is required.';
  }

  return {
    ok: Object.keys(fieldErrors).length === 0,
    sanitized,
    fieldErrors,
    issues: []
  };
}

export function validateDialResultPayload(payload = {}) {
  const sanitized = {
    from: normalizePhoneNumber(payload.from),
    to: payload.to ? normalizePhoneNumber(payload.to) : '',
    callSid: normalizeMessageSid(payload.callSid, 'call', false),
    callStatus: trimString(payload.callStatus).toLowerCase()
  };
  const fieldErrors = {};

  if (!sanitized.from) {
    fieldErrors.from = 'A valid caller phone number is required.';
  }

  if (payload.to && !sanitized.to) {
    fieldErrors.to = 'A valid business phone number is required.';
  }

  if (!sanitized.callStatus || !ALLOWED_CALL_STATUSES.has(sanitized.callStatus)) {
    fieldErrors.callStatus = 'A valid dial result status is required.';
  }

  return {
    ok: Object.keys(fieldErrors).length === 0,
    sanitized,
    fieldErrors,
    issues: []
  };
}

export function assessPromptInjectionRisk(messageText) {
  const { body } = normalizeInboundBody(messageText);
  const reasons = [];

  for (const [reason, pattern] of PROMPT_INJECTION_RULES) {
    if (pattern.test(body)) {
      reasons.push(reason);
    }
  }

  if (body.length >= env.security.smsMaxBodyChars) {
    reasons.push('body_limit');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
    normalizedText: body
  };
}

function hashFingerprint(parts) {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16);
}

function createWindowCounter(now) {
  const hits = new Map();

  function prune(key, windowMs) {
    const threshold = now() - windowMs;
    const current = hits.get(key) || [];
    const next = current.filter((timestamp) => timestamp > threshold);

    if (next.length > 0) {
      hits.set(key, next);
      return next;
    }

    hits.delete(key);
    return [];
  }

  return {
    register(key, windowMs, maxEvents) {
      const next = prune(key, windowMs);
      next.push(now());
      hits.set(key, next);

      if (next.length <= maxEvents) {
        return {
          allowed: true,
          retryAfterSeconds: 0,
          count: next.length
        };
      }

      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((next[0] + windowMs - now()) / 1000),
        count: next.length
      };
    }
  };
}

export function createTrafficProtector(config = {}) {
  const now = config.now || (() => Date.now());
  const counters = createWindowCounter(now);
  const fingerprintHits = new Map();
  const duplicateWindowMs = config.duplicateWindowMs ?? env.security.duplicateMessageWindowMs;
  const smsWindowMs = config.smsWindowMs ?? env.security.smsRateLimitWindowMs;
  const smsMaxPerPhone = config.smsMaxPerPhone ?? env.security.smsRateLimitMax;
  const voiceWindowMs = config.voiceWindowMs ?? env.security.voiceRateLimitWindowMs;
  const voiceMaxPerPhone = config.voiceMaxPerPhone ?? env.security.voiceRateLimitMax;

  function seenDuplicateFingerprint(key) {
    const previous = fingerprintHits.get(key);
    const current = now();

    if (typeof previous === 'number' && current - previous < duplicateWindowMs) {
      fingerprintHits.set(key, current);
      return true;
    }

    fingerprintHits.set(key, current);
    return false;
  }

  return {
    checkSms({ from, to, body = '', messageSid = null }) {
      const phoneKey = `sms:${from}`;
      const rateLimit = counters.register(phoneKey, smsWindowMs, smsMaxPerPhone);

      if (!rateLimit.allowed) {
        return {
          allowed: false,
          reason: 'phone_rate_limit',
          retryAfterSeconds: rateLimit.retryAfterSeconds
        };
      }

      if (!messageSid && body) {
        const fingerprint = hashFingerprint([from, to || '', body]);

        if (seenDuplicateFingerprint(fingerprint)) {
          return {
            allowed: false,
            reason: 'duplicate_body'
          };
        }
      }

      return {
        allowed: true
      };
    },

    checkVoice({ from, callSid = null, eventType = 'voice' }) {
      const phoneKey = `${eventType}:${from}`;
      const rateLimit = counters.register(phoneKey, voiceWindowMs, voiceMaxPerPhone);

      if (!rateLimit.allowed) {
        return {
          allowed: false,
          reason: 'phone_rate_limit',
          retryAfterSeconds: rateLimit.retryAfterSeconds
        };
      }

      if (callSid && seenDuplicateFingerprint(hashFingerprint([eventType, from, callSid]))) {
        return {
          allowed: false,
          reason: 'duplicate_event'
        };
      }

      return {
        allowed: true
      };
    }
  };
}

export function isSelfOriginPhone({ from, businessPhone, twilioPhone, forwardingPhone }) {
  const protectedPhones = new Set(
    [businessPhone, twilioPhone, forwardingPhone].filter(Boolean).map(normalizePhoneNumber)
  );

  return protectedPhones.has(normalizePhoneNumber(from));
}

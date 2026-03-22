import dotenv from 'dotenv';

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function clamp(value, min, max, fallback) {
  const parsed = toNumber(value, fallback);
  return Math.min(Math.max(parsed, min), max);
}

function normalizeAppUrl(value, fallbackPort) {
  const fallback = `http://localhost:${fallbackPort}`;

  if (!value) {
    return fallback;
  }

  try {
    return new URL(value).toString();
  } catch {
    return fallback;
  }
}

function normalizeOptionalUrl(value) {
  if (!value) {
    return '';
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function normalizeBodyLimit(value, fallback = '32kb') {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
  return /^\d+(b|kb|mb)?$/.test(normalized) ? normalized : fallback;
}

const resolvedPort = toNumber(process.env.PORT, 3000);
const normalizedApiBaseUrl = normalizeOptionalUrl(process.env.API_BASE_URL);
const nodeEnv = process.env.NODE_ENV || 'development';
const twilioSignatureValidationDefault = nodeEnv === 'production';

export const env = {
  nodeEnv,
  port: resolvedPort,
  appUrl: normalizeAppUrl(process.env.APP_URL || normalizedApiBaseUrl, resolvedPort),
  frontendAppUrl: normalizeOptionalUrl(process.env.FRONTEND_APP_URL),
  apiBaseUrl: normalizedApiBaseUrl || '',
  databasePath:
    process.env.DATABASE_PATH ||
    (process.env.VERCEL ? '/tmp/omnitoolset.sqlite' : './data/omnitoolset.sqlite'),
  defaultBusiness: {
    name: process.env.DEFAULT_BUSINESS_NAME || 'Northstar Health',
    slug: process.env.DEFAULT_BUSINESS_SLUG || 'northstar-health',
    twilioPhone:
      process.env.DEFAULT_BUSINESS_PHONE || process.env.TWILIO_PHONE_NUMBER || '+15551234567',
    businessType: process.env.BUSINESS_TYPE || 'local service business',
    timezone: process.env.BUSINESS_TIMEZONE || 'America/New_York',
    forwardingPhone: process.env.BUSINESS_FORWARDING_PHONE || '',
    servicesSummary: process.env.BUSINESS_SERVICES || 'Consultations and appointment scheduling',
    hoursSummary: process.env.BUSINESS_HOURS || 'Mon-Fri, 9:00 AM to 5:00 PM',
    priceSummary:
      process.env.BUSINESS_PRICE_SUMMARY ||
      'Pricing depends on the service, and we can confirm the right visit before booking.',
    bookingDurationMinutes: clamp(process.env.BOOKING_DURATION_MINUTES, 15, 180, 45),
    bookingWindowDays: clamp(process.env.BOOKING_WINDOW_DAYS, 3, 30, 10)
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    validateSignatures: toBoolean(
      process.env.TWILIO_VALIDATE_SIGNATURES,
      twilioSignatureValidationDefault
    ),
    phoneNumber:
      process.env.TWILIO_PHONE_NUMBER || process.env.DEFAULT_BUSINESS_PHONE || '+15551234567'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: clamp(process.env.OPENAI_TEMPERATURE, 0, 1.2, 0.7),
    maxTokens: clamp(process.env.OPENAI_MAX_TOKENS, 40, 160, 90),
    timeoutMs: clamp(process.env.OPENAI_TIMEOUT_MS, 2000, 20000, 8000)
  },
  security: {
    requestBodyLimit: normalizeBodyLimit(process.env.REQUEST_BODY_LIMIT, '32kb'),
    smsMaxBodyChars: clamp(process.env.SMS_MAX_BODY_CHARS, 80, 1600, 600),
    smsRateLimitWindowMs: clamp(process.env.SMS_RATE_LIMIT_WINDOW_MS, 10000, 3600000, 300000),
    smsRateLimitMax: clamp(process.env.SMS_RATE_LIMIT_MAX, 2, 40, 12),
    voiceRateLimitWindowMs: clamp(
      process.env.VOICE_RATE_LIMIT_WINDOW_MS,
      10000,
      3600000,
      300000
    ),
    voiceRateLimitMax: clamp(process.env.VOICE_RATE_LIMIT_MAX, 1, 20, 6),
    duplicateMessageWindowMs: clamp(
      process.env.SMS_DUPLICATE_WINDOW_MS,
      1000,
      300000,
      30000
    )
  }
};

export function getDefaultBusinessSeed() {
  return {
    name: env.defaultBusiness.name,
    slug: env.defaultBusiness.slug,
    twilioPhone: env.defaultBusiness.twilioPhone,
    businessType: env.defaultBusiness.businessType,
    timezone: env.defaultBusiness.timezone,
    forwardingPhone: env.defaultBusiness.forwardingPhone,
    servicesSummary: env.defaultBusiness.servicesSummary,
    hoursSummary: env.defaultBusiness.hoursSummary,
    priceSummary: env.defaultBusiness.priceSummary,
    bookingDurationMinutes: env.defaultBusiness.bookingDurationMinutes,
    bookingWindowDays: env.defaultBusiness.bookingWindowDays
  };
}

export function hasTwilioCredentials() {
  return Boolean(env.twilio.accountSid && env.twilio.authToken && env.twilio.phoneNumber);
}

export function hasOpenAICredentials() {
  return Boolean(env.openai.apiKey);
}

export function assertCriticalEnvironment() {
  if (env.twilio.validateSignatures && !env.twilio.authToken) {
    throw new Error(
      'TWILIO_VALIDATE_SIGNATURES is enabled, but TWILIO_AUTH_TOKEN is missing.'
    );
  }
}

export function getEnvironmentWarnings() {
  const warnings = [];

  if (env.nodeEnv === 'production' && !env.frontendAppUrl) {
    warnings.push('FRONTEND_APP_URL is not set. Hybrid form redirects may not return to the frontend.');
  }

  if (env.nodeEnv === 'production' && !env.twilio.validateSignatures) {
    warnings.push('TWILIO_VALIDATE_SIGNATURES is disabled. Twilio webhooks will not be verified.');
  }

  if (env.nodeEnv === 'production' && !hasTwilioCredentials()) {
    warnings.push('Twilio REST credentials are incomplete. Missed-call auto-SMS delivery will be simulated.');
  }

  if (!hasOpenAICredentials()) {
    warnings.push('OPENAI_API_KEY is missing. SMS replies will use the local fallback responder.');
  }

  if (
    env.nodeEnv === 'production' &&
    (env.databasePath.startsWith('./data') || env.databasePath.startsWith('/tmp'))
  ) {
    warnings.push(
      'DATABASE_PATH looks ephemeral for production. Use a persistent disk or external database.'
    );
  }

  if (
    hasTwilioCredentials() &&
    env.twilio.phoneNumber &&
    env.defaultBusiness.twilioPhone &&
    env.twilio.phoneNumber !== env.defaultBusiness.twilioPhone
  ) {
    warnings.push(
      'TWILIO_PHONE_NUMBER and DEFAULT_BUSINESS_PHONE differ. Inbound and outbound traffic may attach to different businesses.'
    );
  }

  return warnings;
}

import dotenv from 'dotenv';

import { PRIMARY_DOMAIN } from '@omnitoolset/shared/products';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || undefined });

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

function normalizeUrl(value, fallback = '') {
  if (!value) {
    return fallback;
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

function normalizeBodyLimit(value, fallback = '32kb') {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, '');
  return /^\d+(b|kb|mb)?$/.test(normalized) ? normalized : fallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 4000),
  appUrl: normalizeUrl(process.env.APP_URL, 'http://localhost:4000'),
  frontendAppUrl: normalizeUrl(process.env.FRONTEND_APP_URL, PRIMARY_DOMAIN),
  databaseUrl:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/omnitoolset',
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
    phoneNumber:
      process.env.TWILIO_PHONE_NUMBER || process.env.DEFAULT_BUSINESS_PHONE || '+15551234567',
    validateSignatures: toBoolean(
      process.env.TWILIO_VALIDATE_SIGNATURES,
      process.env.NODE_ENV === 'production'
    )
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: clamp(process.env.OPENAI_TEMPERATURE, 0, 1.2, 0.7),
    maxTokens: clamp(process.env.OPENAI_MAX_TOKENS, 40, 160, 90),
    timeoutMs: clamp(process.env.OPENAI_TIMEOUT_MS, 2000, 20000, 8000)
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceId: process.env.STRIPE_PRICE_ID || ''
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

export function getDefaultBusinessSeed(overrides = {}) {
  return {
    ...env.defaultBusiness,
    status: 'demo',
    twilioPhone: null,
    ...overrides
  };
}

export function hasOpenAICredentials() {
  return Boolean(env.openai.apiKey);
}

export function hasTwilioCredentials() {
  return Boolean(env.twilio.accountSid && env.twilio.authToken && env.twilio.phoneNumber);
}

export function hasStripeCredentials() {
  return Boolean(env.stripe.secretKey && env.stripe.webhookSecret && env.stripe.priceId);
}

export function sanitizeReturnTo(value, defaultPath = '/') {
  if (!value) {
    return defaultPath;
  }

  if (value.startsWith('/')) {
    return value;
  }

  try {
    const url = new URL(value);
    const frontendOrigin = new URL(env.frontendAppUrl).origin;
    return url.origin === frontendOrigin ? `${url.pathname}${url.search}${url.hash}` : defaultPath;
  } catch {
    return defaultPath;
  }
}

export function assertCriticalEnvironment() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  if (env.twilio.validateSignatures && !env.twilio.authToken) {
    throw new Error(
      'TWILIO_VALIDATE_SIGNATURES is enabled, but TWILIO_AUTH_TOKEN is missing.'
    );
  }
}

export function getEnvironmentWarnings() {
  const warnings = [];

  if (env.nodeEnv === 'production' && !env.frontendAppUrl) {
    warnings.push('FRONTEND_APP_URL is missing. Access-request redirects may be broken.');
  }

  if (env.nodeEnv === 'production' && !env.twilio.validateSignatures) {
    warnings.push('TWILIO_VALIDATE_SIGNATURES is disabled.');
  }

  if (!hasOpenAICredentials()) {
    warnings.push('OPENAI_API_KEY is missing. SMS replies will use fallback text.');
  }

  if (!hasTwilioCredentials()) {
    warnings.push('Twilio REST credentials are incomplete. Outbound SMS delivery will be simulated.');
  }

  if (!hasStripeCredentials()) {
    warnings.push('Stripe billing is not fully configured. Checkout and webhook handling will be unavailable.');
  }

  return warnings;
}

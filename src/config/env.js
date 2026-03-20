import dotenv from 'dotenv';

dotenv.config();

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max, fallback) {
  const parsed = toNumber(value, fallback);
  return Math.min(Math.max(parsed, min), max);
}

export const env = {
  port: toNumber(process.env.PORT, 3000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databasePath:
    process.env.DATABASE_PATH ||
    (process.env.VERCEL ? '/tmp/omnitoolset.sqlite' : './data/omnitoolset.sqlite'),
  defaultBusiness: {
    name: process.env.DEFAULT_BUSINESS_NAME || 'Northstar Health',
    slug: process.env.DEFAULT_BUSINESS_SLUG || 'northstar-health',
    twilioPhone:
      process.env.DEFAULT_BUSINESS_PHONE || process.env.TWILIO_PHONE_NUMBER || '+15551234567',
    timezone: process.env.BUSINESS_TIMEZONE || 'America/New_York',
    forwardingPhone: process.env.BUSINESS_FORWARDING_PHONE || '',
    servicesSummary: process.env.BUSINESS_SERVICES || 'Consultations and appointment scheduling',
    hoursSummary: process.env.BUSINESS_HOURS || 'Mon-Fri, 9:00 AM to 5:00 PM',
    bookingDurationMinutes: clamp(process.env.BOOKING_DURATION_MINUTES, 15, 180, 45),
    bookingWindowDays: clamp(process.env.BOOKING_WINDOW_DAYS, 3, 30, 10)
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber:
      process.env.TWILIO_PHONE_NUMBER || process.env.DEFAULT_BUSINESS_PHONE || '+15551234567'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: clamp(process.env.OPENAI_TEMPERATURE, 0, 1.2, 0.7)
  }
};

export function getDefaultBusinessSeed() {
  return {
    name: env.defaultBusiness.name,
    slug: env.defaultBusiness.slug,
    twilioPhone: env.defaultBusiness.twilioPhone,
    timezone: env.defaultBusiness.timezone,
    forwardingPhone: env.defaultBusiness.forwardingPhone,
    servicesSummary: env.defaultBusiness.servicesSummary,
    hoursSummary: env.defaultBusiness.hoursSummary,
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

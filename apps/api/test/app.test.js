import test from 'node:test';
import assert from 'node:assert/strict';

import request from 'supertest';

import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { createBillingService } from '../src/modules/billing/service.js';
import { createSmsAssistantService } from '../src/modules/sms_assistant/service.js';
import { createFakeRepositories, createFakeStripe } from './helpers/fake-platform.js';

test('health endpoint responds with ok', async () => {
  const app = createApp({ repositories: createFakeRepositories() });
  const response = await request(app).get('/health');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.ok(response.headers['x-request-id']);
});

test('sms status endpoint exposes safe runtime diagnostics', async () => {
  const repositories = createFakeRepositories();
  const app = createApp({ repositories });

  const response = await request(app).get('/api/sms-assistant/status');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.implemented, true);
  assert.equal(response.body.diagnostics.hasTwilio, Boolean(env.twilio.accountSid && env.twilio.authToken && env.twilio.phoneNumber));
  assert.equal(response.body.diagnostics.activeBusinessMapped, false);
  assert.equal(response.body.diagnostics.mappedBusinessStatus, null);
});

test('api responds to allowed CORS preflight requests', async () => {
  const app = createApp({ repositories: createFakeRepositories() });
  const response = await request(app)
    .options('/api/billing/checkout-sessions')
    .set('Origin', 'https://omnitoolset.com')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');

  assert.equal(response.statusCode, 204);
  assert.equal(response.headers['access-control-allow-origin'], 'https://omnitoolset.com');
});

test('access request endpoint stores beta interest', async () => {
  const repositories = createFakeRepositories();
  const app = createApp({ repositories });

  const response = await request(app).post('/api/access-requests').send({
    productSlug: 'review-booster',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    companyName: 'Northstar Health',
    note: 'Interested in post-visit review requests.'
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.ok, true);
  assert.equal(repositories.__store.accessRequests.length, 1);
  assert.equal(repositories.__store.accessRequests[0].requestType, 'beta');
});

test('sms simulate endpoint offers booking slots', async () => {
  const app = createApp({ repositories: createFakeRepositories() });

  const response = await request(app).post('/api/sms-assistant/simulate').send({
    from: '+15550000001',
    to: '+15551234567',
    body: 'Can I book for tomorrow afternoon?'
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.planType, 'offer_slots');
  assert.match(response.body.replyText, /which|can do|happy to help/i);
});

test('billing checkout session endpoint returns a hosted Stripe url', async () => {
  const previousStripeEnv = { ...env.stripe };
  env.stripe.secretKey = 'sk_test_123';
  env.stripe.priceId = 'price_test_123';
  env.stripe.webhookSecret = 'whsec_test_123';

  const app = createApp({
    repositories: createFakeRepositories(),
    stripe: createFakeStripe()
  });

  const response = await request(app).post('/api/billing/checkout-sessions').send({
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    companyName: 'Northstar Health'
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.checkoutUrl, 'https://checkout.stripe.test/session');

  env.stripe.secretKey = previousStripeEnv.secretKey;
  env.stripe.priceId = previousStripeEnv.priceId;
  env.stripe.webhookSecret = previousStripeEnv.webhookSecret;
});

test('billing service activates customer, business, and subscription from checkout completion', async () => {
  const previousStripeEnv = { ...env.stripe };
  env.stripe.secretKey = 'sk_test_123';
  env.stripe.priceId = 'price_test_123';
  env.stripe.webhookSecret = 'whsec_test_123';

  const repositories = createFakeRepositories();
  const service = createBillingService({
    repositories,
    stripe: createFakeStripe()
  });

  await service.handleStripeEvent({
    type: 'checkout.session.completed',
    data: {
      object: {
        mode: 'subscription',
        id: 'cs_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        customer_details: {
          email: 'jordan@example.com',
          name: 'Jordan Lee'
        },
        metadata: {
          company_name: 'Northstar Health',
          contact_name: 'Jordan Lee'
        }
      }
    }
  });

  assert.equal(repositories.__store.customers.length, 1);
  assert.equal(repositories.__store.subscriptions.length, 1);
  assert.equal(repositories.__store.businesses.length, 2);
  assert.equal(repositories.__store.subscriptions[0].stripeSubscriptionId, 'sub_test_123');

  env.stripe.secretKey = previousStripeEnv.secretKey;
  env.stripe.priceId = previousStripeEnv.priceId;
  env.stripe.webhookSecret = previousStripeEnv.webhookSecret;
});

test('sms onboarding session endpoint returns checkout-linked context', async () => {
  const previousStripeEnv = { ...env.stripe };
  env.stripe.secretKey = 'sk_test_123';
  env.stripe.priceId = 'price_test_123';
  env.stripe.webhookSecret = 'whsec_test_123';

  const app = createApp({
    repositories: createFakeRepositories(),
    stripe: createFakeStripe()
  });

  const response = await request(app).get('/api/sms-assistant/onboarding/session?session_id=cs_test_123');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.business.name, 'Northstar Health');

  env.stripe.secretKey = previousStripeEnv.secretKey;
  env.stripe.priceId = previousStripeEnv.priceId;
  env.stripe.webhookSecret = previousStripeEnv.webhookSecret;
});

test('sms onboarding submission activates the business', async () => {
  const previousStripeEnv = { ...env.stripe };
  env.stripe.secretKey = 'sk_test_123';
  env.stripe.priceId = 'price_test_123';
  env.stripe.webhookSecret = 'whsec_test_123';

  const repositories = createFakeRepositories();
  const app = createApp({
    repositories,
    stripe: createFakeStripe()
  });

  const response = await request(app).post('/api/sms-assistant/onboarding').send({
    sessionId: 'cs_test_123',
    businessName: 'Northstar Health',
    ownerName: 'Jordan Lee',
    email: 'jordan@example.com',
    phoneNumber: '+15550000001',
    businessType: 'Health clinic',
    workingHours: 'Mon-Fri, 9:00 AM to 5:00 PM',
    pricingInfo: 'Visits start at $75.'
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.status, 'active');
  assert.equal(repositories.__store.businesses[1].contactPhone, '+15550000001');
  assert.equal(repositories.__store.businesses[1].twilioPhone, env.twilio.phoneNumber);

  env.stripe.secretKey = previousStripeEnv.secretKey;
  env.stripe.priceId = previousStripeEnv.priceId;
  env.stripe.webhookSecret = previousStripeEnv.webhookSecret;
});

test('sms settings endpoint returns business details and recent conversations', async () => {
  const previousStripeEnv = { ...env.stripe };
  env.stripe.secretKey = 'sk_test_123';
  env.stripe.priceId = 'price_test_123';
  env.stripe.webhookSecret = 'whsec_test_123';

  const repositories = createFakeRepositories();
  const smsService = createSmsAssistantService({ repositories });

  await createBillingService({
    repositories,
    stripe: createFakeStripe()
  }).submitSmsOnboarding({
    sessionId: 'cs_test_123',
    businessName: 'Northstar Health',
    ownerName: 'Jordan Lee',
    email: 'jordan@example.com',
    phoneNumber: '+15550000001',
    businessType: 'Health clinic',
    workingHours: 'Mon-Fri, 9:00 AM to 5:00 PM',
    pricingInfo: 'Visits start at $75.'
  });

  await smsService.handleIncomingSms(
    {
      from: '+15550000999',
      to: env.twilio.phoneNumber,
      body: 'Can I book tomorrow afternoon?',
      messageSid: 'SM_settings_001'
    },
    {
      allowFallbackBusiness: false
    }
  );

  const app = createApp({
    repositories,
    stripe: createFakeStripe()
  });

  const response = await request(app).get('/api/sms-assistant/settings?session_id=cs_test_123');

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.business.name, 'Northstar Health');
  assert.equal(response.body.business.phoneNumber, '+15550000001');
  assert.equal(response.body.business.automationEnabled, true);
  assert.equal(response.body.recentConversations.length, 1);
  assert.match(response.body.recentConversations[0].lastMessageText, /which|can do|happy to help/i);

  env.stripe.secretKey = previousStripeEnv.secretKey;
  env.stripe.priceId = previousStripeEnv.priceId;
  env.stripe.webhookSecret = previousStripeEnv.webhookSecret;
});

test('sms settings update persists working hours, pricing note, and automation toggle', async () => {
  const previousStripeEnv = { ...env.stripe };
  env.stripe.secretKey = 'sk_test_123';
  env.stripe.priceId = 'price_test_123';
  env.stripe.webhookSecret = 'whsec_test_123';

  const repositories = createFakeRepositories();
  const app = createApp({
    repositories,
    stripe: createFakeStripe()
  });

  await request(app).post('/api/sms-assistant/onboarding').send({
    sessionId: 'cs_test_123',
    businessName: 'Northstar Health',
    ownerName: 'Jordan Lee',
    email: 'jordan@example.com',
    phoneNumber: '+15550000001',
    businessType: 'Health clinic',
    workingHours: 'Mon-Fri, 9:00 AM to 5:00 PM',
    pricingInfo: 'Visits start at $75.'
  });

  const response = await request(app).post('/api/sms-assistant/settings').send({
    sessionId: 'cs_test_123',
    workingHours: 'Mon-Sat, 8:00 AM to 6:00 PM',
    pricingInfo: 'Most visits start at $89.',
    automationEnabled: false
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.business.workingHours, 'Mon-Sat, 8:00 AM to 6:00 PM');
  assert.equal(response.body.business.pricingInfo, 'Most visits start at $89.');
  assert.equal(response.body.business.automationEnabled, false);
  assert.equal(repositories.__store.businesses[1].automationEnabled, false);

  env.stripe.secretKey = previousStripeEnv.secretKey;
  env.stripe.priceId = previousStripeEnv.priceId;
  env.stripe.webhookSecret = previousStripeEnv.webhookSecret;
});

test('sms assistant logs inbound messages without replying when automation is disabled', async () => {
  const repositories = createFakeRepositories();
  const smsService = createSmsAssistantService({ repositories });

  repositories.__store.businesses.push({
    id: 2,
    name: 'Live Clinic',
    slug: 'live-clinic',
    ownerCustomerId: 1,
    ownerName: 'Jordan Lee',
    contactEmail: 'jordan@example.com',
    contactPhone: '+15550000001',
    twilioPhone: env.twilio.phoneNumber,
    timezone: 'America/New_York',
    forwardingPhone: '+15550000001',
    businessType: 'Health clinic',
    servicesSummary: 'Consultations',
    hoursSummary: 'Mon-Fri, 9:00 AM to 5:00 PM',
    priceSummary: 'Visits start at $75.',
    automationEnabled: false,
    status: 'active',
    bookingDurationMinutes: 45,
    bookingWindowDays: 10,
    onboardingCompletedAt: new Date().toISOString()
  });

  const result = await smsService.handleIncomingSms(
    {
      from: '+15550000888',
      to: env.twilio.phoneNumber,
      body: 'Hi, I need help booking',
      messageSid: 'SM_settings_automation_off'
    },
    {
      allowFallbackBusiness: false
    }
  );

  assert.equal(result.automationDisabled, true);
  assert.equal(result.replyText, null);
  assert.equal(repositories.__store.messages.length, 1);
  assert.equal(repositories.__store.messages[0].direction, 'inbound');
});

import fs from 'fs';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';

import request from 'supertest';
import twilio from 'twilio';

const testDatabasePath = path.resolve(process.cwd(), 'data', 'test-suite.sqlite');

fs.rmSync(testDatabasePath, { force: true });

process.env.DATABASE_PATH = testDatabasePath;
process.env.APP_URL = 'http://localhost:3001';
process.env.DEFAULT_BUSINESS_PHONE = '+15551234567';
process.env.BUSINESS_TYPE = 'local health clinic';
process.env.BUSINESS_PRICE_SUMMARY =
  'Most visits start at $75, and exact pricing depends on the service.';

const { env } = await import('../src/config/env.js');
const { createApp } = await import('../src/app.js');
const { app, repositories } = createApp();

test('homepage lists all five products', async () => {
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
  assert.match(response.text, /OmniToolset/);
  assert.match(response.text, /AI tools that help your business grow automatically\./);
  assert.match(response.text, /SMS AI Assistant/);
  assert.match(response.text, /Review Booster/);
  assert.match(response.text, /Follow-up Automation/);
  assert.match(response.text, /Lead Capture AI/);
  assert.match(response.text, /Inbox \/ Simple CRM/);
  assert.match(response.text, /Get Started/);
  assert.match(response.text, /Join Beta/);
  assert.match(response.text, /Join Waitlist/);
});

test('sms product page does not expose internal webhook docs publicly', async () => {
  const response = await request(app).get('/products/sms-ai-assistant');

  assert.equal(response.status, 200);
  assert.match(response.text, /Request Demo/);
  assert.doesNotMatch(response.text, /Webhook endpoints/);
  assert.doesNotMatch(response.text, /Local test commands/);
  assert.doesNotMatch(response.text, /localhost:3000/);
});

test('beta and coming soon product pages show honest CTA labels', async () => {
  const betaResponse = await request(app).get('/products/review-booster');
  const comingSoonResponse = await request(app).get('/products/lead-capture-ai');

  assert.equal(betaResponse.status, 200);
  assert.match(betaResponse.text, /Join Beta/);
  assert.match(betaResponse.text, /Beta/);

  assert.equal(comingSoonResponse.status, 200);
  assert.match(comingSoonResponse.text, /Join Waitlist/);
  assert.match(comingSoonResponse.text, /Coming Soon/);
});

test('scaffold module exposes a placeholder status endpoint', async () => {
  const response = await request(app).get('/api/review-booster/status');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'Beta');
  assert.equal(response.body.implemented, false);
});

test('access request form accepts unfinished products and stores the request', async () => {
  const response = await request(app)
    .post('/access-requests')
    .type('form')
    .send({
      productSlug: 'lead-capture-ai',
      returnTo: '/products/lead-capture-ai',
      name: 'Alex Morgan',
      email: 'alex@example.com',
      company: 'Northstar Health',
      note: 'Interested in the first beta wave.'
    });

  assert.equal(response.status, 303);
  assert.match(response.headers.location, /access=success/);

  const storedRequests = repositories.accessRequests.listByProduct('lead-capture-ai');
  assert.equal(storedRequests.length, 1);
  assert.equal(storedRequests[0].request_type, 'waitlist');
  assert.equal(storedRequests[0].company, 'Northstar Health');
});

test('access request API validates input and returns a success payload', async () => {
  const invalidResponse = await request(app).post('/api/access-requests').send({
    productSlug: 'review-booster',
    name: 'Alex Morgan',
    email: 'invalid-email'
  });

  assert.equal(invalidResponse.status, 400);
  assert.equal(invalidResponse.body.ok, false);
  assert.match(invalidResponse.body.fieldErrors.company, /company name/i);

  const validResponse = await request(app).post('/api/access-requests').send({
    productSlug: 'review-booster',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    company: 'Northstar Health',
    note: 'Please invite us to the beta.'
  });

  assert.equal(validResponse.status, 201);
  assert.equal(validResponse.body.ok, true);
  assert.equal(validResponse.body.product.requestType, 'beta');
});

test('sms assistant offers slots and confirms a booking', async () => {
  const firstResponse = await request(app)
    .post('/api/sms-assistant/webhooks/sms')
    .type('form')
    .send({
      From: '+15550000001',
      To: '+15551234567',
      Body: 'Hi, I need an appointment tomorrow afternoon',
      MessageSid: 'SM-test-001'
    });

  assert.equal(firstResponse.status, 200);
  assert.match(firstResponse.text, /Which one works better|Which works better/);

  const secondResponse = await request(app)
    .post('/api/sms-assistant/webhooks/sms')
    .type('form')
    .send({
      From: '+15550000001',
      To: '+15551234567',
      Body: 'The first one works for me',
      MessageSid: 'SM-test-002'
    });

  assert.equal(secondResponse.status, 200);
  assert.match(secondResponse.text, /booked for/i);

  const statusResponse = await request(app).get('/api/sms-assistant/status');

  assert.equal(statusResponse.status, 200);
  assert.equal(statusResponse.body.status, 'Live');
  assert.equal(statusResponse.body.implemented, true);
});

test('missed call flow returns TwiML and stores the follow-up attempt', async () => {
  const beforeCount = repositories.messages.countAll();

  const response = await request(app)
    .post('/api/sms-assistant/webhooks/voice/dial-result')
    .type('form')
    .send({
      From: '+15550000002',
      To: '+15551234567',
      CallSid: 'CA-test-001',
      DialCallStatus: 'no-answer'
    });

  assert.equal(response.status, 200);
  assert.match(response.text, /Sorry we missed your call/i);
  assert.ok(repositories.messages.countAll() >= beforeCount + 2);
});

test('sms assistant answers pricing simply and nudges toward booking', async () => {
  const response = await request(app)
    .post('/api/sms-assistant/webhooks/sms')
    .type('form')
    .send({
      From: '+15550000003',
      To: '+15551234567',
      Body: 'How much is it?',
      MessageSid: 'SM-test-003'
    });

  assert.equal(response.status, 200);
  assert.match(response.text, /start at \$75/i);
  assert.match(response.text, /I can do|help you find a time/i);
});

test('sms assistant asks one short clarifying question when the user is unclear', async () => {
  const response = await request(app)
    .post('/api/sms-assistant/webhooks/sms')
    .type('form')
    .send({
      From: '+15550000004',
      To: '+15551234567',
      Body: 'Hi',
      MessageSid: 'SM-test-004'
    });

  assert.equal(response.status, 200);
  assert.match(response.text, /Are you looking to book/i);
});

test('sms assistant ends politely when the customer says not now', async () => {
  const response = await request(app)
    .post('/api/sms-assistant/webhooks/sms')
    .type('form')
    .send({
      From: '+15550000005',
      To: '+15551234567',
      Body: 'Not now, maybe later',
      MessageSid: 'SM-test-005'
    });

  assert.equal(response.status, 200);
  assert.match(response.text, /No problem/i);
  assert.doesNotMatch(response.text, /Which one works better/i);
});

test('sms webhook rejects unsigned requests when Twilio signature validation is enabled', async () => {
  const previousValidation = env.twilio.validateSignatures;
  const previousAuthToken = env.twilio.authToken;

  env.twilio.validateSignatures = true;
  env.twilio.authToken = 'test-auth-token';

  try {
    const response = await request(app)
      .post('/api/sms-assistant/webhooks/sms')
      .set('Host', 'localhost:3001')
      .set('X-Forwarded-Proto', 'http')
      .type('form')
      .send({
        From: '+15550000006',
        To: '+15551234567',
        Body: 'Hello there',
        MessageSid: 'SM-test-unsigned'
      });

    assert.equal(response.status, 403);
  } finally {
    env.twilio.validateSignatures = previousValidation;
    env.twilio.authToken = previousAuthToken;
  }
});

test('sms webhook accepts a valid Twilio signature when validation is enabled', async () => {
  const previousValidation = env.twilio.validateSignatures;
  const previousAuthToken = env.twilio.authToken;
  const authToken = 'test-auth-token';
  const formBody = {
    From: '+15550000007',
    To: '+15551234567',
    Body: 'Hi, can I book tomorrow morning?',
    MessageSid: 'SM-test-signed'
  };
  const webhookUrl = 'http://localhost:3001/api/sms-assistant/webhooks/sms';
  const signature = twilio.getExpectedTwilioSignature(authToken, webhookUrl, formBody);

  env.twilio.validateSignatures = true;
  env.twilio.authToken = authToken;

  try {
    const response = await request(app)
      .post('/api/sms-assistant/webhooks/sms')
      .set('Host', 'localhost:3001')
      .set('X-Forwarded-Proto', 'http')
      .set('X-Twilio-Signature', signature)
      .type('form')
      .send(formBody);

    assert.equal(response.status, 200);
    assert.match(response.text, /Which one works better|Which works better|What day or time works best/i);
  } finally {
    env.twilio.validateSignatures = previousValidation;
    env.twilio.authToken = previousAuthToken;
  }
});

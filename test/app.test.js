import fs from 'fs';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';

import request from 'supertest';

const testDatabasePath = path.resolve(process.cwd(), 'data', 'test-suite.sqlite');

fs.rmSync(testDatabasePath, { force: true });

process.env.DATABASE_PATH = testDatabasePath;
process.env.APP_URL = 'http://localhost:3001';
process.env.DEFAULT_BUSINESS_PHONE = '+15551234567';

const { createApp } = await import('../src/app.js');
const { app } = createApp();

test('homepage lists all five products', async () => {
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
  assert.match(response.text, /OmniToolset/);
  assert.match(response.text, /SMS AI Assistant/);
  assert.match(response.text, /Review Booster/);
  assert.match(response.text, /Follow-up Automation/);
  assert.match(response.text, /Lead Capture AI/);
  assert.match(response.text, /Inbox \/ Simple CRM/);
});

test('scaffold module exposes a placeholder status endpoint', async () => {
  const response = await request(app).get('/api/review-booster/status');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'Beta');
  assert.equal(response.body.implemented, false);
});

test('waitlist form accepts unfinished products', async () => {
  const response = await request(app)
    .post('/waitlist')
    .type('form')
    .send({
      productSlug: 'lead-capture-ai',
      returnTo: '/products/lead-capture-ai',
      name: 'Alex Morgan',
      email: 'alex@example.com'
    });

  assert.equal(response.status, 303);
  assert.match(response.headers.location, /waitlist=success/);
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
  assert.ok(statusResponse.body.metrics.confirmedBookings >= 1);
});

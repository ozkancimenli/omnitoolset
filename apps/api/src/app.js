import crypto from 'crypto';

import express from 'express';

import { productCatalog } from '@omnitoolset/shared/products';

import { env } from './config/env.js';
import { createAccessRequestsRouter } from './core/access-requests/controller.js';
import { createAccessRequestService } from './core/access-requests/service.js';
import { createAutomationRouter } from './core/automation/router.js';
import { createAutomationService } from './core/automation/service.js';
import { logger } from './core/logging/logger.js';
import { createRepositories } from './db/index.js';
import { createBillingModule } from './modules/billing/index.js';
import { createFollowUpModule } from './modules/follow_up/index.js';
import { createInboxModule } from './modules/inbox/index.js';
import { createLeadCaptureModule } from './modules/lead_capture/index.js';
import { createReviewBoosterModule } from './modules/review_booster/index.js';
import { createSmsAssistantModule } from './modules/sms_assistant/index.js';

function buildAllowedOrigins() {
  const allowed = new Set([
    env.frontendAppUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ]);

  try {
    const frontendUrl = new URL(env.frontendAppUrl);
    const alternateHost = frontendUrl.hostname.startsWith('www.')
      ? frontendUrl.hostname.replace(/^www\./, '')
      : `www.${frontendUrl.hostname}`;
    allowed.add(`${frontendUrl.protocol}//${alternateHost}`);
  } catch {
    return allowed;
  }

  return allowed;
}

export function createApp({ repositories = createRepositories(), stripe = undefined } = {}) {
  const app = express();
  const requestBodyLimit = env.security.requestBodyLimit;
  const allowedOrigins = buildAllowedOrigins();
  const accessRequestService = createAccessRequestService({ repositories });
  const accessRequestsRouter = createAccessRequestsRouter({ service: accessRequestService });
  const automationService = createAutomationService({ repositories });
  const automationRouter = createAutomationRouter({ service: automationService });
  const billingModule = createBillingModule({ repositories, stripe });
  const smsModule = createSmsAssistantModule({ repositories, billingService: billingModule.service });
  const reviewModule = createReviewBoosterModule();
  const followUpModule = createFollowUpModule();
  const leadCaptureModule = createLeadCaptureModule();
  const inboxModule = createInboxModule();

  app.set('trust proxy', true);

  app.use((req, _res, next) => {
    req.requestId = crypto.randomUUID();
    next();
  });

  app.use((req, res, next) => {
    res.setHeader('X-Request-Id', req.requestId);

    const origin = req.get('origin');

    if (origin && allowedOrigins.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  });

  app.post(
    '/api/billing/webhooks/stripe',
    express.raw({
      type: 'application/json',
      limit: requestBodyLimit
    }),
    billingModule.webhookHandler
  );

  app.use(
    express.json({
      limit: requestBodyLimit
    })
  );
  app.use(
    express.urlencoded({
      extended: false,
      limit: requestBodyLimit
    })
  );

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'omnitoolset-api',
      environment: env.nodeEnv
    });
  });

  app.get('/api/products', (_req, res) => {
    res.json({
      ok: true,
      products: productCatalog
    });
  });

  app.use(accessRequestsRouter);
  app.use('/api/automation', automationRouter);
  app.use('/api/billing', billingModule.router);
  app.use('/api/sms-assistant', smsModule.router);
  app.use('/api/reviews', reviewModule.router);
  app.use('/api/follow-up', followUpModule.router);
  app.use('/api/lead-capture', leadCaptureModule.router);
  app.use('/api/inbox', inboxModule.router);

  app.use((req, res) => {
    res.status(404).json({
      ok: false,
      error: `Route not found: ${req.method} ${req.originalUrl}`
    });
  });

  app.use((error, req, res, _next) => {
    logger.error('api.unhandled_error', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      error: error.message
    });

    res.status(error.statusCode || 500).json({
      ok: false,
      error: error.statusCode && error.statusCode < 500 ? error.message : 'Internal server error.'
    });
  });

  return app;
}

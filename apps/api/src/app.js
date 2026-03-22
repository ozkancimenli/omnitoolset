import crypto from 'crypto';

import express from 'express';

import { productCatalog } from '@omnitoolset/shared/products';

import { env } from './config/env.js';
import { createAccessRequestsRouter } from './core/access-requests/controller.js';
import { createAccessRequestService } from './core/access-requests/service.js';
import { logger } from './core/logging/logger.js';
import { createRepositories } from './db/index.js';
import { createBillingModule } from './modules/billing/index.js';
import { createFollowUpModule } from './modules/follow_up/index.js';
import { createInboxModule } from './modules/inbox/index.js';
import { createLeadCaptureModule } from './modules/lead_capture/index.js';
import { createReviewBoosterModule } from './modules/review_booster/index.js';
import { createSmsAssistantModule } from './modules/sms_assistant/index.js';

export function createApp({ repositories = createRepositories(), stripe = undefined } = {}) {
  const app = express();
  const requestBodyLimit = env.security.requestBodyLimit;
  const accessRequestService = createAccessRequestService({ repositories });
  const accessRequestsRouter = createAccessRequestsRouter({ service: accessRequestService });
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

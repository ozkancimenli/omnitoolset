import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { env } from './config/env.js';
import { homepageHeadline, productCatalog } from './config/product-catalog.js';
import { logger } from './core/logging/logger.js';
import { createModuleRegistry } from './core/modules/registry.js';
import { createPlatformRouter } from './core/platform/router.js';
import { bootstrapDatabase, createRepositories } from './db/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let appContext;

function captureRawBody(req, _res, buffer) {
  if (buffer?.length) {
    req.rawBody = buffer.toString('utf8');
  }
}

function resolveRequestId(headerValue) {
  if (typeof headerValue === 'string' && /^[A-Za-z0-9._-]{8,120}$/.test(headerValue)) {
    return headerValue;
  }

  return randomUUID();
}

export function createApp() {
  if (appContext) {
    return appContext;
  }

  const app = express();
  app.set('trust proxy', true);
  const repositories = createRepositories();

  bootstrapDatabase(repositories);

  const modules = createModuleRegistry({ repositories });

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use((req, res, next) => {
    const requestId = resolveRequestId(req.get('x-request-id'));
    req.requestId = requestId;
    res.set('X-Request-Id', requestId);
    next();
  });

  app.use(express.urlencoded({ extended: false, limit: env.security.requestBodyLimit, verify: captureRawBody }));
  app.use(express.json({ limit: env.security.requestBodyLimit, verify: captureRawBody }));
  app.use(express.static(path.join(__dirname, '../public')));

  app.locals.siteName = 'OmniToolset';
  app.locals.productCatalog = productCatalog;
  app.locals.homepageHeadline = homepageHeadline;

  app.use((req, res, next) => {
    res.locals.siteName = 'OmniToolset';
    res.locals.productCatalog = productCatalog;
    res.locals.currentPath = req.path;
    res.locals.requestId = req.requestId;
    next();
  });

  app.use('/', createPlatformRouter({ repositories }));

  for (const module of modules) {
    app.use(module.apiBasePath, module.router);
  }

  app.get('/health', (_req, res) => {
    try {
      const businesses = repositories.businesses.listAll();

      res.json({
        ok: true,
        platform: 'OmniToolset',
        services: {
          database: 'ok'
        },
        counts: {
          businesses: businesses.length
        }
      });
    } catch (error) {
      logger.error('platform.health_check_failed', {
        requestId: _req.requestId,
        error: error.message
      });

      res.status(500).json({
        ok: false,
        platform: 'OmniToolset',
        services: {
          database: 'error'
        }
      });
    }
  });

  app.use((req, res) => {
    res.status(404).render('pages/not-found', {
      pageTitle: 'Not Found',
      pageDescription: 'The requested page could not be found.'
    });
  });

  app.use((error, req, res, _next) => {
    logger.error('platform.unhandled_request_error', {
      requestId: req.requestId,
      path: req.path,
      method: req.method,
      error: error.message
    });

    if (res.headersSent) {
      return;
    }

    if (req.path.startsWith('/api/')) {
      res.status(500).json({
        error: 'Internal server error'
      });
      return;
    }

    res.status(500).render('pages/error', {
      pageTitle: 'Server Error',
      pageDescription: 'Something went wrong while loading OmniToolset.'
    });
  });

  appContext = {
    app,
    repositories,
    modules
  };

  return appContext;
}

export default createApp().app;

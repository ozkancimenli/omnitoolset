import { Router } from 'express';

import { env, sanitizeReturnTo } from '../../config/env.js';
import { logger } from '../logging/logger.js';

function isJsonRequest(req) {
  return req.path.startsWith('/api/') || req.is('application/json');
}

export function createAccessRequestsRouter({ service }) {
  const router = Router();

  async function handleRequest(req, res) {
    try {
      const result = await service.submit(req.body);

      if (isJsonRequest(req)) {
        res.status(201).json({
          ok: true,
          requestId: result.request.id,
          product: result.product.slug,
          requestType: result.request.requestType
        });
        return;
      }

      const targetPath = sanitizeReturnTo(req.body.returnTo || result.product.routePath, '/');
      res.redirect(303, `${env.frontendAppUrl}${targetPath}${targetPath.includes('?') ? '&' : '?'}submitted=1`);
    } catch (error) {
      if (error.name === 'AccessRequestValidationError') {
        if (isJsonRequest(req)) {
          res.status(error.statusCode || 400).json({
            ok: false,
            error: error.message,
            fieldErrors: error.fieldErrors
          });
          return;
        }

        const targetPath = sanitizeReturnTo(req.body.returnTo, '/');
        res.redirect(303, `${env.frontendAppUrl}${targetPath}${targetPath.includes('?') ? '&' : '?'}submitted=0`);
        return;
      }

      logger.error('access_requests.submit_failed', {
        requestId: req.requestId,
        error: error.message
      });

      if (isJsonRequest(req)) {
        res.status(500).json({
          ok: false,
          error: 'Unable to save request right now.'
        });
        return;
      }

      const targetPath = sanitizeReturnTo(req.body.returnTo, '/');
      res.redirect(303, `${env.frontendAppUrl}${targetPath}${targetPath.includes('?') ? '&' : '?'}submitted=0`);
    }
  }

  router.post('/access-requests', handleRequest);
  router.post('/api/access-requests', handleRequest);

  return router;
}

import { Router } from 'express';

import { asyncHandler } from '../../core/http/async-handler.js';
import { logger } from '../../core/logging/logger.js';

export function createBillingRouter({ service }) {
  const router = Router();

  router.post(
    '/checkout-sessions',
    asyncHandler(async (req, res) => {
      try {
        const session = await service.createCheckoutSession(req.body);

        res.status(201).json({
          ok: true,
          sessionId: session.sessionId,
          checkoutUrl: session.checkoutUrl
        });
      } catch (error) {
        if (error.name === 'BillingValidationError') {
          res.status(error.statusCode || 400).json({
            ok: false,
            error: error.message,
            fieldErrors: error.fieldErrors
          });
          return;
        }

        logger.error('billing.checkout_session_failed', {
          requestId: req.requestId,
          error: error.message
        });

        res.status(error.statusCode || 500).json({
          ok: false,
          error: error.statusCode && error.statusCode < 500 ? error.message : 'Unable to start checkout right now.'
        });
      }
    })
  );

  return router;
}

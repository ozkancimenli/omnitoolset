import { logger } from '../../core/logging/logger.js';
import { constructStripeEvent, stripeClient } from '../../integrations/stripe/client.js';
import { createBillingRouter } from './router.js';
import { createBillingService } from './service.js';

export function createBillingModule({ repositories, stripe = stripeClient }) {
  const service = createBillingService({
    repositories,
    stripe
  });

  async function webhookHandler(req, res) {
    const signature = req.get('stripe-signature');

    if (!signature) {
      res.status(400).json({
        ok: false,
        error: 'Missing Stripe signature.'
      });
      return;
    }

    let event;

    try {
      event = constructStripeEvent(req.body, signature);
    } catch (error) {
      logger.warn('billing.webhook_signature_invalid', {
        requestId: req.requestId,
        error: error.message
      });
      res.status(400).json({
        ok: false,
        error: 'Invalid Stripe signature.'
      });
      return;
    }

    try {
      await service.handleStripeEvent(event);
      res.json({ ok: true });
    } catch (error) {
      logger.error('billing.webhook_processing_failed', {
        requestId: req.requestId,
        eventType: event.type,
        error: error.message
      });
      res.status(500).json({
        ok: false,
        error: 'Webhook processing failed.'
      });
    }
  }

  return {
    service,
    router: createBillingRouter({ service }),
    webhookHandler
  };
}

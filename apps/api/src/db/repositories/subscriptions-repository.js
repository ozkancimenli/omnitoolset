import { mapSubscription } from './utils.js';

export function createSubscriptionsRepository(db) {
  return {
    async getByStripeSubscriptionId(stripeSubscriptionId) {
      const result = await db.query(
        'SELECT * FROM subscriptions WHERE stripe_subscription_id = $1 LIMIT 1',
        [stripeSubscriptionId]
      );
      return mapSubscription(result.rows[0]);
    },

    async upsertStripeSubscription({
      customerId = null,
      businessId = null,
      productModule = 'sms_assistant',
      stripeCustomerId,
      stripeSubscriptionId,
      stripeCheckoutSessionId = null,
      stripePriceId = null,
      status = 'active',
      currentPeriodStart = null,
      currentPeriodEnd = null,
      cancelAtPeriodEnd = false,
      metadata = {}
    }) {
      const result = await db.query(
        `
          INSERT INTO subscriptions (
            customer_id,
            business_id,
            product_module,
            stripe_customer_id,
            stripe_subscription_id,
            stripe_checkout_session_id,
            stripe_price_id,
            status,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            metadata
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)
          ON CONFLICT (stripe_subscription_id) DO UPDATE SET
            customer_id = COALESCE(EXCLUDED.customer_id, subscriptions.customer_id),
            business_id = COALESCE(EXCLUDED.business_id, subscriptions.business_id),
            product_module = COALESCE(EXCLUDED.product_module, subscriptions.product_module),
            stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscriptions.stripe_customer_id),
            stripe_checkout_session_id = COALESCE(EXCLUDED.stripe_checkout_session_id, subscriptions.stripe_checkout_session_id),
            stripe_price_id = COALESCE(EXCLUDED.stripe_price_id, subscriptions.stripe_price_id),
            status = COALESCE(EXCLUDED.status, subscriptions.status),
            current_period_start = COALESCE(EXCLUDED.current_period_start, subscriptions.current_period_start),
            current_period_end = COALESCE(EXCLUDED.current_period_end, subscriptions.current_period_end),
            cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, subscriptions.cancel_at_period_end),
            metadata = subscriptions.metadata || EXCLUDED.metadata,
            updated_at = NOW()
          RETURNING *
        `,
        [
          customerId,
          businessId,
          productModule,
          stripeCustomerId,
          stripeSubscriptionId,
          stripeCheckoutSessionId,
          stripePriceId,
          status,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd,
          JSON.stringify(metadata)
        ]
      );

      return mapSubscription(result.rows[0]);
    }
  };
}

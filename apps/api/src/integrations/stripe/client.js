import Stripe from 'stripe';

import { env } from '../../config/env.js';

export const stripeClient = env.stripe.secretKey
  ? new Stripe(env.stripe.secretKey)
  : null;

export function constructStripeEvent(payload, signature) {
  if (!stripeClient) {
    throw new Error('Stripe client is not configured.');
  }

  if (!env.stripe.webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is missing.');
  }

  return stripeClient.webhooks.constructEvent(payload, signature, env.stripe.webhookSecret);
}

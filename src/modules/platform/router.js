import { Router } from 'express';

import { env } from '../../config/env.js';
import {
  getProductBySlug,
  homepageHeadline,
  productCatalog
} from '../../config/products.js';
import { asyncHandler } from '../../core/http/async-handler.js';

function sanitizeReturnTo(returnTo, fallback) {
  if (!returnTo || typeof returnTo !== 'string') {
    return fallback;
  }

  return returnTo.startsWith('/') ? returnTo : fallback;
}

function getWaitlistSuccessProduct(query) {
  if (query.waitlist !== 'success' || !query.product) {
    return null;
  }

  return getProductBySlug(query.product);
}

function buildSmsPageData(repositories) {
  return {
    stats: {
      openConversations: repositories.conversations.countOpen(),
      totalMessages: repositories.messages.countAll(),
      confirmedBookings: repositories.bookings.countConfirmed()
    },
    webhooks: {
      sms: `${env.appUrl}/api/sms-assistant/webhooks/sms`,
      voiceIncoming: `${env.appUrl}/api/sms-assistant/webhooks/voice/incoming`,
      voiceDialResult: `${env.appUrl}/api/sms-assistant/webhooks/voice/dial-result`
    },
    business: {
      name: env.defaultBusiness.name,
      phone: env.defaultBusiness.twilioPhone || env.twilio.phoneNumber,
      timezone: env.defaultBusiness.timezone,
      forwardingPhone: env.defaultBusiness.forwardingPhone
    }
  };
}

export function createPlatformRouter({ repositories }) {
  const router = Router();

  router.get('/api/products', (_req, res) => {
    res.json({
      platform: 'OmniToolset',
      products: productCatalog
    });
  });

  router.get('/', (req, res) => {
    res.render('pages/home', {
      pageTitle: 'OmniToolset',
      pageDescription: homepageHeadline,
      products: productCatalog,
      liveProduct: getProductBySlug('sms-ai-assistant'),
      waitlistSuccessProduct: getWaitlistSuccessProduct(req.query)
    });
  });

  router.get('/products/:slug', (req, res) => {
    const product = getProductBySlug(req.params.slug);

    if (!product) {
      res.status(404).render('pages/not-found', {
        pageTitle: 'Not Found',
        pageDescription: 'The requested product page does not exist.'
      });
      return;
    }

    res.render('pages/product', {
      pageTitle: `${product.name} | OmniToolset`,
      pageDescription: product.summary,
      product,
      waitlistSuccessProduct: getWaitlistSuccessProduct(req.query),
      smsPageData: product.slug === 'sms-ai-assistant' ? buildSmsPageData(repositories) : null
    });
  });

  router.post(
    '/waitlist',
    asyncHandler(async (req, res) => {
      const product = getProductBySlug(req.body.productSlug);

      if (!product || !product.waitlistEnabled) {
        res.status(400).send('Invalid waitlist request.');
        return;
      }

      if (!req.body.name || !req.body.email) {
        res.status(400).send('Name and email are required.');
        return;
      }

      repositories.waitlist.create({
        productSlug: product.slug,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        notes: req.body.notes
      });

      const returnTo = sanitizeReturnTo(req.body.returnTo, product.path);
      const separator = returnTo.includes('?') ? '&' : '?';
      res.redirect(303, `${returnTo}${separator}waitlist=success&product=${product.slug}`);
    })
  );

  return router;
}

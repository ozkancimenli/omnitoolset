import { Router } from 'express';

import { getProductBySlug, productCatalog } from '../../config/product-catalog.js';
import { asyncHandler } from '../http/async-handler.js';
import {
  buildHomePageViewModel,
  buildProductPageViewModel,
  sanitizeReturnTo
} from './view-models.js';

export function createPlatformRouter({ repositories }) {
  const router = Router();

  router.get('/api/products', (_req, res) => {
    res.json({
      platform: 'OmniToolset',
      products: productCatalog
    });
  });

  router.get('/', (req, res) => {
    res.render('pages/home', buildHomePageViewModel(req.query));
  });

  router.get('/products/:slug', (req, res) => {
    const pageModel = buildProductPageViewModel({
      slug: req.params.slug,
      query: req.query,
      repositories
    });

    if (!pageModel) {
      res.status(404).render('pages/not-found', {
        pageTitle: 'Not Found',
        pageDescription: 'The requested product page does not exist.'
      });
      return;
    }

    res.render('pages/product', pageModel);
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

      const returnTo = sanitizeReturnTo(req.body.returnTo, product.pagePath);
      const separator = returnTo.includes('?') ? '&' : '?';
      res.redirect(303, `${returnTo}${separator}waitlist=success&product=${product.slug}`);
    })
  );

  return router;
}

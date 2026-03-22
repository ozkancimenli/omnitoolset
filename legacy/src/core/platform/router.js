import { Router } from 'express';

import { productCatalog } from '../../config/product-catalog.js';
import { createAccessRequestController } from '../access-requests/controller.js';
import {
  AccessRequestValidationError,
  createAccessRequestService
} from '../access-requests/service.js';
import { asyncHandler } from '../http/async-handler.js';
import { buildHomePageViewModel, buildProductPageViewModel } from './view-models.js';

export function createPlatformRouter({ repositories }) {
  const router = Router();
  const accessRequestService = createAccessRequestService({ repositories });
  const accessRequestController = createAccessRequestController({
    service: accessRequestService
  });

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
      query: req.query
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
    '/access-requests',
    asyncHandler(async (req, res) => {
      try {
        accessRequestController.submitForm(req, res);
      } catch (error) {
        if (error instanceof AccessRequestValidationError) {
          res.status(error.statusCode).send(error.message);
          return;
        }

        throw error;
      }
    })
  );

  router.post(
    '/waitlist',
    asyncHandler(async (req, res) => {
      try {
        accessRequestController.submitForm(req, res);
      } catch (error) {
        if (error instanceof AccessRequestValidationError) {
          res.status(error.statusCode).send(error.message);
          return;
        }

        throw error;
      }
    })
  );

  router.post(
    '/api/access-requests',
    asyncHandler(async (req, res) => {
      try {
        accessRequestController.submitApi(req, res);
      } catch (error) {
        if (error instanceof AccessRequestValidationError) {
          res.status(error.statusCode).json({
            ok: false,
            error: error.message,
            fieldErrors: error.fieldErrors
          });
          return;
        }

        throw error;
      }
    })
  );

  return router;
}

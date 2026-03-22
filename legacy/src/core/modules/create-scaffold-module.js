import { Router } from 'express';

import { PRODUCT_STATUS } from '../../config/product-catalog.js';

function createScaffoldRouter(product) {
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json({
      product: product.name,
      slug: product.slug,
      status: product.status,
      implemented: false,
      message:
        product.status === PRODUCT_STATUS.BETA
          ? 'This beta module is scaffolded and ready for future feature work.'
          : 'This module is intentionally staged as a coming-soon scaffold.',
      plannedCapabilities: product.plannedCapabilities
    });
  });

  return router;
}

export function createScaffoldModule(product) {
  return {
    moduleId: product.moduleId,
    product,
    apiBasePath: product.apiBasePath,
    router: createScaffoldRouter(product)
  };
}

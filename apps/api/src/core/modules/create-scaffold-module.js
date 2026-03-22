import { Router } from 'express';

import { getProductByModuleId } from '@omnitoolset/shared/products';

export function createScaffoldModule(moduleId) {
  const product = getProductByModuleId(moduleId);
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json({
      product: product?.name || moduleId,
      moduleId,
      status: product?.status || 'Scaffold',
      implemented: false,
      note: 'This module is scaffolded for future implementation.'
    });
  });

  return {
    product,
    router
  };
}

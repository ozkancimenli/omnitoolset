import { Router } from 'express';

export function createScaffoldRouter(product) {
  const router = Router();

  router.get('/status', (_req, res) => {
    res.json({
      product: product.name,
      slug: product.slug,
      status: product.status,
      implemented: false,
      message:
        product.status === 'Beta'
          ? 'This beta module is scaffolded and ready for future feature work.'
          : 'This module is intentionally staged as a coming-soon scaffold.',
      plannedCapabilities: product.plannedCapabilities
    });
  });

  return router;
}

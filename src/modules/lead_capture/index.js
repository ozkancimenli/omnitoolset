import { getProductBySlug } from '../../config/products.js';
import { createLeadCaptureRouter } from './router.js';

export function createLeadCaptureModule() {
  const product = getProductBySlug('lead-capture-ai');

  return {
    slug: product.slug,
    apiPath: product.apiPath,
    router: createLeadCaptureRouter()
  };
}

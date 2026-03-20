import { getProductBySlug } from '../../config/products.js';
import { createFollowUpRouter } from './router.js';

export function createFollowUpModule() {
  const product = getProductBySlug('follow-up-automation');

  return {
    slug: product.slug,
    apiPath: product.apiPath,
    router: createFollowUpRouter()
  };
}

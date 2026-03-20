import { getProductBySlug } from '../../config/products.js';
import { createInboxRouter } from './router.js';

export function createInboxModule() {
  const product = getProductBySlug('inbox-simple-crm');

  return {
    slug: product.slug,
    apiPath: product.apiPath,
    router: createInboxRouter()
  };
}

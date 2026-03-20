import { getProductBySlug } from '../../config/products.js';
import { createReviewBoosterRouter } from './router.js';

export function createReviewBoosterModule() {
  const product = getProductBySlug('review-booster');

  return {
    slug: product.slug,
    apiPath: product.apiPath,
    router: createReviewBoosterRouter()
  };
}

import { getProductBySlug } from '../../config/products.js';
import { createScaffoldRouter } from '../shared/scaffold-router.js';

export function createReviewBoosterRouter() {
  return createScaffoldRouter(getProductBySlug('review-booster'));
}

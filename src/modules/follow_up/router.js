import { getProductBySlug } from '../../config/products.js';
import { createScaffoldRouter } from '../shared/scaffold-router.js';

export function createFollowUpRouter() {
  return createScaffoldRouter(getProductBySlug('follow-up-automation'));
}

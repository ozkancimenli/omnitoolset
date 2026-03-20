import { getProductBySlug } from '../../config/products.js';
import { createScaffoldRouter } from '../shared/scaffold-router.js';

export function createInboxRouter() {
  return createScaffoldRouter(getProductBySlug('inbox-simple-crm'));
}

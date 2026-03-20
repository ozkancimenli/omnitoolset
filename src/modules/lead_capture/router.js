import { getProductBySlug } from '../../config/products.js';
import { createScaffoldRouter } from '../shared/scaffold-router.js';

export function createLeadCaptureRouter() {
  return createScaffoldRouter(getProductBySlug('lead-capture-ai'));
}

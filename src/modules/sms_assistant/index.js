import { getProductBySlug } from '../../config/products.js';
import { createSmsAssistantRouter } from './router.js';
import { createSmsAssistantService } from './service.js';

export function createSmsAssistantModule({ repositories }) {
  const product = getProductBySlug('sms-ai-assistant');
  const service = createSmsAssistantService({ repositories });

  return {
    slug: product.slug,
    apiPath: product.apiPath,
    service,
    router: createSmsAssistantRouter({ service })
  };
}

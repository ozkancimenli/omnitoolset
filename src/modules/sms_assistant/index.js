import { getProductByModuleId } from '../../config/product-catalog.js';
import { createSmsAssistantRouter } from './router.js';
import { createSmsAssistantService } from './service.js';

export function createSmsAssistantModule({ repositories }) {
  const product = getProductByModuleId('sms_assistant');
  const service = createSmsAssistantService({ repositories });

  return {
    moduleId: product.moduleId,
    product,
    apiBasePath: product.apiBasePath,
    service,
    router: createSmsAssistantRouter({ service })
  };
}

import { createSmsAssistantRouter } from './router.js';
import { createSmsAssistantService } from './service.js';

export function createSmsAssistantModule({ repositories, billingService = null }) {
  const service = createSmsAssistantService({ repositories });

  return {
    service,
    router: createSmsAssistantRouter({ service, billingService })
  };
}

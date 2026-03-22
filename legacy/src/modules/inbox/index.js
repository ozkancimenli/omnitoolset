import { getProductByModuleId } from '../../config/product-catalog.js';
import { createScaffoldModule } from '../../core/modules/create-scaffold-module.js';

export function createInboxModule() {
  return createScaffoldModule(getProductByModuleId('inbox'));
}

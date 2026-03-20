import { getProductByModuleId } from '../../config/product-catalog.js';
import { createScaffoldModule } from '../../core/modules/create-scaffold-module.js';

export function createLeadCaptureModule() {
  return createScaffoldModule(getProductByModuleId('lead_capture'));
}

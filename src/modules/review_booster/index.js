import { getProductByModuleId } from '../../config/product-catalog.js';
import { createScaffoldModule } from '../../core/modules/create-scaffold-module.js';

export function createReviewBoosterModule() {
  return createScaffoldModule(getProductByModuleId('review_booster'));
}

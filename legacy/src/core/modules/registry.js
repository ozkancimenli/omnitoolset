import { createFollowUpModule } from '../../modules/follow_up/index.js';
import { createInboxModule } from '../../modules/inbox/index.js';
import { createLeadCaptureModule } from '../../modules/lead_capture/index.js';
import { createReviewBoosterModule } from '../../modules/review_booster/index.js';
import { createSmsAssistantModule } from '../../modules/sms_assistant/index.js';

export function createModuleRegistry({ repositories }) {
  return [
    createSmsAssistantModule({ repositories }),
    createReviewBoosterModule(),
    createFollowUpModule(),
    createLeadCaptureModule(),
    createInboxModule()
  ];
}

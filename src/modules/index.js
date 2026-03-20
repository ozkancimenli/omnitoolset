import { createFollowUpModule } from './follow_up/index.js';
import { createInboxModule } from './inbox/index.js';
import { createLeadCaptureModule } from './lead_capture/index.js';
import { createReviewBoosterModule } from './review_booster/index.js';
import { createSmsAssistantModule } from './sms_assistant/index.js';

export function createModules({ repositories }) {
  return [
    createSmsAssistantModule({ repositories }),
    createReviewBoosterModule(),
    createFollowUpModule(),
    createLeadCaptureModule(),
    createInboxModule()
  ];
}

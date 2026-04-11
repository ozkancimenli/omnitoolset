import { generateWorkflowBrief } from './openai-brief.js';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function createAutomationToolRegistry({ accessRequestService, logger }) {
  return {
    'system.log': async ({ message, data }) => {
      logger.info('automation.workflow_step_logged', {
        message: normalizeText(message) || 'Workflow step logged.',
        data
      });

      return {
        ok: true
      };
    },

    'text.brief': async ({ text, instruction }) => {
      const normalizedText = normalizeText(text);

      if (!normalizedText) {
        throw new Error('Text Brief requires a non-empty text input.');
      }

      return generateWorkflowBrief({
        text: normalizedText,
        instruction: normalizeText(instruction)
      });
    },

    'access-request.capture': async (payload) => {
      const result = await accessRequestService.submit(payload);
      return result;
    }
  };
}

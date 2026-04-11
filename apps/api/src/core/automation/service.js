import { capabilityCatalog, integrationCatalog, workflowCatalog } from '@omnitoolset/shared';

import { createAccessRequestService } from '../access-requests/service.js';
import { logger } from '../logging/logger.js';
import { getWorkflowDefinition, listWorkflowDefinitions } from './catalog.js';
import { resolveTemplateValue } from './template.js';
import { createAutomationToolRegistry } from './tools.js';

function serializeRun(run) {
  if (!run) {
    return null;
  }

  return {
    id: String(run.id),
    workflowKey: run.workflow_key,
    workflowName: run.workflow_name,
    triggerSource: run.trigger_source,
    status: run.status,
    input: run.input_payload,
    output: run.output_payload,
    errorMessage: run.error_message,
    stepTrace: run.step_trace || [],
    createdAt: run.created_at,
    completedAt: run.completed_at
  };
}

export function createAutomationService({ repositories }) {
  const accessRequestService = createAccessRequestService({ repositories });
  const tools = createAutomationToolRegistry({ accessRequestService, logger });

  async function executeWorkflow(definition, input, triggerSource) {
    const run = await repositories.workflowRuns.create({
      workflowKey: definition.key,
      workflowName: definition.name,
      triggerSource,
      inputPayload: input
    });

    const stepTrace = [];

    try {
      const context = {
        workflow: {
          key: definition.key,
          name: definition.name
        },
        input,
        steps: {}
      };

      for (const step of definition.steps) {
        const tool = tools[step.tool];

        if (!tool) {
          throw new Error(`Unknown workflow tool: ${step.tool}`);
        }

        const resolvedInput = resolveTemplateValue(step.input || {}, context);
        const output = await tool(resolvedInput, context);

        context.steps[step.id] = output;
        stepTrace.push({
          id: step.id,
          tool: step.tool,
          status: 'completed',
          output
        });
      }

      const output = resolveTemplateValue(definition.output || {}, context);
      const completedRun = await repositories.workflowRuns.complete({
        id: run.id,
        outputPayload: output,
        stepTrace
      });

      return serializeRun(completedRun);
    } catch (error) {
      stepTrace.push({
        status: 'failed',
        error: error.message
      });

      const failedRun = await repositories.workflowRuns.fail({
        id: run.id,
        errorMessage: error.message,
        stepTrace
      });

      throw Object.assign(new Error(error.message), {
        statusCode: 400,
        run: serializeRun(failedRun)
      });
    }
  }

  return {
    getOverview() {
      return {
        name: 'OmniToolset Automation Core',
        description:
          'Unified runtime for tools, integrations, workflow execution, and lightweight operator-facing automation.',
        capabilities: capabilityCatalog,
        integrations: integrationCatalog,
        workflows: workflowCatalog
      };
    },

    listWorkflows() {
      return listWorkflowDefinitions();
    },

    async listRuns(limit = 20) {
      const runs = await repositories.workflowRuns.listRecent(limit);
      return runs.map(serializeRun);
    },

    async runWorkflow(workflowKey, input = {}, options = {}) {
      const definition = getWorkflowDefinition(workflowKey);

      if (!definition) {
        const error = new Error('Workflow not found.');
        error.statusCode = 404;
        throw error;
      }

      return executeWorkflow(definition, input, options.triggerSource || 'manual');
    }
  };
}

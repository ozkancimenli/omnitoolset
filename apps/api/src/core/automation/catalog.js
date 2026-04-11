import { workflowCatalog as sharedWorkflowCatalog } from '@omnitoolset/shared';

export const workflowDefinitions = [
  {
    key: 'text-brief',
    name: 'Text Brief',
    summary:
      'Turns raw notes or long text into a short summary with the next actions an operator should take.',
    trigger: 'manual',
    steps: [
      {
        id: 'brief',
        tool: 'text.brief',
        input: {
          text: '{{input.text}}',
          instruction: '{{input.instruction}}'
        }
      },
      {
        id: 'audit',
        tool: 'system.log',
        input: {
          message: 'Completed workflow {{workflow.key}}',
          data: '{{steps.brief}}'
        }
      }
    ],
    output: {
      title: '{{steps.brief.title}}',
      summary: '{{steps.brief.summary}}',
      actions: '{{steps.brief.actions}}',
      model: '{{steps.brief.model}}'
    }
  },
  {
    key: 'product-access-intake',
    name: 'Product Access Intake',
    summary:
      'Captures structured product beta or waitlist demand through the shared access-request service.',
    trigger: 'manual',
    steps: [
      {
        id: 'request',
        tool: 'access-request.capture',
        input: {
          productSlug: '{{input.productSlug}}',
          name: '{{input.name}}',
          email: '{{input.email}}',
          companyName: '{{input.companyName}}',
          note: '{{input.note}}',
          sourcePath: '/studio'
        }
      },
      {
        id: 'audit',
        tool: 'system.log',
        input: {
          message: 'Captured access request {{steps.request.request.id}} for {{steps.request.product.slug}}',
          data: '{{steps.request}}'
        }
      }
    ],
    output: {
      requestId: '{{steps.request.request.id}}',
      requestType: '{{steps.request.request.requestType}}',
      product: '{{steps.request.product.slug}}',
      email: '{{steps.request.request.email}}'
    }
  }
];

export function listWorkflowDefinitions() {
  return workflowDefinitions.map((definition) => {
    const sharedMetadata =
      sharedWorkflowCatalog.find((entry) => entry.key === definition.key) || null;

    return {
      key: definition.key,
      name: definition.name,
      summary: definition.summary,
      trigger: definition.trigger,
      inputs: sharedMetadata?.inputs || []
    };
  });
}

export function getWorkflowDefinition(key) {
  return workflowDefinitions.find((definition) => definition.key === key) || null;
}

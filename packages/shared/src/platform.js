export const PLATFORM_SUMMARY = {
  name: 'OmniToolset',
  tagline: 'One platform for tools, integrations, and repeatable operator workflows.',
  description:
    'OmniToolset is a modular automation platform that brings products, internal tools, and external integrations into one extendable runtime.'
};

export const platformPrinciples = [
  'Modular by default',
  'Simple developer experience',
  'Production-minded foundations',
  'Clear extension points for new tools and workflows'
];

export const capabilityCatalog = [
  {
    key: 'tool-runtime',
    name: 'Tool Runtime',
    summary:
      'Registered tools expose internal capabilities behind a small, consistent contract so workflows stay readable.'
  },
  {
    key: 'workflow-engine',
    name: 'Workflow Engine',
    summary:
      'Workflow definitions stay declarative and can be triggered manually or by HTTP events without rewriting the core.'
  },
  {
    key: 'integration-layer',
    name: 'Integration Layer',
    summary:
      'External services stay isolated behind focused clients so credentials, retries, and validation remain centralized.'
  },
  {
    key: 'run-history',
    name: 'Run History',
    summary:
      'Every workflow run is stored with input, output, status, and timestamps so operators can debug real behavior.'
  }
];

export const integrationCatalog = [
  {
    key: 'openai',
    name: 'OpenAI',
    summary: 'Used for compact text generation and summarization steps.'
  },
  {
    key: 'twilio',
    name: 'Twilio',
    summary: 'Handles SMS and voice delivery for live communication workflows.'
  },
  {
    key: 'stripe',
    name: 'Stripe',
    summary: 'Supports payment, subscription, and activation workflows.'
  },
  {
    key: 'postgres',
    name: 'PostgreSQL',
    summary: 'Stores durable platform state, product data, and workflow runs.'
  }
];

export const workflowCatalog = [
  {
    key: 'text-brief',
    name: 'Text Brief',
    summary:
      'Turn raw notes, transcripts, or incoming text into a short operations-ready brief with next actions.',
    trigger: 'manual',
    inputs: [
      {
        key: 'text',
        label: 'Raw text',
        type: 'textarea',
        required: true,
        placeholder: 'Paste customer notes, meeting notes, or messy operational text.'
      },
      {
        key: 'instruction',
        label: 'Optional instruction',
        type: 'text',
        required: false,
        placeholder: 'Example: Focus on next actions for the ops team.'
      }
    ]
  },
  {
    key: 'product-access-intake',
    name: 'Product Access Intake',
    summary:
      'Capture structured beta or waitlist interest and route it through the shared access-request service.',
    trigger: 'manual',
    inputs: [
      {
        key: 'productSlug',
        label: 'Product slug',
        type: 'select',
        required: true,
        options: ['review-booster', 'follow-up-automation', 'lead-capture-ai', 'inbox-simple-crm']
      },
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Jordan Lee'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        placeholder: 'jordan@example.com'
      },
      {
        key: 'companyName',
        label: 'Company name',
        type: 'text',
        required: true,
        placeholder: 'Northstar Health'
      },
      {
        key: 'note',
        label: 'Optional note',
        type: 'textarea',
        required: false,
        placeholder: 'Tell us the workflow you want this module to solve.'
      }
    ]
  }
];

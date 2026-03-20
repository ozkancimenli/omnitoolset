export const PRODUCT_STATUS = Object.freeze({
  LIVE: 'Live',
  BETA: 'Beta',
  COMING_SOON: 'Coming Soon'
});

export const homepageHeadline = 'AI tools that help your business grow automatically.';

function defineProduct({
  moduleId,
  slug,
  apiSegment = slug,
  ...product
}) {
  return {
    moduleId,
    slug,
    pagePath: `/products/${slug}`,
    apiBasePath: `/api/${apiSegment}`,
    ...product
  };
}

export const productCatalog = [
  defineProduct({
    moduleId: 'sms_assistant',
    slug: 'sms-ai-assistant',
    apiSegment: 'sms-assistant',
    name: 'SMS AI Assistant',
    status: PRODUCT_STATUS.LIVE,
    headline:
      'Never miss a customer again. We automatically reply to your customers and book appointments via SMS.',
    summary:
      'Twilio webhooks, OpenAI-generated SMS replies, booking suggestions, missed-call follow-up, and persistent conversation history.',
    ctaLabel: 'View Live Product',
    waitlistEnabled: false,
    highlights: [
      'Incoming SMS webhook with OpenAI responses',
      'Booking flow that suggests 1 to 2 time options',
      'Booking confirmation persistence',
      'Missed call auto-SMS using Twilio voice webhooks',
      'Conversation, message, and booking storage'
    ],
    plannedCapabilities: [
      'Multi-business onboarding UI',
      'Human handoff controls',
      'Analytics dashboard',
      'Calendar sync'
    ]
  }),
  defineProduct({
    moduleId: 'review_booster',
    slug: 'review-booster',
    name: 'Review Booster',
    status: PRODUCT_STATUS.BETA,
    headline: 'Turn great customer moments into fresh reviews without manual follow-up.',
    summary:
      'Scaffolded module for review request campaigns, sentiment-aware outreach, and review monitoring.',
    ctaLabel: 'Join Beta Waitlist',
    waitlistEnabled: true,
    highlights: [
      'Campaign routing scaffold',
      'Waitlist collection',
      'Status endpoint for future integrations'
    ],
    plannedCapabilities: [
      'Post-service review request sequences',
      'Review link rotation by channel',
      'Negative-feedback catch flow before public review'
    ]
  }),
  defineProduct({
    moduleId: 'follow_up',
    slug: 'follow-up-automation',
    name: 'Follow-up Automation',
    status: PRODUCT_STATUS.BETA,
    headline: 'Keep warm leads moving with AI-assisted follow-up sequences.',
    summary:
      'Scaffolded module for post-quote, post-visit, and inactive-lead follow-up automation.',
    ctaLabel: 'Join Beta Waitlist',
    waitlistEnabled: true,
    highlights: [
      'Module scaffold with placeholder API',
      'Waitlist capture',
      'Planned automation workflows documented in code'
    ],
    plannedCapabilities: [
      'Sequenced reminders by channel',
      'Quote follow-up nudges',
      'Intent scoring for lead prioritization'
    ]
  }),
  defineProduct({
    moduleId: 'lead_capture',
    slug: 'lead-capture-ai',
    name: 'Lead Capture AI',
    status: PRODUCT_STATUS.COMING_SOON,
    headline: 'Capture, qualify, and route inbound leads without a full sales stack.',
    summary: 'Coming-soon module scaffold for conversational lead capture and qualification.',
    ctaLabel: 'Request Early Access',
    waitlistEnabled: true,
    highlights: [
      'Extensible module boundary ready for implementation',
      'Placeholder API and waitlist path',
      'Shared database tables already prepared for leads'
    ],
    plannedCapabilities: [
      'Website chat qualification',
      'Form-to-SMS routing',
      'Lead scoring and handoff'
    ]
  }),
  defineProduct({
    moduleId: 'inbox',
    slug: 'inbox-simple-crm',
    apiSegment: 'inbox-simple-crm',
    name: 'Inbox / Simple CRM',
    status: PRODUCT_STATUS.COMING_SOON,
    headline:
      'A lightweight team inbox and customer record layer for small business communication.',
    summary: 'Coming-soon scaffold for shared conversations, lead context, and simple CRM views.',
    ctaLabel: 'Request Early Access',
    waitlistEnabled: true,
    highlights: [
      'Scaffolded module and status endpoint',
      'Waitlist collection for early access',
      'Shared schema designed for future inbox and CRM implementation'
    ],
    plannedCapabilities: [
      'Shared conversation timeline',
      'Lead and customer notes',
      'Basic pipeline and task tracking'
    ]
  })
];

export function getProductBySlug(slug) {
  return productCatalog.find((product) => product.slug === slug) || null;
}

export function getProductByModuleId(moduleId) {
  return productCatalog.find((product) => product.moduleId === moduleId) || null;
}

export function getLiveProduct() {
  return productCatalog.find((product) => product.status === PRODUCT_STATUS.LIVE) || null;
}

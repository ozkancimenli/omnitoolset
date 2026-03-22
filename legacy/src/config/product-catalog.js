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
    navLabel: 'SMS AI Assistant',
    status: PRODUCT_STATUS.LIVE,
    suiteRole: 'The live front door for fast customer response and appointment booking.',
    headline:
      'Never miss a customer again. We automatically reply to your customers and book appointments via SMS.',
    summary:
      'Handle inbound texts, follow up after missed calls, and turn new inquiries into confirmed appointments without adding front-desk load.',
    cardSummary:
      'Live today for inbound SMS replies, missed-call follow-up, and simple appointment booking.',
    audience: 'Service businesses that win when they reply fast and book quickly.',
    ctaLabel: 'Get Started',
    waitlistEnabled: false,
    highlights: [
      'Replies to inbound SMS with a short, natural tone',
      'Offers one or two booking times and confirms the choice',
      'Follows up automatically after missed calls',
      'Stores conversations, messages, and bookings',
      'Runs on Twilio with OpenAI-backed reply generation'
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
    navLabel: 'Review Booster',
    status: PRODUCT_STATUS.BETA,
    suiteRole: 'The reputation layer for turning completed jobs into fresh reviews.',
    headline: 'Turn happy customers into fresh reviews without another manual follow-up task.',
    summary:
      'Designed for post-service review requests, lightweight outreach, and review capture once the workflow is implemented.',
    cardSummary:
      'A beta-stage module for automated review requests and lightweight reputation follow-up.',
    audience: 'Local businesses that want more reviews without building a full reputation workflow by hand.',
    ctaLabel: 'Join Beta',
    waitlistEnabled: true,
    highlights: [
      'Early access list for review-request workflows',
      'Module boundary and placeholder API already in place',
      'Database tables prepared for future review campaigns'
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
    navLabel: 'Follow-up',
    status: PRODUCT_STATUS.BETA,
    suiteRole: 'The re-engagement layer for leads and customers who went quiet.',
    headline: 'Keep leads and customers moving with timely follow-up after quotes, visits, and missed calls.',
    summary:
      'A staged module for automated reminders and re-engagement flows that help warm leads keep moving.',
    cardSummary:
      'A beta-stage follow-up engine for reminders, nudges, and simple reactivation sequences.',
    audience: 'Teams that lose revenue when leads go quiet after the first touchpoint.',
    ctaLabel: 'Join Beta',
    waitlistEnabled: true,
    highlights: [
      'Early access list for reminder and reactivation flows',
      'Scaffolded module with placeholder API surface',
      'Shared contacts and messages already available for future workflows'
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
    navLabel: 'Lead Capture',
    status: PRODUCT_STATUS.COMING_SOON,
    suiteRole: 'The first-touch intake layer for new leads across web and messaging.',
    headline: 'Capture and qualify inbound leads automatically the moment they reach out.',
    summary:
      'A coming-soon module for conversational lead capture, qualification, and routing into shared business workflows.',
    cardSummary:
      'A coming-soon lead intake module built for qualification and routing, not just form collection.',
    audience: 'Businesses that want faster first response without deploying a heavyweight sales stack.',
    ctaLabel: 'Join Waitlist',
    waitlistEnabled: true,
    highlights: [
      'Early access list for conversational lead intake',
      'Placeholder route and module boundary ready for implementation',
      'Shared lead tables already prepared in the database'
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
    navLabel: 'Inbox / CRM',
    status: PRODUCT_STATUS.COMING_SOON,
    suiteRole: 'The shared conversation layer for contacts, messages, and next steps.',
    headline:
      'A lightweight shared inbox and customer record layer for small business communication.',
    summary:
      'A coming-soon module for shared timelines, customer context, and simple CRM workflows inside OmniToolset.',
    cardSummary:
      'A coming-soon inbox and lightweight CRM layer for conversations, contacts, and next steps.',
    audience: 'Small teams that need shared visibility without adopting a heavy CRM suite.',
    ctaLabel: 'Join Waitlist',
    waitlistEnabled: true,
    highlights: [
      'Early access list for the shared inbox and CRM layer',
      'Scaffolded module with a placeholder status endpoint',
      'Shared schema already supports contacts, conversations, and messages'
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

export const PRIMARY_DOMAIN = 'https://omnitoolset.com';
export const HOMEPAGE_HEADLINE = 'AI tools that help your business grow automatically.';

export const PRODUCT_STATUS = Object.freeze({
  LIVE: 'Live',
  BETA: 'Beta',
  COMING_SOON: 'Coming Soon'
});

function defineProduct({
  moduleId,
  slug,
  routePath,
  apiSegment,
  accessType,
  ...product
}) {
  return {
    moduleId,
    slug,
    routePath,
    apiBasePath: `/api/${apiSegment}`,
    accessType,
    ...product
  };
}

export const productCatalog = [
  defineProduct({
    moduleId: 'sms_assistant',
    slug: 'sms-ai-assistant',
    routePath: '/sms',
    apiSegment: 'sms-assistant',
    accessType: 'live',
    name: 'SMS AI Assistant',
    shortName: 'SMS AI Assistant',
    status: PRODUCT_STATUS.LIVE,
    headline:
      'Never miss a customer again. We automatically reply to your customers and book appointments via SMS.',
    summary:
      'Handle inbound texts, follow up after missed calls, and turn new inquiries into confirmed appointments without adding front-desk load.',
    cardSummary:
      'Live today for inbound SMS replies, missed-call follow-up, and simple appointment booking.',
    ctaLabel: 'Get Started',
    secondaryCtaLabel: 'Request Demo',
    suiteRole: 'Live now as the first product in the OmniToolset suite.',
    highlights: [
      'Twilio-powered inbound SMS handling',
      'Short AI-generated replies that move toward booking',
      'Missed-call auto-reply with booking options',
      'Stored conversations, messages, and bookings'
    ]
  }),
  defineProduct({
    moduleId: 'review_booster',
    slug: 'review-booster',
    routePath: '/reviews',
    apiSegment: 'reviews',
    accessType: 'beta',
    name: 'Review Booster',
    shortName: 'Review Booster',
    status: PRODUCT_STATUS.BETA,
    headline: 'Turn completed jobs into new public reviews with less manual follow-up.',
    summary:
      'Structured for review request campaigns, negative-feedback capture, and post-service reputation workflows.',
    cardSummary: 'Beta module for automated review request flows.',
    ctaLabel: 'Join Beta',
    suiteRole: 'Beta-stage reputation module ready for implementation.',
    highlights: [
      'Beta access capture for early partners',
      'Review request data model prepared in the API',
      'Ready to connect to post-booking workflows'
    ]
  }),
  defineProduct({
    moduleId: 'follow_up',
    slug: 'follow-up-automation',
    routePath: '/follow-up',
    apiSegment: 'follow-up',
    accessType: 'beta',
    name: 'Follow-up Automation',
    shortName: 'Follow-up Automation',
    status: PRODUCT_STATUS.BETA,
    headline: 'Keep leads warm and customers moving with timely automated follow-up.',
    summary:
      'Designed for reminders, reactivation, and lightweight nurture sequences once the module is implemented.',
    cardSummary: 'Beta module for reminders, nudges, and reactivation sequences.',
    ctaLabel: 'Join Beta',
    suiteRole: 'Beta-stage re-engagement module with shared contact foundations.',
    highlights: [
      'Shared contact and conversation model already in place',
      'Beta access capture for follow-up workflows',
      'Ready for sequenced reminders and reactivation logic'
    ]
  }),
  defineProduct({
    moduleId: 'lead_capture',
    slug: 'lead-capture-ai',
    routePath: '/lead-capture',
    apiSegment: 'lead-capture',
    accessType: 'waitlist',
    name: 'Lead Capture AI',
    shortName: 'Lead Capture AI',
    status: PRODUCT_STATUS.COMING_SOON,
    headline: 'Capture, qualify, and route new leads automatically from the first touchpoint.',
    summary:
      'Planned for website lead intake, qualification, and routing into the rest of the OmniToolset platform.',
    cardSummary: 'Coming soon module for conversational lead qualification.',
    ctaLabel: 'Join Waitlist',
    suiteRole: 'Coming soon as the first-touch lead intake layer.',
    highlights: [
      'Waitlist capture for launch partners',
      'Lead table already exists in the platform schema',
      'Designed to connect directly into follow-up and inbox workflows'
    ]
  }),
  defineProduct({
    moduleId: 'inbox',
    slug: 'inbox-simple-crm',
    routePath: '/inbox',
    apiSegment: 'inbox',
    accessType: 'waitlist',
    name: 'Inbox / Simple CRM',
    shortName: 'Inbox / Simple CRM',
    status: PRODUCT_STATUS.COMING_SOON,
    headline: 'Give small teams a shared view of conversations, customers, and next steps.',
    summary:
      'Planned as a lightweight shared inbox and customer timeline for the OmniToolset product suite.',
    cardSummary: 'Coming soon inbox and CRM layer for shared customer context.',
    ctaLabel: 'Join Waitlist',
    suiteRole: 'Coming soon as the shared system of record for customer conversations.',
    highlights: [
      'Waitlist capture for the future inbox experience',
      'Shared contacts, conversations, and messages already exist',
      'Ready to grow into notes, assignments, and pipeline states'
    ]
  })
];

export function getProductByRoutePath(routePath) {
  return productCatalog.find((product) => product.routePath === routePath) || null;
}

export function getProductBySlug(slug) {
  return productCatalog.find((product) => product.slug === slug) || null;
}

export function getProductByModuleId(moduleId) {
  return productCatalog.find((product) => product.moduleId === moduleId) || null;
}

export function getAccessProducts() {
  return productCatalog.filter((product) => product.accessType !== 'live');
}

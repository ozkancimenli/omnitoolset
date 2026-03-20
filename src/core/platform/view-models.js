import {
  getLiveProduct,
  getProductBySlug,
  homepageHeadline,
  productCatalog
} from '../../config/product-catalog.js';

export function sanitizeReturnTo(returnTo, fallbackPath) {
  if (!returnTo || typeof returnTo !== 'string') {
    return fallbackPath;
  }

  return returnTo.startsWith('/') ? returnTo : fallbackPath;
}

export function getWaitlistSuccessProduct(query) {
  if (query.waitlist !== 'success' || !query.product) {
    return null;
  }

  return getProductBySlug(query.product);
}

function buildSmsAssistantPageData(repositories) {
  return {
    stats: {
      openConversations: repositories.conversations.countOpen(),
      totalMessages: repositories.messages.countAll(),
      confirmedBookings: repositories.bookings.countConfirmed()
    },
    publicSummary: {
      bookingFlow:
        'Customers text in, get a fast reply, receive one or two appointment options, and can confirm their booking in the same thread.',
      missedCallFlow:
        'If a call is missed, the system follows up over SMS instead of letting the lead disappear.',
      onboarding:
        'Webhook mapping, Twilio setup, and environment configuration are handled during implementation, not exposed on the marketing page.'
    }
  };
}

export function buildHomePageViewModel(query) {
  return {
    pageTitle: 'OmniToolset',
    pageDescription: homepageHeadline,
    products: productCatalog,
    liveProduct: getLiveProduct(),
    waitlistSuccessProduct: getWaitlistSuccessProduct(query)
  };
}

export function buildProductPageViewModel({ slug, query, repositories }) {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }

  return {
    pageTitle: `${product.name} | OmniToolset`,
    pageDescription: product.summary,
    product,
    waitlistSuccessProduct: getWaitlistSuccessProduct(query),
    smsPageData: product.moduleId === 'sms_assistant' ? buildSmsAssistantPageData(repositories) : null
  };
}

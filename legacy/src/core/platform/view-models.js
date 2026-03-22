import {
  getLiveProduct,
  getProductBySlug,
  homepageHeadline,
  PRODUCT_STATUS,
  productCatalog
} from '../../config/product-catalog.js';
import { env } from '../../config/env.js';

const DEMO_EMAIL = 'hello@omnitoolset.com';

function stripTrailingSlash(value) {
  return value.replace(/\/$/, '');
}

export function buildPublicUrl(pathname, publicAppUrl = env.frontendAppUrl) {
  if (!pathname || typeof pathname !== 'string') {
    return publicAppUrl ? `${stripTrailingSlash(publicAppUrl)}/` : '/';
  }

  if (!publicAppUrl) {
    return pathname;
  }

  try {
    return new URL(pathname, `${stripTrailingSlash(publicAppUrl)}/`).toString();
  } catch {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${stripTrailingSlash(publicAppUrl)}${normalizedPath}`;
  }
}

export function sanitizeReturnTo(returnTo, fallbackPath, publicAppUrl = env.frontendAppUrl) {
  const fallbackUrl = buildPublicUrl(fallbackPath, publicAppUrl);

  if (!returnTo || typeof returnTo !== 'string') {
    return fallbackUrl;
  }

  if (returnTo.startsWith('/')) {
    return buildPublicUrl(returnTo, publicAppUrl);
  }

  if (!publicAppUrl) {
    return fallbackUrl;
  }

  try {
    const allowedOrigin = new URL(publicAppUrl).origin;
    const candidate = new URL(returnTo);
    return candidate.origin === allowedOrigin ? candidate.toString() : fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}

export function getWaitlistSuccessProduct(query) {
  const requestSucceeded = query.access === 'success' || query.waitlist === 'success';

  if (!requestSucceeded || !query.product) {
    return null;
  }

  return getProductBySlug(query.product);
}

function getStatusClass(status) {
  return `status-${status.toLowerCase().replace(/\s+/g, '-')}`;
}

function buildMailtoLink(subject) {
  return `mailto:${DEMO_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

function buildStatusCopy(product) {
  if (product.status === PRODUCT_STATUS.LIVE) {
    return 'Live today as the first OmniToolset product, with real SMS, booking, and missed-call workflows already in place.';
  }

  if (product.status === PRODUCT_STATUS.BETA) {
    return 'Visible in the suite and open for early access, but still intentionally staged as a beta module.';
  }

  return 'Visible in the suite now, but intentionally marked coming soon until the workflow is built.';
}

function buildModuleBadgeLabel(product) {
  if (product.status === PRODUCT_STATUS.LIVE) {
    return 'Live product';
  }

  if (product.status === PRODUCT_STATUS.BETA) {
    return 'Beta module';
  }

  return 'Coming soon module';
}

function buildEarlyAccessLabel(status) {
  return status === PRODUCT_STATUS.BETA ? 'Join Beta' : 'Join Waitlist';
}

function buildEarlyAccessHelpText(product) {
  if (product.status === PRODUCT_STATUS.BETA) {
    return `No login required. We will reach out when ${product.name} opens for beta access.`;
  }

  return `No login required. We will reach out when ${product.name} is ready for early access.`;
}

function buildCardActions(product) {
  if (product.status === PRODUCT_STATUS.LIVE) {
    return {
      primaryAction: {
        label: 'Get Started',
        href: product.pagePath,
        variant: 'primary'
      },
      secondaryAction: {
        label: 'Request Demo',
        href: buildMailtoLink(`Request demo: ${product.name}`),
        variant: 'secondary'
      }
    };
  }

  return {
    primaryAction: {
      label: buildEarlyAccessLabel(product.status),
      href: `${product.pagePath}#early-access`,
      variant: 'primary'
    },
    secondaryAction: {
      label: 'View Details',
      href: product.pagePath,
      variant: 'secondary'
    }
  };
}

function buildPageActions(product) {
  if (product.status === PRODUCT_STATUS.LIVE) {
    return {
      primaryAction: {
        label: 'Get Started',
        href: buildMailtoLink(`Get started with ${product.name}`),
        variant: 'primary'
      },
      secondaryAction: {
        label: 'Request Demo',
        href: buildMailtoLink(`Request demo: ${product.name}`),
        variant: 'secondary'
      }
    };
  }

  return {
    primaryAction: {
      label: buildEarlyAccessLabel(product.status),
      href: '#early-access',
      variant: 'primary'
    },
    secondaryAction: {
      label: 'Back to Platform',
      href: '/#products',
      variant: 'secondary'
    }
  };
}

function buildPresentedProduct(product) {
  return {
    ...product,
    moduleBadgeLabel: buildModuleBadgeLabel(product),
    statusClass: getStatusClass(product.status),
    statusCopy: buildStatusCopy(product),
    earlyAccessLabel: buildEarlyAccessLabel(product.status),
    earlyAccessHelpText: product.waitlistEnabled ? buildEarlyAccessHelpText(product) : null,
    cardSummary: product.cardSummary || product.summary,
    cardHighlights: product.highlights.slice(0, 3),
    ...buildCardActions(product),
    pageActions: buildPageActions(product)
  };
}

function buildSmsAssistantPageData() {
  return {
    livePoints: [
      'Replies to inbound texts in a short, human tone',
      'Suggests one or two booking times and confirms the choice',
      'Sends a missed-call follow-up SMS so leads do not go cold'
    ],
    suitePoints: [
      'Acts as the first live product in the OmniToolset suite',
      'Shares contacts, conversations, and bookings with the broader platform data model',
      'Creates the foundation that Review Booster, Follow-up Automation, Lead Capture AI, and Inbox / Simple CRM can build on'
    ]
  };
}

export function buildHomePageViewModel(query) {
  const products = productCatalog.map(buildPresentedProduct);
  const liveCatalogProduct = getLiveProduct();
  const liveProduct = liveCatalogProduct ? buildPresentedProduct(liveCatalogProduct) : null;

  return {
    pageTitle: 'OmniToolset',
    pageDescription: homepageHeadline,
    products,
    liveProduct,
    accessRequestAction: '/access-requests',
    homeAccessReturnTo: buildPublicUrl('/'),
    waitlistSuccessProduct: getWaitlistSuccessProduct(query),
    platformFacts: [
      {
        value: '5',
        label: 'products in the suite'
      },
      {
        value: '1',
        label: 'live right now'
      },
      {
        value: '4',
        label: 'staged for what ships next'
      }
    ]
  };
}

export function buildProductPageViewModel({ slug, query }) {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }

  const presentedProduct = buildPresentedProduct(product);

  return {
    pageTitle: `${product.name} | OmniToolset`,
    pageDescription: product.summary,
    product: presentedProduct,
    accessRequestAction: '/access-requests',
    productAccessReturnTo: buildPublicUrl(product.pagePath),
    waitlistSuccessProduct: getWaitlistSuccessProduct(query),
    smsPageData: product.moduleId === 'sms_assistant' ? buildSmsAssistantPageData() : null,
    otherProducts: productCatalog
      .filter((entry) => entry.slug !== slug)
      .map(buildPresentedProduct)
  };
}

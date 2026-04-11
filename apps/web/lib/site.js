import {
  HOMEPAGE_HEADLINE,
  PRIMARY_DOMAIN,
  getAccessProducts,
  getProductByRoutePath,
  getProductByModuleId,
  productCatalog,
} from '@omnitoolset/shared/products';
import {
  capabilityCatalog,
  PLATFORM_SUMMARY,
  integrationCatalog,
  workflowCatalog
} from '@omnitoolset/shared/platform';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || PRIMARY_DOMAIN).replace(/\/$/, '');
}

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
}

export function buildReturnUrl(pathname = '/') {
  return `${getSiteUrl()}${pathname}`;
}

export function buildAccessRequestAction() {
  return `${getApiBaseUrl()}/access-requests`;
}

export function getHomePageModel() {
  return {
    platform: PLATFORM_SUMMARY,
    headline: HOMEPAGE_HEADLINE,
    capabilities: capabilityCatalog,
    integrations: integrationCatalog,
    workflows: workflowCatalog,
    products: productCatalog,
    liveProduct: getProductByModuleId('sms_assistant'),
    accessProducts: getAccessProducts()
  };
}

export function getProductPageModel(routePath) {
  const product = getProductByRoutePath(routePath);

  if (!product) {
    return null;
  }

  return {
    product,
    relatedProducts: productCatalog.filter((entry) => entry.moduleId !== product.moduleId)
  };
}

/**
 * SEO Enhancement Utilities
 * Provides additional SEO optimizations
 */

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate organization schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OmniToolset',
    url: 'https://omnitoolset.com',
    logo: 'https://omnitoolset.com/logo.png',
    sameAs: [
      // Add social media links here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['English', 'Turkish'],
    },
  };
}

/**
 * Generate HowTo schema
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: Array<{ text: string; image?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

/**
 * Generate VideoObject schema
 */
export function generateVideoSchema(
  name: string,
  description: string,
  thumbnailUrl: string,
  videoUrl: string,
  duration?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate: new Date().toISOString(),
    contentUrl: videoUrl,
    ...(duration && { duration }),
  };
}

/**
 * Generate SoftwareApplication schema
 */
export function generateSoftwareApplicationSchema(
  name: string,
  description: string,
  url: string,
  applicationCategory: string = 'UtilityApplication'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    url,
    applicationCategory,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1000+',
    },
  };
}

/**
 * Generate CollectionPage schema
 */
export function generateCollectionPageSchema(
  name: string,
  description: string,
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebPage',
          name: item.name,
          url: item.url,
        },
      })),
    },
  };
}


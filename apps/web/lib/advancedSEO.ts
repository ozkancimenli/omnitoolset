/**
 * Advanced SEO Utilities
 * Enhanced SEO features and optimizations
 */

/**
 * Generate structured data
 */
export function generateStructuredData(type: 'WebSite' | 'Organization' | 'BreadcrumbList' | 'Article', data: any): object {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'WebSite':
      return {
        ...baseSchema,
        name: data.name || 'OmniToolset',
        url: data.url || 'https://omnitoolset.com',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${data.url || 'https://omnitoolset.com'}/?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      };

    case 'Organization':
      return {
        ...baseSchema,
        name: data.name || 'OmniToolset',
        url: data.url || 'https://omnitoolset.com',
        logo: data.logo || 'https://omnitoolset.com/logo.png',
        sameAs: data.socialLinks || [],
      };

    case 'BreadcrumbList':
      return {
        ...baseSchema,
        itemListElement: data.items?.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })) || [],
      };

    case 'Article':
      return {
        ...baseSchema,
        headline: data.headline,
        description: data.description,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: {
          '@type': 'Person',
          name: data.author || 'OmniToolset',
        },
        publisher: {
          '@type': 'Organization',
          name: 'OmniToolset',
          logo: {
            '@type': 'ImageObject',
            url: 'https://omnitoolset.com/logo.png',
          },
        },
      };

    default:
      return baseSchema;
  }
}

/**
 * Generate meta tags
 */
export function generateMetaTags(metadata: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}): string {
  const tags = [
    `<meta property="og:title" content="${metadata.title}" />`,
    `<meta property="og:description" content="${metadata.description}" />`,
    `<meta property="og:type" content="${metadata.type || 'website'}" />`,
    `<meta property="og:url" content="${metadata.url || 'https://omnitoolset.com'}" />`,
    metadata.image && `<meta property="og:image" content="${metadata.image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${metadata.title}" />`,
    `<meta name="twitter:description" content="${metadata.description}" />`,
    metadata.image && `<meta name="twitter:image" content="${metadata.image}" />`,
    `<meta name="description" content="${metadata.description}" />`,
    metadata.keywords && `<meta name="keywords" content="${metadata.keywords}" />`,
  ].filter(Boolean);

  return tags.join('\n');
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastmod?: string,
  changefreq: string = 'weekly',
  priority: number = 0.8
): string {
  return `
    <url>
      <loc>${url}</loc>
      ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>
  `.trim();
}

/**
 * Generate robots.txt rules
 */
export function generateRobotsTxt(
  allowPaths: string[] = [],
  disallowPaths: string[] = ['/api/', '/admin/'],
  sitemapUrl?: string
): string {
  const rules = [
    'User-agent: *',
    ...allowPaths.map(path => `Allow: ${path}`),
    ...disallowPaths.map(path => `Disallow: ${path}`),
    sitemapUrl && `Sitemap: ${sitemapUrl}`,
  ].filter(Boolean);

  return rules.join('\n');
}

/**
 * Optimize images for SEO
 */
export function optimizeImageForSEO(
  src: string,
  alt: string,
  width?: number,
  height?: number
): {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'auto' | 'sync';
} {
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy',
    decoding: 'async',
  };
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(path: string, baseUrl: string = 'https://omnitoolset.com'): string {
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Generate hreflang tags
 */
export function generateHreflangTags(
  languages: Array<{ lang: string; url: string }>
): string {
  return languages
    .map(({ lang, url }) => `<link rel="alternate" hreflang="${lang}" href="${url}" />`)
    .join('\n');
}

/**
 * Check SEO score
 */
export function checkSEOScore(pageData: {
  title?: string;
  description?: string;
  headings?: string[];
  images?: Array<{ alt?: string }>;
  links?: number;
}): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check title
  if (!pageData.title) {
    issues.push('Missing title');
    score -= 20;
  } else if (pageData.title.length < 30) {
    suggestions.push('Title should be at least 30 characters');
    score -= 5;
  } else if (pageData.title.length > 60) {
    suggestions.push('Title should be less than 60 characters');
    score -= 5;
  }

  // Check description
  if (!pageData.description) {
    issues.push('Missing description');
    score -= 20;
  } else if (pageData.description.length < 120) {
    suggestions.push('Description should be at least 120 characters');
    score -= 5;
  } else if (pageData.description.length > 160) {
    suggestions.push('Description should be less than 160 characters');
    score -= 5;
  }

  // Check headings
  if (!pageData.headings || pageData.headings.length === 0) {
    issues.push('Missing headings');
    score -= 10;
  }

  // Check images
  if (pageData.images) {
    const imagesWithoutAlt = pageData.images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} image(s) without alt text`);
      score -= imagesWithoutAlt.length * 5;
    }
  }

  // Check links
  if (!pageData.links || pageData.links === 0) {
    suggestions.push('Add internal links');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
  };
}

/**
 * Initialize SEO
 */
export function initSEO(): void {
  if (typeof window === 'undefined') return;

  // Add structured data
  const structuredData = generateStructuredData('WebSite', {
    name: 'OmniToolset',
    url: 'https://omnitoolset.com',
  });

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}


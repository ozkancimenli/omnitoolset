/**
 * SEO Utilities
 * 
 * Helper functions for generating SEO metadata, structured data,
 * and other SEO-related content.
 */

import { Metadata } from 'next';
import { ToolMetadata, BlogPostMetadata, Locale } from './types';
import { getLocalizedString } from './i18n';

/**
 * Generate metadata for a tool page
 */
export function generateToolMetadata(
  tool: ToolMetadata,
  locale: Locale = 'en'
): Metadata {
  const title = getLocalizedString(tool.title, locale);
  const description = getLocalizedString(tool.description, locale);
  const keywords = tool.keywords ? getLocalizedString(tool.keywords, locale) : '';
  
  const url = `https://omnitoolset.com/tools/${tool.slug}`;
  const enhancedTitle = `FREE ${title} Online - No Registration | OmniToolset`;
  const enhancedDescription = `${description}. 100% FREE online tool. No registration required, no watermarks, 100% secure, unlimited use.`;

  return {
    title: enhancedTitle,
    description: enhancedDescription,
    keywords: keywords,
    openGraph: {
      title: enhancedTitle,
      description: enhancedDescription,
      url,
      type: 'website',
      siteName: 'OmniToolset',
    },
    twitter: {
      card: 'summary_large_image',
      title: enhancedTitle,
      description: enhancedDescription,
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata for a blog post
 */
export function generateBlogMetadata(
  post: BlogPostMetadata,
  locale: Locale = 'en'
): Metadata {
  const title = getLocalizedString(post.title, locale);
  const excerpt = getLocalizedString(post.excerpt, locale);
  const keywords = post.keywords ? getLocalizedString(post.keywords, locale) : '';
  
  const url = `https://omnitoolset.com/blog/${post.slug}`;

  return {
    title: `${title} | OmniToolset Blog`,
    description: excerpt,
    keywords: keywords,
    openGraph: {
      title: title,
      description: excerpt,
      url,
      type: 'article',
      publishedTime: post.date,
      siteName: 'OmniToolset',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: excerpt,
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate FAQ JSON-LD schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Article JSON-LD schema for blog posts
 */
export function generateArticleSchema(
  post: BlogPostMetadata,
  locale: Locale = 'en'
) {
  const title = getLocalizedString(post.title, locale);
  const excerpt = getLocalizedString(post.excerpt, locale);
  const url = `https://omnitoolset.com/blog/${post.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'OmniToolset',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OmniToolset',
    },
    url: url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * Generate WebApplication schema for tools
 */
export function generateToolSchema(tool: ToolMetadata, locale: Locale = 'en') {
  const title = getLocalizedString(tool.title, locale);
  const description = getLocalizedString(tool.description, locale);
  const url = `https://omnitoolset.com/tools/${tool.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    description: description,
    url: url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}


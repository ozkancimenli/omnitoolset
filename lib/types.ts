/**
 * Core Type Definitions for OmniToolset Platform
 * 
 * This file defines the data models for tools, blog posts, and other
 * platform entities. Designed for scalability and i18n support.
 */

export type Locale = 'en' | 'tr';

export interface ToolMetadata {
  id: string;
  slug: string;
  category: string;
  icon: string;
  // i18n support
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  keywords?: Record<Locale, string>;
  // SEO content
  seoContent?: {
    howTo?: Record<Locale, string[]>;
    explanation?: Record<Locale, string>;
    faq?: Record<Locale, Array<{ question: string; answer: string }>>;
  };
  // Feature flags
  featured?: boolean;
  new?: boolean;
  premium?: boolean;
  // Related tools
  relatedToolIds?: string[];
  // External links (e.g., to standalone PDF editor)
  externalLink?: {
    url: string;
    label: Record<Locale, string>;
  };
}

export interface BlogPostMetadata {
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
  date: string;
  category: string;
  tags: string[];
  author?: string;
  keywords?: Record<Locale, string>;
  // Related tools
  relatedToolIds?: string[];
  // SEO
  featured?: boolean;
}

export interface Category {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  icon: string;
  slug: string;
}

export interface AdSlotConfig {
  position: 'tool-top' | 'tool-bottom' | 'tool-sidebar' | 'blog-top' | 'blog-bottom' | 'blog-middle' | 'home-hero' | 'home-bottom';
  format?: 'auto' | 'banner' | 'sidebar' | 'in-article';
  className?: string;
}


# 🏗️ OmniToolset Platform Architecture

## Overview

OmniToolset is designed as a **scalable, SEO-optimized, multi-language platform** for hosting hundreds of online tools and blog posts. This document outlines the architecture, data models, and extension patterns.

---

## 📁 Project Structure

```
omnitoolset/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with global providers
│   ├── page.tsx                 # Homepage
│   ├── [locale]/                # i18n routes (future: /en, /tr)
│   ├── tools/
│   │   ├── page.tsx            # Tools index
│   │   └── [slug]/
│   │       └── page.tsx         # Dynamic tool page
│   ├── blog/
│   │   ├── page.tsx            # Blog index
│   │   └── [slug]/
│   │       └── page.tsx        # Blog post page
│   ├── categories/
│   │   └── page.tsx            # Category pages
│   ├── sitemap.ts              # Dynamic sitemap generation
│   └── robots.ts               # Robots.txt generation
│
├── components/
│   ├── Header.tsx              # Main navigation
│   ├── Footer.tsx              # Site footer
│   ├── AdSlot.tsx              # Reusable ad component
│   ├── tools/                  # Tool-specific components
│   │   ├── ToolHero.tsx
│   │   ├── ToolLayout.tsx
│   │   ├── RelatedTools.tsx
│   │   └── FaqSection.tsx
│   └── blog/                   # Blog-specific components
│       ├── BlogCard.tsx
│       └── BlogPost.tsx
│
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   ├── i18n.ts                 # Internationalization utilities
│   ├── seo.ts                  # SEO helper functions
│   ├── tools.ts                # Tool registry & utilities
│   └── blog.ts                 # Blog data layer
│
├── data/
│   └── tools.ts                # Tool metadata (can migrate to lib/tools.ts)
│
├── content/
│   └── blog/                   # MDX/Markdown blog posts
│       ├── en/                 # English posts
│       └── tr/                 # Turkish posts (future)
│
└── public/                      # Static assets
```

---

## 🔧 Core Data Models

### Tool Metadata

```typescript
interface ToolMetadata {
  id: string;                    // Unique identifier
  slug: string;                  // URL slug (e.g., "pdf-merge")
  category: string;              // Category ID
  icon: string;                  // Emoji or icon identifier
  
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
  
  // Relationships
  relatedToolIds?: string[];
  externalLink?: {
    url: string;
    label: Record<Locale, string>;
  };
}
```

### Blog Post Metadata

```typescript
interface BlogPostMetadata {
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;  // Markdown/MDX content
  date: string;                      // ISO date string
  category: string;
  tags: string[];
  author?: string;
  keywords?: Record<Locale, string>;
  relatedToolIds?: string[];
  featured?: boolean;
}
```

---

## 🌐 Internationalization (i18n)

### Current Support
- **English (en)** - Default locale
- **Turkish (tr)** - Secondary locale

### Routing Structure

**Current (Phase 1):**
- `/` → English (default)
- `/tools/[slug]` → English tool
- `/blog/[slug]` → English blog post

**Future (Phase 2):**
- `/` → English (default)
- `/tr` → Turkish homepage
- `/tr/tools/[slug]` → Turkish tool page
- `/tr/blog/[slug]` → Turkish blog post

### Implementation

Use `lib/i18n.ts` utilities:

```typescript
import { getLocalizedString, getLocaleFromPath } from '@/lib/i18n';

// Get localized content
const title = getLocalizedString(tool.title, locale);

// Get locale from URL
const locale = getLocaleFromPath(pathname);
```

---

## 📊 SEO Infrastructure

### Metadata Generation

Use `lib/seo.ts` helpers:

```typescript
import { generateToolMetadata, generateFAQSchema } from '@/lib/seo';

// Generate tool page metadata
export async function generateMetadata({ params }) {
  const tool = getTool(params.slug);
  return generateToolMetadata(tool, locale);
}

// Generate FAQ schema
const faqSchema = generateFAQSchema(tool.seoContent?.faq?.[locale] || []);
```

### Structured Data

Automatically generated for:
- **Tools**: WebApplication schema
- **Blog Posts**: Article schema
- **FAQs**: FAQPage schema (when FAQs exist)

### Sitemap & Robots

- `app/sitemap.ts` - Dynamically generates sitemap from tools + blog posts
- `app/robots.ts` - Robots.txt configuration

---

## 💰 Monetization (Ad Integration)

### AdSlot Component

Reusable ad placement component:

```tsx
import { AdSlot } from '@/components/AdSlot';

// In tool page
<AdSlot position="tool-top" />
<AdSlot position="tool-bottom" />
<AdSlot position="tool-sidebar" format="sidebar" />

// In blog post
<AdSlot position="blog-top" />
<AdSlot position="blog-middle" format="in-article" />
<AdSlot position="blog-bottom" />
```

### Ad Positions

- `tool-top` - Above tool UI
- `tool-bottom` - Below tool UI
- `tool-sidebar` - Sidebar (desktop only)
- `blog-top` - Top of blog post
- `blog-middle` - Middle of blog post content
- `blog-bottom` - Bottom of blog post
- `home-hero` - Homepage hero section
- `home-bottom` - Homepage bottom

### Integration Steps

1. **Current**: Uses `AdSense` component (placeholder)
2. **Future**: Replace `AdSlot` internals with actual ad network code
3. **Advanced**: Add ad refresh logic, frequency capping, etc.

---

## 🛠️ Adding New Tools

### Step 1: Add Tool Metadata

In `data/tools.ts` (or migrate to `lib/tools.ts`):

```typescript
{
  id: 'my-new-tool',
  slug: 'my-new-tool',
  category: 'PDF',
  icon: '🔧',
  title: {
    en: 'My New Tool',
    tr: 'Yeni Aracım',
  },
  description: {
    en: 'Does something amazing',
    tr: 'Harika bir şey yapar',
  },
  keywords: {
    en: 'tool, online, free',
    tr: 'araç, online, ücretsiz',
  },
  featured: true,
}
```

### Step 2: Create Tool Component

In `components/tools/my-new-tool.tsx`:

```tsx
'use client';

export default function MyNewTool() {
  // Your tool UI and logic here
  return (
    <div>
      {/* Tool interface */}
    </div>
  );
}
```

### Step 3: Register Component

In `lib/tool-components.tsx`:

```typescript
import MyNewTool from '@/components/tools/my-new-tool';

export const toolComponents = {
  'my-new-tool': MyNewTool,
  // ... other tools
};
```

### Step 4: Add SEO Content (Optional)

In tool metadata:

```typescript
seoContent: {
  howTo: {
    en: [
      'Step 1: Upload your file',
      'Step 2: Click process',
      'Step 3: Download result',
    ],
    tr: [
      'Adım 1: Dosyanızı yükleyin',
      'Adım 2: İşleme tıklayın',
      'Adım 3: Sonucu indirin',
    ],
  },
  faq: {
    en: [
      {
        question: 'Is it free?',
        answer: 'Yes, completely free!',
      },
    ],
    tr: [
      {
        question: 'Ücretsiz mi?',
        answer: 'Evet, tamamen ücretsiz!',
      },
    ],
  },
}
```

---

## 📝 Adding New Blog Posts

### Step 1: Create Markdown File

In `content/blog/en/my-new-post.md`:

```markdown
---
title: My New Blog Post
excerpt: A brief description of the post
date: 2024-01-15
category: PDF
tags: [pdf, tutorial, guide]
keywords: pdf tutorial, how to pdf
relatedToolIds: [pdf-merge, pdf-split]
---

# My New Blog Post

Content here in Markdown...
```

### Step 2: Turkish Version (Optional)

In `content/blog/tr/my-new-post.md`:

```markdown
---
title: Yeni Blog Yazım
excerpt: Yazının kısa açıklaması
date: 2024-01-15
category: PDF
tags: [pdf, eğitim, rehber]
keywords: pdf eğitimi, pdf nasıl
relatedToolIds: [pdf-merge, pdf-split]
---

# Yeni Blog Yazım

Markdown içerik burada...
```

### Step 3: Blog System Auto-Detects

The `lib/blog.ts` system automatically:
- Reads all `.md` files from `content/blog/`
- Parses frontmatter
- Generates blog post objects
- Supports i18n (when locale folders are added)

---

## 🎨 Design System

### Color Palette

```css
/* Background */
--bg-primary: #f9fafb;      /* Soft off-white */
--bg-secondary: #ffffff;     /* Pure white */

/* Primary Accent */
--primary: #2563eb;         /* Calm blue */
--primary-hover: #1d4ed8;

/* Neutrals */
--text-primary: #111827;    /* Dark gray */
--text-secondary: #6b7280;   /* Medium gray */
--text-muted: #9ca3af;      /* Light gray */

/* Borders */
--border: #e5e7eb;          /* Light gray */
```

### Typography

- **Headings**: Bold, clear hierarchy
- **Body**: Comfortable line-height (1.6-1.8)
- **Font**: Inter (Google Fonts)

### Components

- **Cards**: `rounded-xl`, `shadow-md`, generous padding
- **Buttons**: `rounded-lg`, clear hover states
- **Spacing**: Consistent 4px/8px/16px/24px scale

---

## 🚀 Performance Optimization

### Code Splitting

- Tools are lazy-loaded via dynamic imports
- Blog posts are statically generated
- Images are optimized via Next.js Image component

### Caching

- Static pages: Generated at build time
- Tool pages: ISR (Incremental Static Regeneration)
- Blog posts: Static generation

### Bundle Size

- Tree-shaking enabled
- Dynamic imports for heavy libraries (pdf-lib, etc.)
- Minimal dependencies

---

## 📈 Scalability Considerations

### Current Capacity

- **Tools**: 100+ tools (tested)
- **Blog Posts**: 1000+ posts (theoretical)
- **Traffic**: Optimized for 10k+ daily users

### Future Scaling

1. **Database Migration**: Move from file-based to database (PostgreSQL/MongoDB)
2. **CDN**: Use Vercel Edge Network or Cloudflare
3. **Caching**: Redis for frequently accessed data
4. **Search**: Algolia or similar for tool/blog search
5. **Analytics**: Custom analytics dashboard

---

## 🔐 Security

### Current Measures

- No server-side file storage (browser-based processing)
- Input validation on all user inputs
- XSS protection via React
- CSRF protection via Next.js

### Future Enhancements

- Rate limiting (API routes)
- DDoS protection (Vercel/Cloudflare)
- Security headers (helmet.js)
- Content Security Policy (CSP)

---

## 🧪 Testing Strategy

### Current

- Manual testing
- TypeScript for type safety
- Build-time validation

### Future

- Unit tests (Jest)
- E2E tests (Playwright)
- Visual regression (Percy)
- Performance monitoring (Lighthouse CI)

---

## 📚 Documentation

### For Developers

- `ARCHITECTURE.md` (this file)
- `ROADMAP.md` - Feature roadmap
- Inline code comments

### For Content Creators

- Blog post template
- Tool metadata guide
- SEO best practices

---

## 🔄 Migration Paths

### Tool Data Migration

**Current**: `data/tools.ts` (TypeScript array)
**Future**: Database or CMS

Migration steps:
1. Export current tools to JSON
2. Import into database
3. Update `lib/tools.ts` to query database
4. Keep backward compatibility during transition

### Blog Migration

**Current**: Markdown files in `content/blog/`
**Future**: Headless CMS (Contentful, Strapi) or database

Migration steps:
1. Keep Markdown as source of truth initially
2. Add CMS layer on top
3. Gradually migrate content
4. Support both during transition

---

## 🎯 Next Steps

See `ROADMAP.md` for detailed feature roadmap and priorities.

---

*Last Updated: [Current Date]*
*Version: 1.0*


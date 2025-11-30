# 👨‍💻 OmniToolset Developer Guide

Quick reference for developers working on the OmniToolset platform.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup

```bash
# Clone repository
git clone [repository-url]
cd omnitoolset

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000`

---

## 📁 Key Files & Directories

### App Router (`app/`)

- `app/layout.tsx` - Root layout
- `app/page.tsx` - Homepage
- `app/tools/[slug]/page.tsx` - Dynamic tool pages
- `app/blog/[slug]/page.tsx` - Dynamic blog posts
- `app/sitemap.ts` - Sitemap generation
- `app/robots.ts` - Robots.txt

### Components (`components/`)

- `components/Header.tsx` - Main navigation
- `components/Footer.tsx` - Site footer
- `components/AdSlot.tsx` - Ad placement component
- `components/tools/` - Tool-specific components
- `components/blog/` - Blog-specific components

### Libraries (`lib/`)

- `lib/types.ts` - TypeScript type definitions
- `lib/i18n.ts` - Internationalization utilities
- `lib/seo.ts` - SEO helper functions
- `lib/tools.ts` - Tool registry (future)
- `lib/blog.ts` - Blog data layer

### Data (`data/`)

- `data/tools.ts` - Tool metadata array

### Content (`content/`)

- `content/blog/` - Markdown blog posts

---

## 🛠️ Adding a New Tool

### 1. Add Tool Metadata

Edit `data/tools.ts`:

```typescript
{
  id: 'my-tool',
  slug: 'my-tool',
  category: 'PDF',
  icon: '🔧',
  title: 'My Tool',
  description: 'Does something useful',
  keywords: 'tool, online, free',
}
```

### 2. Create Tool Component

Create `components/tools/my-tool.tsx`:

```tsx
'use client';

export default function MyTool() {
  return (
    <div>
      {/* Your tool UI */}
    </div>
  );
}
```

### 3. Register Component

Edit `lib/tool-components.tsx`:

```typescript
import MyTool from '@/components/tools/my-tool';

export const toolComponents = {
  'my-tool': MyTool,
  // ... other tools
};
```

### 4. Test

Visit `/tools/my-tool` to see your tool.

---

## 📝 Adding a Blog Post

### 1. Create Markdown File

Create `content/blog/my-post.md`:

```markdown
---
title: My Blog Post
excerpt: Brief description
date: 2024-01-15
category: PDF
tags: [pdf, tutorial]
keywords: pdf tutorial
---

# My Blog Post

Content here...
```

### 2. Test

Visit `/blog/my-post` to see your post.

---

## 🎨 Styling Guidelines

### Colors

```typescript
// Primary
bg-blue-600      // Primary actions
text-blue-600    // Primary text

// Backgrounds
bg-gray-50       // Light background
bg-white         // Card background

// Text
text-gray-900    // Primary text
text-gray-600    // Secondary text
text-gray-400    // Muted text
```

### Spacing

- Use Tailwind spacing scale: `p-4`, `mb-6`, `gap-4`
- Consistent padding: `p-6` for cards, `p-8` for large sections

### Components

- Cards: `rounded-xl`, `shadow-md`, `p-6`
- Buttons: `rounded-lg`, `px-4 py-2`
- Inputs: `rounded-lg`, `border`, `px-4 py-2`

---

## 🔍 SEO Best Practices

### Metadata

Use `lib/seo.ts` helpers:

```typescript
import { generateToolMetadata } from '@/lib/seo';

export async function generateMetadata({ params }) {
  const tool = getTool(params.slug);
  return generateToolMetadata(tool);
}
```

### Structured Data

Add JSON-LD schemas:

```typescript
const schema = generateFAQSchema(faqs);
```

### Content

- Use semantic HTML (`<h1>`, `<h2>`, `<article>`, etc.)
- Include keywords naturally
- Write for humans first, SEO second

---

## 💰 Ad Integration

### Using AdSlot

```tsx
import { AdSlot } from '@/components/AdSlot';

// In tool page
<AdSlot position="tool-top" />
<AdSlot position="tool-bottom" />

// In blog post
<AdSlot position="blog-top" />
<AdSlot position="blog-middle" format="in-article" />
```

### Ad Positions

- `tool-top`, `tool-bottom`, `tool-sidebar`
- `blog-top`, `blog-middle`, `blog-bottom`
- `home-hero`, `home-bottom`

---

## 🌐 Internationalization

### Getting Localized Strings

```typescript
import { getLocalizedString } from '@/lib/i18n';

const title = getLocalizedString(tool.title, locale);
```

### Adding Translations

In tool metadata:

```typescript
title: {
  en: 'My Tool',
  tr: 'Benim Aracım',
}
```

---

## 🧪 Testing

### Manual Testing

1. Test tool functionality
2. Check responsive design
3. Verify SEO metadata
4. Test ad placements

### Build Test

```bash
npm run build
```

Ensure no TypeScript errors.

---

## 🐛 Debugging

### Common Issues

**Tool not showing:**
- Check `tool-components.tsx` registration
- Verify tool ID matches slug

**Blog post not found:**
- Check file exists in `content/blog/`
- Verify frontmatter format

**SEO not working:**
- Check metadata export
- Verify structured data format

### Debug Mode

Set `showPlaceholder={true}` in AdSlot to see ad positions.

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

*Last Updated: [Current Date]*


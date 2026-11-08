import { SITE } from '@/lib/site';
import { TOOLS } from '@/lib/tools';
import { POSTS } from '@/lib/posts';

export default function sitemap() {
  const now = new Date('2026-11-07');
  return [
    { url: SITE.url, lastModified: now, priority: 1 },
    ...TOOLS.map((t) => ({ url: `${SITE.url}/tools/${t.slug}`, lastModified: now, priority: 0.9 })),
    { url: `${SITE.url}/blog`, lastModified: now, priority: 0.6 },
    ...POSTS.map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.7 })),
    ...['about', 'privacy', 'terms', 'contact'].map((s) => ({ url: `${SITE.url}/${s}`, lastModified: now, priority: 0.3 })),
  ];
}

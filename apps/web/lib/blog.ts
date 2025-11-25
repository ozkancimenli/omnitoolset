import fs from 'fs';
import path from 'path';
import { cache } from 'react';

// Dynamic import for gray-matter
function parseMarkdown(fileContents: string) {
  try {
    const matter = require('gray-matter');
    return matter(fileContents);
  } catch {
    // Fallback: simple frontmatter parser
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = fileContents.match(frontMatterRegex);
    if (match) {
      const frontMatter = match[1];
      const content = match[2];
      const data: any = {};
      frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          data[key.trim()] = value;
        }
      });
      return { data, content };
    }
    return { data: {}, content: fileContents };
  }
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  icon: string;
  keywords: string;
  readingTime: number;
}

const blogDirectory = path.join(process.cwd(), 'content/blog');

// Ensure blog directory exists
if (!fs.existsSync(blogDirectory)) {
  fs.mkdirSync(blogDirectory, { recursive: true });
}

// Cache blog posts to reduce file system I/O
export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  try {
    if (!fs.existsSync(blogDirectory)) {
      return [];
    }

    const fileNames = fs.readdirSync(blogDirectory);
    const posts = fileNames
      .filter(name => name.endsWith('.md'))
      .map((fileName) => {
        const fullPath = path.join(blogDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = parseMarkdown(fileContents);

        return {
          slug: fileName.replace(/\.md$/, ''),
          title: data.title || 'Untitled',
          excerpt: data.excerpt || content.substring(0, 150) + '...',
          content,
          date: data.date || new Date().toISOString(),
          category: data.category || 'Guide',
          icon: data.icon || '📝',
          keywords: data.keywords || '',
          readingTime: Math.ceil(content.split(/\s+/).length / 200),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return posts;
  } catch {
    return [];
  }
});

// Cache individual blog posts
export const getBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = parseMarkdown(fileContents);

    return {
      slug,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || content.substring(0, 150) + '...',
      content,
      date: data.date || new Date().toISOString(),
      category: data.category || 'Guide',
      icon: data.icon || '📝',
      keywords: data.keywords || '',
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
    };
  } catch {
    return null;
  }
});


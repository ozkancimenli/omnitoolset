'use client';

import Link from 'next/link';
import { BlogSidebarAd } from '@/components/OptimizedAd';

/**
 * Blog Sidebar Component
 * 
 * WordPress-style sidebar with:
 * - Ad slots (desktop only)
 * - Related posts
 * - Categories
 * - Popular posts
 * - Newsletter signup (optional)
 */
interface BlogSidebarProps {
  currentPostSlug?: string;
  currentCategory?: string;
}

export default function BlogSidebar({ currentPostSlug, currentCategory }: BlogSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Sidebar Ad - Top */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <BlogSidebarAd />
      </div>

      {/* Popular Posts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
          Popular Posts
        </h3>
        <ul className="space-y-3">
          {[
            { title: 'How to Merge PDF Files Online', slug: 'how-to-merge-pdf-files' },
            { title: 'Best Free PDF Tools 2024', slug: 'best-free-pdf-tools-online' },
            { title: 'How to Compress PDF Files', slug: 'how-to-compress-pdf-files' },
          ].map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
          Categories
        </h3>
        <ul className="space-y-2">
          {['PDF Tools', 'Image Tools', 'Productivity', 'Tutorials', 'Guides'].map((category) => (
            <li key={category}>
              <Link
                href={`/blog?category=${category.toLowerCase()}`}
                className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-between"
              >
                <span>{category}</span>
                <span className="text-xs text-gray-400 dark:text-slate-500">(12)</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Sidebar Ad - Middle */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <BlogSidebarAd />
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">
          Stay Updated
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Get the latest tools and tips delivered to your inbox.
        </p>
        <form className="space-y-2">
          <input
            type="email"
            placeholder="Your email"
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Sidebar Ad - Bottom */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <BlogSidebarAd />
      </div>
    </aside>
  );
}


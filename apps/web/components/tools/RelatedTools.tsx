'use client';

import Link from 'next/link';
import { tools } from '@/data/tools';

interface RelatedToolsProps {
  currentToolSlug: string;
  category?: string;
  limit?: number;
}

export default function RelatedTools({ currentToolSlug, category, limit = 4 }: RelatedToolsProps) {
  const relatedTools = tools
    .filter(tool => tool.slug !== currentToolSlug && (!category || tool.category === category))
    .slice(0, limit);

  if (relatedTools.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
          Related Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


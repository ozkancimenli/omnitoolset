'use client';

import Link from 'next/link';
import { Tool } from '@/data/tools';
import { tools } from '@/data/tools';

interface RelatedToolsProps {
  currentTool: Tool;
  limit?: number;
}

export default function RelatedTools({ currentTool, limit = 4 }: RelatedToolsProps) {
  // Get tools from the same category, excluding current tool
  const related = tools
    .filter(tool => 
      tool.category === currentTool.category && 
      tool.id !== currentTool.id
    )
    .slice(0, limit);

  if (related.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-slate-100">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="text-3xl mb-2">{tool.icon}</div>
            <h3 className="font-semibold text-slate-100 mb-1">{tool.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}


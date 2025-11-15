'use client';

import Link from 'next/link';
import { Tool } from '@/data/tools';
import { addRecentTool } from '@/lib/recent-tools';

interface ToolCardProps {
  tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
  const handleClick = () => {
    addRecentTool({
      id: tool.id,
      title: tool.title,
      slug: tool.slug,
    });
  };

  return (
    <Link href={`/tools/${tool.slug}`} onClick={handleClick}>
      <div className="tool-card">
        <div className="text-5xl mb-4">{tool.icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-slate-100 dark:text-slate-100 light:text-gray-900">{tool.title}</h3>
        <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 text-sm mb-4">{tool.description}</p>
        <span className="inline-block px-3 py-1 bg-indigo-500/20 dark:bg-indigo-500/20 light:bg-indigo-100 text-indigo-400 dark:text-indigo-400 light:text-indigo-700 rounded-full text-xs font-medium">
          {tool.category}
        </span>
      </div>
    </Link>
  );
}

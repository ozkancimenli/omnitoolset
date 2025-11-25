'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getRecentTools, clearRecentTools, RecentTool } from '@/lib/recent-tools';
import { toast } from './Toast';

const RecentTools = memo(function RecentTools() {
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);

  useEffect(() => {
    setRecentTools(getRecentTools());
  }, []);

  if (recentTools.length === 0) {
    return null;
  }

  const handleClear = useCallback(() => {
    clearRecentTools();
    setRecentTools([]);
    toast.success('Recent tools cleared!');
  }, []);

  return (
    <div className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-gray-50 border border-slate-700 dark:border-slate-700 light:border-gray-200 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200 dark:text-slate-200 light:text-gray-800 flex items-center gap-2">
          <span>🕒</span>
          Recent Tools
        </h3>
        <button
          onClick={handleClear}
          className="text-xs text-slate-400 dark:text-slate-400 light:text-gray-600 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-gray-800 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recentTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
            className="px-3 py-1.5 bg-indigo-500/20 dark:bg-indigo-500/20 light:bg-indigo-100 hover:bg-indigo-500/30 dark:hover:bg-indigo-500/30 light:hover:bg-indigo-200 text-indigo-300 dark:text-indigo-300 light:text-indigo-700 rounded-lg text-sm transition-colors"
          >
            {tool.title}
          </Link>
        ))}
      </div>
    </div>
  );
});

RecentTools.displayName = 'RecentTools';

export default RecentTools;


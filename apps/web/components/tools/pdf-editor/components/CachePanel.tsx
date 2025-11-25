'use client';

import React from 'react';

interface CacheStats {
  size: number;
  entries: number;
  maxSize: number;
  maxEntries: number;
}

interface CachePanelProps {
  show: boolean;
  onClose: () => void;
  cacheStats: CacheStats | null;
  pdfEngineRef: React.RefObject<any>;
}

export const CachePanel: React.FC<CachePanelProps> = ({
  show,
  onClose,
  cacheStats,
  pdfEngineRef,
}) => {
  if (!show || !cacheStats || !pdfEngineRef.current) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Advanced Cache</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Cache Size</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{(cacheStats.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Entries</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{cacheStats.entries}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Max Size</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{(cacheStats.maxSize / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Max Entries</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{cacheStats.maxEntries}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Advanced cache with automatic compression and LRU eviction for optimal memory usage.
          </div>
        </div>
      </div>
    </div>
  );
};





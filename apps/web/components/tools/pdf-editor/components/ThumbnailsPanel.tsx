'use client';

import React from 'react';

export interface ThumbnailsPanelProps {
  show: boolean;
  numPages: number;
  pageNum: number;
  setPageNum: (page: number) => void;
  pageThumbnails: string[];
}

export function ThumbnailsPanel({
  show,
  numPages,
  pageNum,
  setPageNum,
  pageThumbnails,
}: ThumbnailsPanelProps) {
  if (!show) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-2xl z-40 transform transition-transform duration-300">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">📑</span>
            <span>Pages</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
            {numPages}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto h-full">
        {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setPageNum(page)}
            className={`w-full group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              page === pageNum
                ? 'border-gray-500 bg-gray-50 dark:bg-gray-950/50 shadow-lg shadow-gray-500/20 scale-[1.02]'
                : 'border-slate-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-slate-800 hover:shadow-md'
            }`}
          >
            {page === pageNum && (
              <div className="absolute top-2 right-2 z-10 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                Active
              </div>
            )}
            <div className="p-2">
              {pageThumbnails[page - 1] ? (
                <img
                  src={pageThumbnails[page - 1]}
                  alt={`Page ${page}`}
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Page {page}</span>
                </div>
              )}
              <p className={`text-xs mt-2 text-center font-medium ${page === pageNum ? 'text-gray-900 dark:text-gray-400' : 'text-slate-500 dark:text-slate-400'}`}>
                Page {page}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}



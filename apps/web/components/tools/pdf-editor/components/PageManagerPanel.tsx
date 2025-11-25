'use client';

import React from 'react';

export interface PageManagerPanelProps {
  show: boolean;
  onClose: () => void;
  pageNum: number;
  numPages: number;
  setPageNum: (page: number) => void;
  pageRotations: Record<number, number>;
  deletedPages: Set<number>;
  rotatePage: (page: number, degrees: number) => void;
  deletePage: (page: number) => void;
  insertBlankPage: (afterPage: number) => void;
}

export function PageManagerPanel({
  show,
  onClose,
  pageNum,
  numPages,
  setPageNum,
  pageRotations,
  deletedPages,
  rotatePage,
  deletePage,
  insertBlankPage,
}: PageManagerPanelProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Page Manager</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Page Rotation */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Page Rotation</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300">Current Page ({pageNum}):</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => rotatePage(pageNum, 90)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    title="Rotate 90° clockwise"
                  >
                    ↻ 90°
                  </button>
                  <button
                    onClick={() => rotatePage(pageNum, 180)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    title="Rotate 180°"
                  >
                    ↻ 180°
                  </button>
                  <button
                    onClick={() => rotatePage(pageNum, -90)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    title="Rotate 90° counter-clockwise"
                  >
                    ↺ 90°
                  </button>
                </div>
                {pageRotations[pageNum] && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Current: {pageRotations[pageNum]}°
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 dark:border-slate-600"></div>

          {/* Page Deletion */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Page Deletion</h4>
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Delete the current page. This action cannot be undone.
              </p>
              <button
                onClick={() => deletePage(pageNum)}
                disabled={numPages <= 1}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Page {pageNum}
              </button>
              {deletedPages.has(pageNum) && (
                <p className="text-xs text-red-600 dark:text-red-400">Page {pageNum} marked for deletion</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-300 dark:border-slate-600"></div>

          {/* Page Insertion */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Insert Blank Page</h4>
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Insert a blank page after the current page.
              </p>
              <button
                onClick={() => insertBlankPage(pageNum)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Insert Blank Page After Page {pageNum}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-300 dark:border-slate-600"></div>

          {/* Page List */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">All Pages ({numPages})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                <div
                  key={page}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    page === pageNum
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Page {page}
                    </span>
                    {pageRotations[page] && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {pageRotations[page]}°
                      </span>
                    )}
                    {deletedPages.has(page) && (
                      <span className="text-xs text-red-600 dark:text-red-400">(Deleted)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {page !== pageNum && (
                      <button
                        onClick={() => setPageNum(page)}
                        className="px-3 py-1 text-xs bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-500"
                      >
                        Go
                      </button>
                    )}
                    <button
                      onClick={() => rotatePage(page, 90)}
                      className="px-3 py-1 text-xs bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-300 dark:hover:bg-blue-700"
                      title="Rotate 90°"
                    >
                      ↻
                    </button>
                    {numPages > 1 && (
                      <button
                        onClick={() => deletePage(page)}
                        className="px-3 py-1 text-xs bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-300 dark:hover:bg-red-700"
                        title="Delete"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

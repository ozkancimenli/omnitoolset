'use client';

import React from 'react';

interface PageFeaturesPanelProps {
  show: boolean;
  onClose: () => void;
  pageNum: number;
  pageNumberFormat: '1' | '1/10' | 'Page 1' | '1 of 10';
  pageNumberPosition: 'header' | 'footer';
  showPageNumbering: boolean;
  pageHeaders: Record<number, { text: string }>;
  pageFooters: Record<number, { text: string }>;
  pageBackgroundColors: Record<number, string>;
  setPageNumberFormat: (format: '1' | '1/10' | 'Page 1' | '1 of 10') => void;
  setPageNumberPosition: (position: 'header' | 'footer') => void;
  applyPageNumbering: () => void;
  addPageHeader: (pageNum: number, text: string) => void;
  addPageFooter: (pageNum: number, text: string) => void;
  setPageBackground: (pageNum: number, color: string) => void;
}

export const PageFeaturesPanel: React.FC<PageFeaturesPanelProps> = ({
  show,
  onClose,
  pageNum,
  pageNumberFormat,
  pageNumberPosition,
  showPageNumbering,
  pageHeaders,
  pageFooters,
  pageBackgroundColors,
  setPageNumberFormat,
  setPageNumberPosition,
  applyPageNumbering,
  addPageHeader,
  addPageFooter,
  setPageBackground,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Page Features</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Page Numbering</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300">Format:</label>
                <select value={pageNumberFormat} onChange={(e) => setPageNumberFormat(e.target.value as any)} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm">
                  <option value="1">1</option>
                  <option value="1/10">1/10</option>
                  <option value="Page 1">Page 1</option>
                  <option value="1 of 10">1 of 10</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300">Position:</label>
                <select value={pageNumberPosition} onChange={(e) => setPageNumberPosition(e.target.value as any)} className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm">
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <button onClick={applyPageNumbering} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                {showPageNumbering ? 'Update Page Numbers' : 'Apply Page Numbering'}
              </button>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Headers & Footers</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Header for Page {pageNum}:</label>
                <input type="text" placeholder="Enter header text..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm" onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addPageHeader(pageNum, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }} />
                {pageHeaders[pageNum] && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current: {pageHeaders[pageNum].text}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-300 mb-1">Footer for Page {pageNum}:</label>
                <input type="text" placeholder="Enter footer text..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm" onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addPageFooter(pageNum, e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }} />
                {pageFooters[pageNum] && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current: {pageFooters[pageNum].text}</p>}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Page Background</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300">Background Color for Page {pageNum}:</label>
                <input type="color" value={pageBackgroundColors[pageNum] || '#ffffff'} onChange={(e) => setPageBackground(pageNum, e.target.value)} className="w-12 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600" />
                {pageBackgroundColors[pageNum] && <span className="text-xs text-slate-500 dark:text-slate-400">{pageBackgroundColors[pageNum]}</span>}
              </div>
              <button onClick={() => setPageBackground(pageNum, '#ffffff')} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
                Reset to White
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





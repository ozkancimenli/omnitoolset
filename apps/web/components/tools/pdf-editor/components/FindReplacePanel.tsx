'use client';

import React from 'react';

interface FindReplacePanelProps {
  showFindReplace: boolean;
  setShowFindReplace: (show: boolean) => void;
  findText: string;
  setFindText: (text: string) => void;
  replaceText: string;
  setReplaceText: (text: string) => void;
  useRegex: boolean;
  setUseRegex: (use: boolean) => void;
  caseSensitive: boolean;
  setCaseSensitive: (sensitive: boolean) => void;
  wholeWords: boolean;
  setWholeWords: (words: boolean) => void;
  findResults: any[];
  currentFindIndex: number;
  findTextInPdf: () => void;
  replaceTextInPdf: () => void;
  navigateFindResults: (direction: 'prev' | 'next') => void;
  toast: any;
}

export const FindReplacePanel: React.FC<FindReplacePanelProps> = ({
  showFindReplace,
  setShowFindReplace,
  findText,
  setFindText,
  replaceText,
  setReplaceText,
  useRegex,
  setUseRegex,
  caseSensitive,
  setCaseSensitive,
  wholeWords,
  setWholeWords,
  findResults,
  currentFindIndex,
  findTextInPdf,
  replaceTextInPdf,
  navigateFindResults,
  toast,
}) => {
  if (!showFindReplace) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[400px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find & Replace</h3>
        <button
          onClick={() => setShowFindReplace(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                findTextInPdf();
              }
            }}
            placeholder="Find..."
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          />
          <button
            onClick={findTextInPdf}
            disabled={!findText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Find
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                replaceTextInPdf();
              }
            }}
            placeholder="Replace with..."
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          />
          <button
            onClick={replaceTextInPdf}
            disabled={!findText.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Replace All
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="rounded"
            />
            Regex
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded"
            />
            Case sensitive
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={wholeWords}
              onChange={(e) => setWholeWords(e.target.checked)}
              className="rounded"
            />
            Whole words
          </label>
        </div>
        {findResults.length > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>
              {currentFindIndex + 1} of {findResults.length} results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => navigateFindResults('prev')}
                disabled={currentFindIndex <= 0}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40"
              >
                ↑ Prev
              </button>
              <button
                onClick={() => navigateFindResults('next')}
                disabled={currentFindIndex >= findResults.length - 1}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40"
              >
                ↓ Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





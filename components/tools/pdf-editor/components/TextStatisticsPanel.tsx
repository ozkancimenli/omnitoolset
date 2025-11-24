'use client';

import React from 'react';

interface TextStatistics {
  pagesAnalyzed?: number;
  characterCount: number;
  wordCount: number;
  lineCount: number;
  paragraphCount: number;
  sentenceCount: number;
  totalRuns?: number;
  averageWordsPerSentence?: number;
  averageCharactersPerWord?: number;
  averageWordsPerPage?: number;
  averageCharsPerPage?: number;
  pageStats?: Array<{ page: number; words: number; chars: number }>;
}

interface TextStatisticsPanelProps {
  show: boolean;
  onClose: () => void;
  textStatistics: TextStatistics | null;
}

export const TextStatisticsPanel: React.FC<TextStatisticsPanelProps> = ({
  show,
  onClose,
  textStatistics,
}) => {
  if (!show || !textStatistics) return null;

  return (
    <div className="absolute top-20 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Text Statistics</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3 text-sm">
        {textStatistics.pagesAnalyzed && (
          <div className="text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">
            Analyzing {textStatistics.pagesAnalyzed} page(s)
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-gray-400 text-xs">Characters</span>
            <span className="font-semibold text-gray-900 dark:text-white text-lg">{textStatistics.characterCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-gray-400 text-xs">Words</span>
            <span className="font-semibold text-gray-900 dark:text-white text-lg">{textStatistics.wordCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-gray-400 text-xs">Lines</span>
            <span className="font-semibold text-gray-900 dark:text-white text-lg">{textStatistics.lineCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-gray-400 text-xs">Paragraphs</span>
            <span className="font-semibold text-gray-900 dark:text-white text-lg">{textStatistics.paragraphCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-gray-400 text-xs">Sentences</span>
            <span className="font-semibold text-gray-900 dark:text-white text-lg">{textStatistics.sentenceCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-600 dark:text-gray-400 text-xs">Text Runs</span>
            <span className="font-semibold text-gray-900 dark:text-white text-lg">{textStatistics.totalRuns?.toLocaleString() || 'N/A'}</span>
          </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Avg. Words/Sentence:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{textStatistics.averageWordsPerSentence?.toFixed(1) || '0.0'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Avg. Chars/Word:</span>
            <span className="font-semibold text-gray-900 dark:text-white">{textStatistics.averageCharactersPerWord?.toFixed(1) || '0.0'}</span>
          </div>
          {textStatistics.averageWordsPerPage && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Avg. Words/Page:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{textStatistics.averageWordsPerPage.toLocaleString()}</span>
            </div>
          )}
          {textStatistics.averageCharsPerPage && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Avg. Chars/Page:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{textStatistics.averageCharsPerPage.toLocaleString()}</span>
            </div>
          )}
        </div>
        {textStatistics.pageStats && textStatistics.pageStats.length > 1 && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Page Breakdown</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {textStatistics.pageStats.map((pageStat) => (
                <div key={pageStat.page} className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Page {pageStat.page + 1}:</span>
                  <span className="text-gray-900 dark:text-white">
                    {pageStat.words} words, {pageStat.chars} chars
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





// Download Bar Component
'use client';

import React from 'react';

interface DownloadBarProps {
  showExportOptions: boolean;
  onToggleExportOptions: () => void;
  onDownload: () => void;
  isProcessing: boolean;
  hasAnnotations: boolean;
}

export const DownloadBar: React.FC<DownloadBarProps> = ({
  showExportOptions,
  onToggleExportOptions,
  onDownload,
  isProcessing,
  hasAnnotations,
}) => {
  return (
    <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg flex-shrink-0 flex justify-center gap-2">
      <button
        onClick={onToggleExportOptions}
        disabled={isProcessing}
        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
        title="Export Options"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Options</span>
      </button>
      <button
        onClick={onDownload}
        disabled={isProcessing || !hasAnnotations}
        className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download PDF</span>
          </>
        )}
      </button>
    </div>
  );
};



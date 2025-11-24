'use client';

import React from 'react';

interface ExportOptionsPanelProps {
  show: boolean;
  onClose: () => void;
  exportQuality: 'low' | 'medium' | 'high';
  exportFormat: 'pdf' | 'pdf-a';
  exportToFormat: 'pdf' | 'png' | 'jpg' | 'html' | 'txt';
  isProcessing: boolean;
  onQualityChange: (quality: 'low' | 'medium' | 'high') => void;
  onFormatChange: (format: 'pdf' | 'pdf-a') => void;
  onExportToFormatChange: (format: 'pdf' | 'png' | 'jpg' | 'html' | 'txt') => void;
  onExport: () => Promise<void>;
}

export const ExportOptionsPanel: React.FC<ExportOptionsPanelProps> = ({
  show,
  onClose,
  exportQuality,
  exportFormat,
  exportToFormat,
  isProcessing,
  onQualityChange,
  onFormatChange,
  onExportToFormatChange,
  onExport,
}) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[350px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Options</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality</label>
          <select
            value={exportQuality}
            onChange={(e) => onQualityChange(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100"
          >
            <option value="high">High (Best Quality)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="low">Low (Smaller File)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
          <select
            value={exportFormat}
            onChange={(e) => onFormatChange(e.target.value as 'pdf' | 'pdf-a')}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100"
          >
            <option value="pdf">PDF (Standard)</option>
            <option value="pdf-a">PDF/A (Archival)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export As</label>
          <select
            value={exportToFormat}
            onChange={(e) => onExportToFormatChange(e.target.value as 'pdf' | 'png' | 'jpg' | 'html' | 'txt')}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100"
          >
            <option value="pdf">PDF</option>
            <option value="png">PNG Image</option>
            <option value="jpg">JPG Image</option>
            <option value="html">HTML</option>
            <option value="txt">Text (TXT)</option>
          </select>
        </div>
        <button
          onClick={onExport}
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? 'Exporting...' : `Export ${exportToFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
};





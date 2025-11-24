'use client';

import React from 'react';

interface BinaryAnalysisData {
  header?: {
    version: string;
    offset: number;
  };
  xref?: {
    subsections?: any[];
    trailer?: {
      Size: number;
      Root: string;
    };
  };
  objects?: any[];
  validation?: {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
}

interface BinaryAnalysisPanelProps {
  show: boolean;
  onClose: () => void;
  binaryAnalysisData: BinaryAnalysisData | null;
}

export const BinaryAnalysisPanel: React.FC<BinaryAnalysisPanelProps> = ({
  show,
  onClose,
  binaryAnalysisData,
}) => {
  if (!show || !binaryAnalysisData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Binary Structure Analysis</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          {binaryAnalysisData.header && (
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">PDF Header</h4>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <div>Version: {binaryAnalysisData.header.version}</div>
                <div>Offset: {binaryAnalysisData.header.offset}</div>
              </div>
            </div>
          )}
          
          {binaryAnalysisData.xref && (
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Cross-Reference Table</h4>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <div>Subsections: {binaryAnalysisData.xref.subsections?.length || 0}</div>
                {binaryAnalysisData.xref.trailer && (
                  <div className="mt-2">
                    <div>Size: {binaryAnalysisData.xref.trailer.Size}</div>
                    <div>Root: {binaryAnalysisData.xref.trailer.Root}</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {binaryAnalysisData.objects && (
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">PDF Objects</h4>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                Total Objects: {binaryAnalysisData.objects.length}
              </div>
            </div>
          )}
          
          {binaryAnalysisData.validation && (
            <div className={`p-4 rounded-lg ${
              binaryAnalysisData.validation.valid 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Validation</h4>
              <div className="text-sm">
                <div className={binaryAnalysisData.validation.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  Status: {binaryAnalysisData.validation.valid ? 'Valid' : 'Invalid'}
                </div>
                {binaryAnalysisData.validation.errors && binaryAnalysisData.validation.errors.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold">Errors:</div>
                    <ul className="list-disc list-inside">
                      {binaryAnalysisData.validation.errors.map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {binaryAnalysisData.validation.warnings && binaryAnalysisData.validation.warnings.length > 0 && (
                  <div className="mt-2">
                    <div className="font-semibold">Warnings:</div>
                    <ul className="list-disc list-inside">
                      {binaryAnalysisData.validation.warnings.map((warning: string, idx: number) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};





'use client';

import React from 'react';

interface ComparisonPanelProps {
  showPdfComparison: boolean;
  setShowPdfComparison: (show: boolean) => void;
  file: File | null;
  comparisonFile: File | null;
  setComparisonFile: (file: File | null) => void;
  pdfEngineRef: React.RefObject<any>;
  toast: any;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  showPdfComparison,
  setShowPdfComparison,
  file,
  comparisonFile,
  setComparisonFile,
  pdfEngineRef,
  toast,
}) => {
  if (!showPdfComparison) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowPdfComparison(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-orange-500 p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-3xl">🔍</span>
            <span>PDF Comparison Tool</span>
          </h3>
          <button
            onClick={() => setShowPdfComparison(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Original PDF</h4>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {file ? (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{file.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No PDF loaded</div>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">Compare With</h4>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              {comparisonFile ? (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{comparisonFile.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {(comparisonFile.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <button
                    onClick={() => setComparisonFile(null)}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setComparisonFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="comparison-file-input"
                  />
                  <label
                    htmlFor="comparison-file-input"
                    className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                  >
                    Upload PDF to Compare
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {file && comparisonFile && (
          <div className="mt-6">
            <button
              onClick={async () => {
                if (pdfEngineRef.current) {
                  const result = await pdfEngineRef.current.getGodLevelFeatures().comparePdfs(file, comparisonFile);
                  if (result.success) {
                    toast.success(`Found ${result.differences?.length || 0} differences`);
                  } else {
                    toast.error(result.error || 'Comparison failed');
                  }
                }
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all font-semibold text-lg"
            >
              🔍 Compare Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


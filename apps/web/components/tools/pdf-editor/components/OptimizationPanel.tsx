'use client';

import React from 'react';

interface OptimizationResults {
  originalSize: number;
  optimizedSize: number;
  reduction: number;
  reductionPercent: number;
}

interface OptimizationPanelProps {
  show: boolean;
  onClose: () => void;
  optimizationResults: OptimizationResults | null;
}

export const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  show,
  onClose,
  optimizationResults,
}) => {
  if (!show || !optimizationResults) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Content Stream Optimization</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Original Size</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{(optimizationResults.originalSize / 1024).toFixed(2)} KB</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Optimized Size</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{(optimizationResults.optimizedSize / 1024).toFixed(2)} KB</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg col-span-2">
              <div className="text-sm text-green-800 dark:text-green-200">Reduction</div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">
                {optimizationResults.reductionPercent.toFixed(2)}% ({((optimizationResults.reduction) / 1024).toFixed(2)} KB)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





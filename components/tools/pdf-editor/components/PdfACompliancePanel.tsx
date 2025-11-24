'use client';

import React from 'react';

export interface PdfACompliancePanelProps {
  show: boolean;
  onClose: () => void;
  pdfAComplianceResults: {
    isCompliant: boolean;
    version: string;
    issues?: string[];
  } | null;
}

export function PdfACompliancePanel({
  show,
  onClose,
  pdfAComplianceResults,
}: PdfACompliancePanelProps) {
  if (!show || !pdfAComplianceResults) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">PDF/A Compliance Check</h3>
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
          <div className={`p-4 rounded-lg ${
            pdfAComplianceResults.isCompliant
              ? 'bg-green-100 dark:bg-green-900'
              : 'bg-red-100 dark:bg-red-900'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {pdfAComplianceResults.isCompliant ? (
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {pdfAComplianceResults.isCompliant ? 'PDF/A Compliant' : 'Not PDF/A Compliant'}
              </h4>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              Version: {pdfAComplianceResults.version}
            </div>
          </div>
          
          {pdfAComplianceResults.issues && pdfAComplianceResults.issues.length > 0 && (
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Compliance Issues</h4>
              <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {pdfAComplianceResults.issues.map((issue: string, idx: number) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="text-xs text-slate-500 dark:text-slate-400">
            PDF/A is an ISO-standardized version of PDF specialized for digital preservation. 
            Compliant PDFs ensure long-term accessibility and usability.
          </div>
        </div>
      </div>
    </div>
  );
}



'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface RepairResults {
  analysis?: {
    issues?: string[];
  };
  repair?: {
    success: boolean;
    message?: string;
  };
}

interface RepairPanelProps {
  show: boolean;
  onClose: () => void;
  repairResults: RepairResults | null;
  pdfEngineRef: React.RefObject<any>;
  file: File | null;
}

export const RepairPanel: React.FC<RepairPanelProps> = ({
  show,
  onClose,
  repairResults,
  pdfEngineRef,
  file,
}) => {
  if (!show || !repairResults) return null;

  const handleDownload = async () => {
    if (!pdfEngineRef.current || !file) return;
    try {
      const pdfBytes = await pdfEngineRef.current.savePdf();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_repaired.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Repaired PDF downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download repaired PDF');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">PDF Structure Repair</h3>
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
          {repairResults.analysis && (
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Structure Analysis</h4>
              <div className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                <div>Issues Found: {repairResults.analysis.issues?.length || 0}</div>
                {repairResults.analysis.issues && repairResults.analysis.issues.length > 0 && (
                  <ul className="list-disc list-inside mt-2">
                    {repairResults.analysis.issues.map((issue: string, idx: number) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          {repairResults.repair && (
            <div className={`p-4 rounded-lg ${
              repairResults.repair.success
                ? 'bg-green-100 dark:bg-green-900'
                : 'bg-yellow-100 dark:bg-yellow-900'
            }`}>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Repair Results</h4>
              <div className="text-sm">
                {repairResults.repair.success ? (
                  <div className="text-green-800 dark:text-green-200">
                    PDF structure repaired successfully!
                  </div>
                ) : (
                  <div className="text-yellow-800 dark:text-yellow-200">
                    {repairResults.repair.message || 'Repair completed with warnings'}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Download Repaired PDF
          </button>
        </div>
      </div>
    </div>
  );
};





'use client';

import React from 'react';
import { toast } from '@/components/Toast';

export interface HistoryBranchesPanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
  historyBranches: Array<{ id: string; name: string }>;
  setHistoryBranches: (branches: Array<{ id: string; name: string }>) => void;
  currentHistoryBranch: string;
  setCurrentHistoryBranch: (branch: string) => void;
}

export function HistoryBranchesPanel({
  show,
  onClose,
  pdfEngineRef,
  historyBranches,
  setHistoryBranches,
  currentHistoryBranch,
  setCurrentHistoryBranch,
}: HistoryBranchesPanelProps) {
  if (!show || !pdfEngineRef.current) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">History Branches</h3>
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
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New branch name..."
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim() && pdfEngineRef.current) {
                  const branchId = pdfEngineRef.current.createHistoryBranch(e.currentTarget.value.trim());
                  setHistoryBranches([...historyBranches, { id: branchId, name: e.currentTarget.value.trim() }]);
                  e.currentTarget.value = '';
                  toast.success('Branch created');
                }
              }}
            />
            <button
              onClick={async () => {
                const input = document.querySelector('input[placeholder="New branch name..."]') as HTMLInputElement;
                if (input?.value.trim() && pdfEngineRef.current) {
                  const branchId = pdfEngineRef.current.createHistoryBranch(input.value.trim());
                  setHistoryBranches([...historyBranches, { id: branchId, name: input.value.trim() }]);
                  input.value = '';
                  toast.success('Branch created');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Create
            </button>
          </div>
          
          <div className="space-y-2">
            {historyBranches.map((branch) => (
              <div
                key={branch.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  currentHistoryBranch === branch.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white">{branch.name}</span>
                <div className="flex items-center gap-2">
                  {currentHistoryBranch !== branch.id && (
                    <button
                      onClick={async () => {
                        if (pdfEngineRef.current) {
                          const switched = pdfEngineRef.current.switchHistoryBranch(branch.id);
                          if (switched) {
                            setCurrentHistoryBranch(branch.id);
                            toast.success(`Switched to branch: ${branch.name}`);
                          }
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                    >
                      Switch
                    </button>
                  )}
                  {currentHistoryBranch === branch.id && (
                    <span className="px-3 py-1 bg-green-600 text-white rounded-md text-xs">Current</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



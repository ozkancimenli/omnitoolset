'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface WorkerStats {
  totalWorkers: number;
  activeTasks: number;
  queuedTasks: number;
}

interface WorkerPanelProps {
  show: boolean;
  onClose: () => void;
  workerStats: WorkerStats | null;
  pdfEngineRef: React.RefObject<any>;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const WorkerPanel: React.FC<WorkerPanelProps> = ({
  show,
  onClose,
  workerStats,
  pdfEngineRef,
  isProcessing,
  setIsProcessing,
}) => {
  if (!show || !workerStats || !pdfEngineRef.current) return null;

  const handleProcess = async () => {
    if (!pdfEngineRef.current) return;
    setIsProcessing(true);
    try {
      const result = await pdfEngineRef.current.processWithWorkers('optimize', {});
      if (result?.success) toast.success('Worker processing completed');
    } catch (error) {
      console.error('Worker processing error:', error);
      toast.error('Worker processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Worker Pool</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Workers</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{workerStats.totalWorkers}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Tasks</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{workerStats.activeTasks}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Queued Tasks</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{workerStats.queuedTasks}</div>
            </div>
          </div>
          <button onClick={handleProcess} disabled={isProcessing} className="w-full px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50">
            Process with Workers (Optimize)
          </button>
        </div>
      </div>
    </div>
  );
};





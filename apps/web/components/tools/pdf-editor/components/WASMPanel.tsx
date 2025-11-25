'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface WASMMetrics {
  wasmSupported: boolean;
  initialized: boolean;
  fallbackMode: boolean;
}

interface WASMPanelProps {
  show: boolean;
  onClose: () => void;
  wasmMetrics: WASMMetrics | null;
  pdfEngineRef: React.RefObject<any>;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const WASMPanel: React.FC<WASMPanelProps> = ({
  show,
  onClose,
  wasmMetrics,
  pdfEngineRef,
  isProcessing,
  setIsProcessing,
}) => {
  if (!show || !wasmMetrics || !pdfEngineRef.current) return null;

  const handleProcess = async () => {
    if (!pdfEngineRef.current) return;
    setIsProcessing(true);
    try {
      const result = await pdfEngineRef.current.processWithWasm({ optimize: true });
      if (result) toast.success('WASM processing completed');
    } catch (error) {
      console.error('WASM processing error:', error);
      toast.error('WASM processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">WebAssembly Processor</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">WASM Supported</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{wasmMetrics.wasmSupported ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400">Initialized</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{wasmMetrics.initialized ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg col-span-2">
              <div className="text-sm text-slate-600 dark:text-slate-400">Mode</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{wasmMetrics.fallbackMode ? 'Fallback (JavaScript)' : 'WebAssembly'}</div>
            </div>
          </div>
          <button onClick={handleProcess} disabled={isProcessing} className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50">
            Process with WebAssembly
          </button>
        </div>
      </div>
    </div>
  );
};





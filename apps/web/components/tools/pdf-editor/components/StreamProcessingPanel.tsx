'use client';

import React from 'react';
import { toast } from '@/components/Toast';

export interface StreamProcessingPanelProps {
  show: boolean;
  onClose: () => void;
  file: File | null;
  pdfEngineRef: React.RefObject<any>;
  streamProgress: number;
  setStreamProgress: (progress: number) => void;
}

export function StreamProcessingPanel({
  show,
  onClose,
  file,
  pdfEngineRef,
  streamProgress,
  setStreamProgress,
}: StreamProcessingPanelProps) {
  if (!show || !file || !pdfEngineRef.current) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Stream Processing</h3>
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
          <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">File Size</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Large files are processed in chunks for better performance
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Chunk Size: {(1024 * 1024) / (1024 * 1024)} MB
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              defaultValue="1"
              className="w-full"
            />
          </div>
          
          <button
            onClick={async () => {
              if (!pdfEngineRef.current) return;
              setStreamProgress(0);
              try {
                await pdfEngineRef.current.processInStreams(
                  async (chunk: any, offset: number) => {
                    // Process chunk (placeholder - in production would do actual processing)
                    return chunk;
                  },
                  {
                    chunkSize: 1024 * 1024, // 1MB chunks
                    onProgress: (progress: number) => {
                      setStreamProgress(progress);
                    },
                  }
                );
                toast.success('Stream processing completed');
              } catch (error) {
                console.error('Stream processing error:', error);
                toast.error('Stream processing failed');
              }
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Process in Streams
          </button>
          
          {streamProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>Progress</span>
                <span>{streamProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${streamProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface CompressionOptions {
  compressImages: boolean;
  compressContentStreams: boolean;
  removeMetadata: boolean;
  optimizeFonts: boolean;
  quality: 'low' | 'medium' | 'high';
}

interface CompressionPanelProps {
  show: boolean;
  onClose: () => void;
  compressionOptions: CompressionOptions;
  onCompressionOptionsChange: (options: CompressionOptions) => void;
  pdfEngineRef: React.RefObject<any>;
  file: File | null;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const CompressionPanel: React.FC<CompressionPanelProps> = ({
  show,
  onClose,
  compressionOptions,
  onCompressionOptionsChange,
  pdfEngineRef,
  file,
  isProcessing,
  setIsProcessing,
}) => {
  if (!show || !pdfEngineRef.current) return null;

  const handleCompress = async () => {
    if (!pdfEngineRef.current || !file) return;
    setIsProcessing(true);
    try {
      await pdfEngineRef.current.savePdf();
      const pdfBytes = await pdfEngineRef.current.savePdf();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_compressed.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Compressed PDF downloaded');
    } catch (error) {
      console.error('Compression error:', error);
      toast.error('Failed to compress PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Advanced Compression</h3>
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
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compressionOptions.compressImages}
                onChange={(e) => onCompressionOptionsChange({ ...compressionOptions, compressImages: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Compress Images</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compressionOptions.compressContentStreams}
                onChange={(e) => onCompressionOptionsChange({ ...compressionOptions, compressContentStreams: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Compress Content Streams</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compressionOptions.removeMetadata}
                onChange={(e) => onCompressionOptionsChange({ ...compressionOptions, removeMetadata: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Remove Metadata</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compressionOptions.optimizeFonts}
                onChange={(e) => onCompressionOptionsChange({ ...compressionOptions, optimizeFonts: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">Optimize Fonts</span>
            </label>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quality</label>
              <select
                value={compressionOptions.quality}
                onChange={(e) => onCompressionOptionsChange({ ...compressionOptions, quality: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
              >
                <option value="low">Low (Maximum Compression)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Best Quality)</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Apply Compression & Download'}
          </button>
        </div>
      </div>
    </div>
  );
};





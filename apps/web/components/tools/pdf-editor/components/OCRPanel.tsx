'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface OCRPanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
}

export const OCRPanel: React.FC<OCRPanelProps> = ({
  show,
  onClose,
  pdfEngineRef,
}) => {
  if (!show || !pdfEngineRef.current) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pdfEngineRef.current) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (!pdfEngineRef.current) {
              toast.error('PDF engine not initialized');
              return;
            }
            const results = await pdfEngineRef.current.performOCR(imageData, { detectHandwriting: true });
            if (results.length > 0) {
              toast.success(`OCR: Found ${results.length} text block(s)`);
              console.log('OCR Results:', results);
            } else {
              toast.info('No text found in image');
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="absolute top-20 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">👁️ OCR</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Extract text from images and recognize handwriting
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
        />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Supports: Images, scanned documents, handwriting
        </div>
      </div>
    </div>
  );
};





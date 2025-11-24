'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface TextStylesPanelProps {
  show: boolean;
  onClose: () => void;
  pdfEngineRef: React.RefObject<any>;
  editingTextRun: any;
  applyTextStyle: (style: { name: string; format: any }) => void;
}

export const TextStylesPanel: React.FC<TextStylesPanelProps> = ({
  show,
  onClose,
  pdfEngineRef,
  editingTextRun,
  applyTextStyle,
}) => {
  if (!show || !pdfEngineRef.current) return null;

  const styles = pdfEngineRef.current.getAdvancedTextEditor().listStyles();

  return (
    <div className="absolute top-20 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[250px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Text Styles</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        {styles.map((style: any) => (
          <button
            key={style.id}
            onClick={() => {
              if (editingTextRun) {
                applyTextStyle({ name: style.name, format: style });
              } else {
                toast.warning('Select text to apply style');
              }
            }}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
          >
            <div className="font-semibold text-gray-900 dark:text-white">{style.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {style.fontSize}px {style.fontFamily} {style.fontWeight === 'bold' ? 'Bold' : ''} {style.fontStyle === 'italic' ? 'Italic' : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};





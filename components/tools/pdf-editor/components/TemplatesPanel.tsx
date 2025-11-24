'use client';

import React from 'react';
import type { Annotation } from '../types';

interface TemplatesPanelProps {
  show: boolean;
  onClose: () => void;
  annotationTemplates: Array<{ name: string; annotation: Partial<Annotation> }>;
  textTemplates: Array<{ id: string; name: string; text: string; format?: any }>;
  applyAnnotationTemplate: (template: { name: string; annotation: Partial<Annotation> }) => void;
  applyTextTemplate: (template: { name: string; text: string; format?: any }) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  show,
  onClose,
  annotationTemplates,
  textTemplates,
  applyAnnotationTemplate,
  applyTextTemplate,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Annotation Templates</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {annotationTemplates.map((template, index) => (
            <button key={index} onClick={() => { applyAnnotationTemplate(template); onClose(); }} className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left">
              <div className="font-semibold text-slate-900 dark:text-white mb-2">{template.name}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Type: {template.annotation.type}
                {template.annotation.width && template.annotation.height && <span> • {template.annotation.width}×{template.annotation.height}px</span>}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-300 dark:border-slate-600">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Text Templates</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {textTemplates.map((template, index) => (
              <button key={index} onClick={() => { applyTextTemplate(template); onClose(); }} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 text-sm text-slate-700 dark:text-slate-300">
                {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};





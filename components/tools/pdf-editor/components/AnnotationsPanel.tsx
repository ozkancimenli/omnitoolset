// Annotations Panel Component
'use client';

import React from 'react';
import type { Annotation } from '../types';

interface AnnotationsPanelProps {
  annotations: Annotation[];
  pageNum: number;
  selectedAnnotation: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onRemoveAnnotation: (id: string) => void;
  onClearAll: () => void;
}

export const AnnotationsPanel: React.FC<AnnotationsPanelProps> = ({
  annotations,
  pageNum,
  selectedAnnotation,
  onSelectAnnotation,
  onRemoveAnnotation,
  onClearAll,
}) => {
  const pageAnnotations = annotations.filter(ann => ann.page === pageNum);
  
  if (pageAnnotations.length === 0) return null;

  return (
    <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">📝</span>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Page {pageNum}: {pageAnnotations.length} annotations
          </h3>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
        >
          Clear All
        </button>
      </div>
      <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
        {pageAnnotations.map((ann) => (
          <div
            key={ann.id}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all cursor-pointer border flex-shrink-0 ${
              selectedAnnotation === ann.id
                ? 'bg-gray-50 dark:bg-gray-950/50 border-gray-500'
                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
            }`}
            onClick={() => onSelectAnnotation(ann.id === selectedAnnotation ? null : ann.id)}
          >
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              ann.type === 'text' ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300' :
              ann.type === 'highlight' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
              ann.type === 'image' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
              'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
            }`}>
              {ann.type}
            </span>
            <span className="text-slate-700 dark:text-slate-300 text-xs">
              {ann.text || ann.type}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveAnnotation(ann.id);
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors p-0.5"
              title="Delete"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};



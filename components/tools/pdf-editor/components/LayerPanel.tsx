'use client';

import React from 'react';
import type { Annotation } from '../types';

export interface LayerPanelProps {
  show: boolean;
  annotations: Annotation[];
  pageNum: number;
  selectedAnnotation: string | null;
  setSelectedAnnotation: (id: string) => void;
  hiddenLayers: Set<string>;
  setHiddenLayers: (layers: Set<string>) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  saveToHistory: (annotations: Annotation[]) => void;
  renderPage: (page: number) => void;
}

export function LayerPanel({
  show,
  annotations,
  pageNum,
  selectedAnnotation,
  setSelectedAnnotation,
  hiddenLayers,
  setHiddenLayers,
  setAnnotations,
  saveToHistory,
  renderPage,
}: LayerPanelProps) {
  if (!show) return null;

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Layers</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {annotations.filter(a => a.page === pageNum).length} annotation(s) on page {pageNum}
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {annotations.filter(a => a.page === pageNum).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            No annotations on this page
          </p>
        ) : (
          <div className="space-y-1">
            {annotations
              .filter(a => a.page === pageNum)
              .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
              .map(ann => (
                <div
                  key={ann.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                    selectedAnnotation === ann.id
                      ? 'bg-gray-900 text-white'
                      : hiddenLayers.has(ann.id)
                      ? 'bg-slate-100 dark:bg-slate-700 opacity-50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedAnnotation(ann.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newHidden = new Set(hiddenLayers);
                      if (newHidden.has(ann.id)) {
                        newHidden.delete(ann.id);
                      } else {
                        newHidden.add(ann.id);
                      }
                      setHiddenLayers(newHidden);
                      renderPage(pageNum);
                    }}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                    title={hiddenLayers.has(ann.id) ? 'Show' : 'Hide'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {hiddenLayers.has(ann.id) ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {ann.type === 'text' ? '📝 Text' : ann.type === 'image' ? '🖼️ Image' : ann.type === 'highlight' ? '🖍️ Highlight' : ann.type === 'rectangle' ? '▭ Rectangle' : ann.type === 'circle' ? '○ Circle' : ann.type === 'line' ? '─ Line' : ann.type === 'arrow' ? '→ Arrow' : ann.type === 'freehand' ? '✏️ Freehand' : ann.type}
                    </div>
                    {ann.text && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {ann.text.substring(0, 30)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newAnnotations = annotations.map(a =>
                          a.id === ann.id ? { ...a, zIndex: (a.zIndex || 0) + 1 } : a
                        );
                        setAnnotations(newAnnotations);
                        saveToHistory(newAnnotations);
                        renderPage(pageNum);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Bring Forward"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newAnnotations = annotations.map(a =>
                          a.id === ann.id ? { ...a, zIndex: Math.max(0, (a.zIndex || 0) - 1) } : a
                        );
                        setAnnotations(newAnnotations);
                        saveToHistory(newAnnotations);
                        renderPage(pageNum);
                      }}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Send Backward"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}



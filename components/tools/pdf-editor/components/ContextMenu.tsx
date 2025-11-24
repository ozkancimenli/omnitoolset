'use client';

import React from 'react';
import type { Annotation } from '../types';

interface ContextMenuProps {
  contextMenu: { x: number; y: number; annotationId: string } | null;
  selectedAnnotations: Set<string>;
  lockedAnnotations: Set<string>;
  onClose: () => void;
  onDuplicate: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDelete: (id: string) => void;
  onAlign: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onGroup: (ids: string[]) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  selectedAnnotations,
  lockedAnnotations,
  onClose,
  onDuplicate,
  onToggleLock,
  onDelete,
  onAlign,
  onDistribute,
  onGroup,
}) => {
  if (!contextMenu || !contextMenu.annotationId) return null;

  return (
    <div
      className="fixed bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl z-50 py-1 min-w-[200px]"
      style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onDuplicate(contextMenu.annotationId);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
      >
        <span>📋</span> Duplicate
      </button>
      <button
        onClick={() => {
          onToggleLock(contextMenu.annotationId);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
      >
        <span>{lockedAnnotations.has(contextMenu.annotationId) ? '🔓' : '🔒'}</span>
        {lockedAnnotations.has(contextMenu.annotationId) ? 'Unlock' : 'Lock'}
      </button>
      <button
        onClick={() => {
          onDelete(contextMenu.annotationId);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
      >
        <span>🗑️</span> Delete
      </button>
      <div className="border-t border-slate-300 dark:border-slate-600 my-1"></div>
      <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Align (2+ selected)</div>
      <div className="grid grid-cols-3 gap-1 px-2">
        <button
          onClick={() => { onAlign('left'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 2}
        >
          ⬅ Left
        </button>
        <button
          onClick={() => { onAlign('center'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 2}
        >
          ⬌ Center
        </button>
        <button
          onClick={() => { onAlign('right'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 2}
        >
          ➡ Right
        </button>
        <button
          onClick={() => { onAlign('top'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 2}
        >
          ⬆ Top
        </button>
        <button
          onClick={() => { onAlign('middle'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 2}
        >
          ⬌ Middle
        </button>
        <button
          onClick={() => { onAlign('bottom'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 2}
        >
          ⬇ Bottom
        </button>
      </div>
      <div className="border-t border-slate-300 dark:border-slate-600 my-1"></div>
      <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">Distribute (3+ selected)</div>
      <div className="grid grid-cols-2 gap-1 px-2">
        <button
          onClick={() => { onDistribute('horizontal'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 3}
        >
          ↔ Horizontal
        </button>
        <button
          onClick={() => { onDistribute('vertical'); onClose(); }}
          className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          disabled={selectedAnnotations.size < 3}
        >
          ↕ Vertical
        </button>
      </div>
      {selectedAnnotations.size >= 2 && (
        <>
          <div className="border-t border-slate-300 dark:border-slate-600 my-1"></div>
          <button
            onClick={() => {
              onGroup(Array.from(selectedAnnotations));
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <span>🔗</span> Group
          </button>
        </>
      )}
    </div>
  );
};



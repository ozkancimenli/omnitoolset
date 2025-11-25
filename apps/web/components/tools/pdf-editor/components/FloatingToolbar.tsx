// Floating Toolbar Component for Text Formatting
'use client';

import React from 'react';
import type { Annotation } from '../types';

interface FloatingToolbarProps {
  annotation: Annotation;
  position: { x: number; y: number };
  onFormatChange: (format: Partial<Annotation>) => void;
  onApplyFormat: (format: Partial<Annotation>) => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  annotation,
  position,
  onFormatChange,
  onApplyFormat,
}) => {
  if (annotation.type !== 'text') return null;

  return (
    <div
      className="fixed bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-700/60 rounded-xl shadow-2xl shadow-zinc-500/20 dark:shadow-zinc-900/50 z-50 p-2 flex items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onApplyFormat({ fontWeight: annotation.fontWeight === 'bold' ? 'normal' : 'bold' })}
        className={`p-2 rounded-lg hover:bg-violet-100/80 dark:hover:bg-violet-900/30 transition-all duration-200 ${annotation.fontWeight === 'bold' ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg' : 'text-zinc-700 dark:text-zinc-300'}`}
        title="Bold (Ctrl+B)"
      >
        <strong className="text-sm">B</strong>
      </button>
      <button
        onClick={() => onApplyFormat({ fontStyle: annotation.fontStyle === 'italic' ? 'normal' : 'italic' })}
        className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${annotation.fontStyle === 'italic' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <em className="text-sm">I</em>
      </button>
      <button
        onClick={() => onApplyFormat({ textDecoration: annotation.textDecoration === 'underline' ? 'none' : 'underline' })}
        className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${annotation.textDecoration === 'underline' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        title="Underline (Ctrl+U)"
      >
        <u className="text-sm">U</u>
      </button>
      <div className="w-px h-6 bg-zinc-300/60 dark:bg-zinc-700/60 mx-1"></div>
      <button
        onClick={() => onApplyFormat({ textAlign: 'left' })}
        className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${annotation.textAlign === 'left' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        title="Align Left"
      >
        ⬅
      </button>
      <button
        onClick={() => onApplyFormat({ textAlign: 'center' })}
        className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${annotation.textAlign === 'center' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        title="Align Center"
      >
        ⬌
      </button>
      <button
        onClick={() => onApplyFormat({ textAlign: 'right' })}
        className={`p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${annotation.textAlign === 'right' ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
        title="Align Right"
      >
        ➡
      </button>
      <div className="w-px h-6 bg-zinc-300/60 dark:bg-zinc-700/60 mx-1"></div>
      <input
        type="color"
        value={annotation.color || '#000000'}
        onChange={(e) => onApplyFormat({ color: e.target.value })}
        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300/60 dark:border-zinc-700/60 hover:border-violet-400 dark:hover:border-violet-600 transition-all duration-200"
        title="Text Color"
      />
      <input
        type="number"
        value={annotation.fontSize || 16}
        onChange={(e) => onApplyFormat({ fontSize: Number(e.target.value) })}
        min="8"
        max="72"
        className="w-16 px-2 py-1 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 text-sm focus:border-violet-400 dark:focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
        title="Font Size"
      />
      <select
        value={annotation.fontFamily || 'Arial'}
        onChange={(e) => onApplyFormat({ fontFamily: e.target.value })}
        className="px-2 py-1 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 text-sm focus:border-violet-400 dark:focus:border-violet-600 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
        title="Font Family"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times</option>
        <option value="Helvetica">Helvetica</option>
        <option value="Courier New">Courier</option>
      </select>
    </div>
  );
};


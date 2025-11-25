// Rich Text Editor Component for PDF Text Editing
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@/components/Toast';
import type { PdfTextRun } from '../types';

interface RichTextEditorProps {
  textRun: PdfTextRun;
  initialValue: string;
  onSave: (text: string, format: TextFormat) => void;
  onCancel: () => void;
  position: { x: number; y: number };
  viewport: { width: number; height: number; scale: number };
}

interface TextFormat {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  backgroundColor?: string;
}

export const RichTextEditor = ({
  textRun,
  initialValue,
  onSave,
  onCancel,
  position,
  viewport,
}: RichTextEditorProps) => {
  const [value, setValue] = useState(initialValue);
  const [format, setFormat] = useState<TextFormat>({
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    fontSize: textRun.fontSize || 16,
    fontFamily: textRun.fontName || 'Arial',
    color: textRun.color || '#000000',
    textAlign: 'left',
  });
  const editorRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B: Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setFormat(prev => ({
          ...prev,
          fontWeight: prev.fontWeight === 'bold' ? 'normal' : 'bold',
        }));
      }
      // Ctrl/Cmd + I: Italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setFormat(prev => ({
          ...prev,
          fontStyle: prev.fontStyle === 'italic' ? 'normal' : 'italic',
        }));
      }
      // Ctrl/Cmd + U: Underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        setFormat(prev => ({
          ...prev,
          textDecoration: prev.textDecoration === 'underline' ? 'none' : 'underline',
        }));
      }
      // Escape: Cancel
      if (e.key === 'Escape') {
        onCancel();
      }
      // Ctrl/Cmd + Enter: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSave(value, format);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, format, onSave, onCancel]);

  // Auto-focus
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const applyFormat = useCallback((formatType: keyof TextFormat, value: any) => {
    setFormat(prev => ({ ...prev, [formatType]: value }));
  }, []);

  return (
    <div
      className="fixed z-50 bg-white dark:bg-slate-900 border-2 border-blue-500 rounded-lg shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '300px',
        maxWidth: '600px',
      }}
    >
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => applyFormat('fontWeight', format.fontWeight === 'bold' ? 'normal' : 'bold')}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${format.fontWeight === 'bold' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <strong className="text-sm">B</strong>
        </button>
        <button
          onClick={() => applyFormat('fontStyle', format.fontStyle === 'italic' ? 'normal' : 'italic')}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${format.fontStyle === 'italic' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <em className="text-sm">I</em>
        </button>
        <button
          onClick={() => applyFormat('textDecoration', format.textDecoration === 'underline' ? 'none' : 'underline')}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${format.textDecoration === 'underline' ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <u className="text-sm">U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <input
          type="color"
          value={format.color || '#000000'}
          onChange={(e) => applyFormat('color', e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
          title="Text Color"
        />
        <input
          type="number"
          value={format.fontSize || 16}
          onChange={(e) => applyFormat('fontSize', Number(e.target.value))}
          min="8"
          max="72"
          className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-sm"
          title="Font Size"
        />
        <select
          value={format.fontFamily || 'Arial'}
          onChange={(e) => applyFormat('fontFamily', e.target.value)}
          className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-sm"
          title="Font Family"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Courier New">Courier</option>
          <option value="Georgia">Georgia</option>
        </select>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
        <div className="flex gap-1">
          {(['left', 'center', 'right', 'justify'] as const).map(align => (
            <button
              key={align}
              onClick={() => applyFormat('textAlign', align)}
              className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${format.textAlign === align ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              title={`Align ${align}`}
            >
              {align === 'left' ? '⬅' : align === 'center' ? '⬌' : align === 'right' ? '➡' : '⬌⬌'}
            </button>
          ))}
        </div>
      </div>

      {/* Text Editor */}
      <div className="p-3">
        <textarea
          ref={editorRef as any}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full min-h-[100px] p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            fontFamily: format.fontFamily,
            fontSize: `${format.fontSize}px`,
            fontWeight: format.fontWeight,
            fontStyle: format.fontStyle,
            textDecoration: format.textDecoration,
            color: format.color,
            textAlign: format.textAlign,
            lineHeight: format.lineHeight || 1.5,
            letterSpacing: format.letterSpacing ? `${format.letterSpacing}px` : 'normal',
            backgroundColor: format.backgroundColor || 'transparent',
          }}
          placeholder="Edit text here..."
          autoFocus
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          Cancel (Esc)
        </button>
        <button
          onClick={() => onSave(value, format)}
          className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save (Ctrl+Enter)
        </button>
      </div>
    </div>
  );
};



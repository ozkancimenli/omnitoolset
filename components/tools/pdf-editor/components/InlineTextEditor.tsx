'use client';

import React, { useEffect, useRef } from 'react';
import type { PdfTextRun } from '../types';

interface InlineTextEditorProps {
  editingTextRun: PdfTextRun | null;
  editingText: string;
  onChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  pageNum: number;
  zoom: number;
  viewport: { width: number; height: number } | null;
  pageView: any;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  editingTextRun,
  editingText,
  onChange,
  onKeyDown,
  onBlur,
  pageNum,
  zoom,
  viewport,
  pageView,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTextRun && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTextRun]);

  if (!editingTextRun || !viewport || !pageView) return null;

  // Convert PDF coordinates to canvas display coordinates
  const page = pageView.pdfPage;
  const viewport_pdf = pageView.viewport;
  const scale = zoom / 100;
  
  // PDF coordinates (y=0 at bottom) to canvas coordinates (y=0 at top)
  const pdfX = editingTextRun.x;
  const pdfY = editingTextRun.y;
  const pageHeight = viewport_pdf.height;
  
  // Convert to canvas coordinates
  const canvasX = pdfX * scale;
  const canvasY = (pageHeight - pdfY) * scale;
  
  // Get canvas container position
  const canvasContainer = document.querySelector('.pdf-viewer-container');
  if (!canvasContainer) return null;
  
  const containerRect = canvasContainer.getBoundingClientRect();
  
  // Calculate absolute position
  const textX = containerRect.left + canvasX;
  const textY = containerRect.top + canvasY - (editingTextRun.fontSize || 12) * scale;

  return (
    <input
      ref={inputRef}
      type="text"
      value={editingText}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      style={{
        position: 'fixed',
        left: `${textX}px`,
        top: `${textY}px`,
        width: `${Math.max(200, (editingTextRun.width || 100) * scale)}px`,
        fontSize: `${(editingTextRun.fontSize || 12) * scale}px`,
        fontFamily: editingTextRun.fontFamily || 'Arial',
        color: editingTextRun.color || '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        padding: '4px 8px',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
      className="outline-none"
    />
  );
};



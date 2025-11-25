// Annotation Text Editor Component
'use client';

import React, { useRef, useEffect } from 'react';
import type { Annotation } from '../types';

interface AnnotationTextEditorProps {
  annotation: Annotation;
  editingText: string;
  onTextChange: (text: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
}

export const AnnotationTextEditor: React.FC<AnnotationTextEditorProps> = ({
  annotation,
  editingText,
  onTextChange,
  onBlur,
  onKeyDown,
  position,
  fontSize,
  fontFamily,
  color,
  textAlign,
  fontWeight,
  fontStyle,
  textDecoration,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [annotation.id]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={editingText}
      onChange={(e) => onTextChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${fontSize}px`,
        fontFamily,
        fontWeight,
        fontStyle,
        textDecoration,
        color,
        textAlign,
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #3b82f6',
        outline: 'none',
        padding: '4px 8px',
        borderRadius: '4px',
        zIndex: 9999,
        minWidth: '100px',
      }}
      className="pdf-annotation-text-editor"
      autoFocus
    />
  );
};



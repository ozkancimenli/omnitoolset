// Text Formatting State Management Hook
'use client';

import { useState } from 'react';

export const useTextFormattingState = () => {
  // Basic text formatting
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textDecoration, setTextDecoration] = useState<'none' | 'underline'>('none');

  // Advanced text formatting
  const [editingTextFormat, setEditingTextFormat] = useState<{
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    letterSpacing?: number;
    lineHeight?: number;
    textShadow?: { offsetX: number; offsetY: number; blur: number; color: string };
    textOutline?: { width: number; color: string };
  }>({});
  
  const [multiLineEditing, setMultiLineEditing] = useState(false);
  const [textRotation, setTextRotation] = useState<number>(0);
  const [textScaleX, setTextScaleX] = useState<number>(1);
  const [textScaleY, setTextScaleY] = useState<number>(1);

  // Text templates
  const [textTemplates, setTextTemplates] = useState<Array<{ id: string; name: string; text: string; format?: any }>>([
    { id: 'template-header', name: 'Header', text: 'Document Header', format: { fontSize: 24, fontWeight: 'bold' } },
    { id: 'template-subheader', name: 'Subheader', text: 'Section Title', format: { fontSize: 18, fontWeight: 'bold' } },
    { id: 'template-body', name: 'Body', text: 'Body text', format: { fontSize: 12, fontWeight: 'normal' } },
    { id: 'template-footer', name: 'Footer', text: 'Page Footer', format: { fontSize: 10, fontWeight: 'normal', color: '#666666' } },
  ]);

  return {
    // Basic formatting
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    textColor,
    setTextColor,
    textAlign,
    setTextAlign,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    textDecoration,
    setTextDecoration,
    // Advanced formatting
    editingTextFormat,
    setEditingTextFormat,
    multiLineEditing,
    setMultiLineEditing,
    textRotation,
    setTextRotation,
    textScaleX,
    setTextScaleX,
    textScaleY,
    setTextScaleY,
    // Templates
    textTemplates,
    setTextTemplates,
  };
};



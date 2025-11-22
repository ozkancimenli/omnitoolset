// PDF Editor Types
export type ToolType = 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'link' | 'note' | 'freehand' | 'eraser' | 'signature' | 'watermark' | 'redaction' | 'edit-text' | 'stamp' | 'ruler' | 'measure' | 'polygon' | 'callout' | 'form-field' | null;
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';
export type ZoomMode = 'custom' | 'fit-width' | 'fit-page' | 'fit-height';

export interface PdfEditorProps {
  toolId?: string;
}

export interface Annotation {
  id: string;
  type: 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'link' | 'note' | 'freehand' | 'signature' | 'watermark' | 'redaction' | 'stamp' | 'ruler' | 'measure' | 'polygon' | 'callout' | 'form-field';
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;
  strokeColor?: string;
  fillColor?: string;
  page: number;
  width?: number;
  height?: number;
  imageData?: string;
  endX?: number;
  endY?: number;
  url?: string;
  comment?: string;
  isEditing?: boolean;
  freehandPath?: { x: number; y: number }[];
  zIndex?: number;
  opacity?: number;
  rotation?: number;
  watermarkText?: string;
  watermarkOpacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  textOutline?: { width: number; color: string };
  distance?: number;
  measurementUnit?: 'px' | 'mm' | 'cm' | 'in';
  points?: { x: number; y: number }[];
  calloutPoints?: { x: number; y: number }[];
  formFieldType?: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'number';
  formFieldName?: string;
  formFieldValue?: string;
  formFieldRequired?: boolean;
  formFieldOptions?: string[];
  commentThread?: string;
  commentReplies?: Array<{ id: string; text: string; author?: string; timestamp: number }>;
}

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  transform: number[];
  page: number;
  dir: string;
  hasEOL?: boolean;
}

export interface PdfTextRun {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  page: number;
  startIndex: number;
  endIndex: number;
  isSelected?: boolean;
  isEditing?: boolean;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}


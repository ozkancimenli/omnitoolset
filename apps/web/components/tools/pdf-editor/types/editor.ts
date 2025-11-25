/**
 * Editor Types
 * @module types/editor
 */

/**
 * Tool type enumeration
 */
export type ToolType =
  | 'text'
  | 'highlight'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'watermark'
  | 'signature'
  | 'redaction'
  | 'stamp'
  | 'ruler'
  | 'measure'
  | 'polygon'
  | 'callout'
  | 'edit-text'
  | null;

/**
 * Zoom mode
 */
export type ZoomMode = 'custom' | 'fit-width' | 'fit-page' | 'fit-height';

/**
 * PDF Editor Props
 */
export interface PdfEditorProps {
  toolId: string;
  initialFile?: File;
  onFileChange?: (file: File | null) => void;
  onAnnotationChange?: (annotations: any[]) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

/**
 * PDF Text Item
 */
export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  page: number;
}

/**
 * PDF Text Run
 */
export interface PdfTextRun {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  color: string;
  page: number;
  items: PdfTextItem[];
}

/**
 * Canvas coordinates
 */
export interface CanvasCoordinates {
  x: number;
  y: number;
  page: number;
}

/**
 * Viewport information
 */
export interface Viewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
}


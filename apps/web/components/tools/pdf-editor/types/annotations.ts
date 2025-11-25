/**
 * Annotation Types
 * @module types/annotations
 */

/**
 * Annotation type enumeration
 */
export type AnnotationType =
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
  | 'edit-text';

/**
 * Base annotation interface
 */
export interface Annotation {
  id: string;
  type: AnnotationType;
  page: number;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
  locked?: boolean;
  hidden?: boolean;
  createdAt?: number;
  updatedAt?: number;
  author?: string;
}

/**
 * Text annotation
 */
export interface TextAnnotation extends Annotation {
  type: 'text';
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

/**
 * Highlight annotation
 */
export interface HighlightAnnotation extends Annotation {
  type: 'highlight';
  width: number;
  height: number;
}

/**
 * Shape annotation (rectangle, circle, etc.)
 */
export interface ShapeAnnotation extends Annotation {
  type: 'rectangle' | 'circle' | 'polygon';
  width: number;
  height: number;
  points?: Array<{ x: number; y: number }>;
}

/**
 * Line annotation
 */
export interface LineAnnotation extends Annotation {
  type: 'line' | 'arrow';
  endX: number;
  endY: number;
}

/**
 * Image annotation
 */
export interface ImageAnnotation extends Annotation {
  type: 'image';
  imageData: string;
  width: number;
  height: number;
}

/**
 * Watermark annotation
 */
export interface WatermarkAnnotation extends Annotation {
  type: 'watermark';
  watermarkText: string;
  fontSize?: number;
  watermarkOpacity?: number;
}

/**
 * Signature annotation
 */
export interface SignatureAnnotation extends Annotation {
  type: 'signature';
  width: number;
  height: number;
  signatureData?: string;
}

/**
 * Stamp annotation
 */
export interface StampAnnotation extends Annotation {
  type: 'stamp';
  text: string;
  width: number;
  height: number;
  fontSize?: number;
}

/**
 * Measurement annotation
 */
export interface MeasurementAnnotation extends Annotation {
  type: 'ruler' | 'measure';
  endX: number;
  endY?: number;
  distance?: number;
  measurementUnit?: 'px' | 'mm' | 'cm' | 'in';
}

/**
 * Callout annotation
 */
export interface CalloutAnnotation extends Annotation {
  type: 'callout';
  text?: string;
  calloutPoints: Array<{ x: number; y: number }>;
}

/**
 * Union type for all annotations
 */
export type AnyAnnotation =
  | TextAnnotation
  | HighlightAnnotation
  | ShapeAnnotation
  | LineAnnotation
  | ImageAnnotation
  | WatermarkAnnotation
  | SignatureAnnotation
  | StampAnnotation
  | MeasurementAnnotation
  | CalloutAnnotation;


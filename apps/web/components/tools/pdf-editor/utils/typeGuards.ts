/**
 * Type Guards for Runtime Type Checking
 * Provides type-safe runtime type checking utilities
 */

import type { Annotation, AnyAnnotation } from '../types/annotations';

/**
 * Type guard for text annotation
 */
export function isTextAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'text' }> {
  return annotation.type === 'text';
}

/**
 * Type guard for highlight annotation
 */
export function isHighlightAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'highlight' }> {
  return annotation.type === 'highlight';
}

/**
 * Type guard for shape annotation
 */
export function isShapeAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'rectangle' | 'circle' | 'polygon' }> {
  return ['rectangle', 'circle', 'polygon'].includes(annotation.type);
}

/**
 * Type guard for line annotation
 */
export function isLineAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'line' | 'arrow' }> {
  return annotation.type === 'line' || annotation.type === 'arrow';
}

/**
 * Type guard for image annotation
 */
export function isImageAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'image' }> {
  return annotation.type === 'image';
}

/**
 * Type guard for watermark annotation
 */
export function isWatermarkAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'watermark' }> {
  return annotation.type === 'watermark';
}

/**
 * Type guard for signature annotation
 */
export function isSignatureAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'signature' }> {
  return annotation.type === 'signature';
}

/**
 * Type guard for stamp annotation
 */
export function isStampAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'stamp' }> {
  return annotation.type === 'stamp';
}

/**
 * Type guard for measurement annotation
 */
export function isMeasurementAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'ruler' | 'measure' }> {
  return annotation.type === 'ruler' || annotation.type === 'measure';
}

/**
 * Type guard for callout annotation
 */
export function isCalloutAnnotation(annotation: Annotation): annotation is Extract<AnyAnnotation, { type: 'callout' }> {
  return annotation.type === 'callout';
}

/**
 * Check if annotation has text
 */
export function hasText(annotation: Annotation): boolean {
  return 'text' in annotation && typeof annotation.text === 'string' && annotation.text.length > 0;
}

/**
 * Check if annotation has dimensions
 */
export function hasDimensions(annotation: Annotation): boolean {
  return 'width' in annotation && 'height' in annotation &&
         typeof annotation.width === 'number' && typeof annotation.height === 'number';
}

/**
 * Check if annotation is editable
 */
export function isEditable(annotation: Annotation): boolean {
  return !annotation.locked && annotation.type !== 'redaction';
}

/**
 * Check if annotation is visible
 */
export function isVisible(annotation: Annotation): boolean {
  return !annotation.hidden;
}


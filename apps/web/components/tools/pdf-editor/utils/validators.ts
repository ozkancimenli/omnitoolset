/**
 * Validation Utilities
 * Provides comprehensive validation functions
 */

import type { Annotation } from '../types';
import type { ExportOptions } from '../types/export';

/**
 * Validate annotation
 */
export function validateAnnotation(annotation: Partial<Annotation>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!annotation.id) {
    errors.push('Annotation must have an id');
  }

  if (!annotation.type) {
    errors.push('Annotation must have a type');
  }

  if (typeof annotation.page !== 'number' || annotation.page < 1) {
    errors.push('Annotation must have a valid page number');
  }

  if (typeof annotation.x !== 'number') {
    errors.push('Annotation must have a valid x coordinate');
  }

  if (typeof annotation.y !== 'number') {
    errors.push('Annotation must have a valid y coordinate');
  }

  // Type-specific validations
  if (annotation.type === 'text' && !annotation.text) {
    errors.push('Text annotation must have text');
  }

  if (['rectangle', 'circle', 'image'].includes(annotation.type || '')) {
    if (typeof annotation.width !== 'number' || annotation.width <= 0) {
      errors.push(`${annotation.type} annotation must have a valid width`);
    }
    if (typeof annotation.height !== 'number' || annotation.height <= 0) {
      errors.push(`${annotation.type} annotation must have a valid height`);
    }
  }

  if (['line', 'arrow'].includes(annotation.type || '')) {
    if (typeof annotation.endX !== 'number') {
      errors.push(`${annotation.type} annotation must have endX`);
    }
    if (typeof annotation.endY !== 'number') {
      errors.push(`${annotation.type} annotation must have endY`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate export options
 */
export function validateExportOptions(options: Partial<ExportOptions>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!options.format) {
    errors.push('Export format is required');
  }

  const validFormats = ['pdf', 'png', 'jpg', 'svg', 'html', 'txt', 'docx', 'xlsx'];
  if (options.format && !validFormats.includes(options.format)) {
    errors.push(`Invalid export format: ${options.format}`);
  }

  if (options.quality !== undefined) {
    if (typeof options.quality !== 'number' || options.quality < 0 || options.quality > 1) {
      errors.push('Quality must be a number between 0 and 1');
    }
  }

  if (options.pages && Array.isArray(options.pages)) {
    options.pages.forEach((page, index) => {
      if (typeof page !== 'number' || page < 1) {
        errors.push(`Invalid page number at index ${index}: ${page}`);
      }
    });
  }

  if (options.encryption?.enabled) {
    if (!options.encryption.password || options.encryption.password.length < 4) {
      errors.push('Encryption password must be at least 4 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate color
 */
export function validateColor(color: string): boolean {
  // Hex color validation
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }

  // RGB/RGBA validation
  if (/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/.test(color)) {
    return true;
  }

  // Named color validation (basic check)
  const namedColors = [
    'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
    'transparent', 'currentColor',
  ];
  if (namedColors.includes(color.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Validate file
 */
export function validateFile(file: File, options?: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!(file instanceof File)) {
    errors.push('Invalid file object');
    return { valid: false, errors };
  }

  if (options?.maxSize && file.size > options.maxSize) {
    errors.push(`File size exceeds maximum of ${options.maxSize} bytes`);
  }

  if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  if (options?.allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !options.allowedExtensions.includes(`.${extension}`)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate coordinates
 */
export function validateCoordinates(x: number, y: number, page: number): boolean {
  return (
    typeof x === 'number' && isFinite(x) &&
    typeof y === 'number' && isFinite(y) &&
    typeof page === 'number' && page > 0 && Number.isInteger(page)
  );
}

/**
 * Validate dimensions
 */
export function validateDimensions(width: number, height: number): boolean {
  return (
    typeof width === 'number' && width > 0 && isFinite(width) &&
    typeof height === 'number' && height > 0 && isFinite(height)
  );
}

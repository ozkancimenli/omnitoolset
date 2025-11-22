// PDF Editor Utility Functions
import { PDF_MAX_SIZE, PDF_SUPPORTED_TYPES, PDF_EXTENSIONS } from './constants';

// Error types
export class PDFValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PDFValidationError';
  }
}

export class PDFProcessingError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'PDFProcessingError';
  }
}

// File validation
export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
  const isValidType = PDF_SUPPORTED_TYPES.includes(file.type) || 
    PDF_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!isValidType) {
    return { valid: false, error: 'Please select a valid PDF file.' };
  }
  
  if (file.size > PDF_MAX_SIZE) {
    return { valid: false, error: `File size is too large. Maximum size is ${PDF_MAX_SIZE / (1024 * 1024)}MB.` };
  }
  
  if (file.size === 0) {
    return { valid: false, error: 'File is empty. Please select a valid PDF file.' };
  }
  
  return { valid: true };
};

// Security - Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim();
};

// Security - Sanitize text for PDF
export const sanitizeTextForPDF = (text: string): string => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Security - Validate file name
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .substring(0, 255);
};

// Error logging
export const logError = (error: Error, context: string, metadata?: Record<string, any>) => {
  console.error(`[PDF Editor Error] ${context}:`, error, metadata);
};

// Performance monitoring
export const measurePerformance = (label: string, fn: () => void | Promise<void>) => {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now();
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      });
    } else {
      const duration = performance.now() - start;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      return result;
    }
  }
  return fn();
};

// Color conversion
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};



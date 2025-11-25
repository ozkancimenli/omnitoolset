/**
 * Export Types
 * @module types/export
 */

/**
 * Export format
 */
export type ExportFormat =
  | 'pdf'
  | 'png'
  | 'jpg'
  | 'svg'
  | 'html'
  | 'txt'
  | 'docx'
  | 'xlsx';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  pages?: number[] | 'all';
  includeAnnotations?: boolean;
  includeMetadata?: boolean;
  watermark?: {
    text?: string;
    image?: string;
    opacity?: number;
  };
  compression?: {
    enabled: boolean;
    level: number;
  };
  encryption?: {
    enabled: boolean;
    password: string;
    permissions?: string[];
  };
}

/**
 * Export result
 */
export interface ExportResult {
  blob: Blob;
  size: number;
  format: ExportFormat;
  url: string;
}


export type PdfRotation = 0 | 90 | 180 | 270;

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PdfPage {
  id: string;
  index: number;
  width: number;
  height: number;
  rotation: PdfRotation;
}

export interface PdfDocument {
  id: string;
  pages: PdfPage[];
  metadata?: PdfMetadata;
  sourceName?: string;
}

export interface LoadPdfOptions {
  id?: string;
  sourceName?: string;
}

export interface ExportOptions {
  asBlob?: boolean;
}

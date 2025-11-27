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

export interface PdfTextRun {
  id: string;
  page: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}

export interface TextFormat {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface LoadPdfOptions {
  id?: string;
  sourceName?: string;
}

export interface ExportOptions {
  asBlob?: boolean;
}

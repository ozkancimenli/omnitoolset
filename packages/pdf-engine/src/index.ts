import { PDFDocument, degrees } from 'pdf-lib';
import type {
  ExportOptions,
  LoadPdfOptions,
  PdfDocument,
  PdfMetadata,
  PdfPage,
  PdfRotation,
} from './types';

const pdfStore = new Map<string, PDFDocument>();

const ORDERED_ROTATIONS: PdfRotation[] = [0, 90, 180, 270];

function randomId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore - older TS lib may not know about crypto.randomUUID
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function coerceRotation(angle: number): PdfRotation {
  const normalized = ((angle % 360) + 360) % 360;
  if (ORDERED_ROTATIONS.includes(normalized as PdfRotation)) {
    return normalized as PdfRotation;
  }
  return 0;
}

function getPdfHandle(id: string): PDFDocument {
  const pdf = pdfStore.get(id);
  if (!pdf) {
    throw new Error(`PDF document with id \"${id}\" is not loaded. Call loadPdf first.`);
  }
  return pdf;
}

function extractMetadata(source: PDFDocument): PdfMetadata | undefined {
  const metadata: PdfMetadata = {};
  const title = source.getTitle();
  const author = source.getAuthor();
  const subject = source.getSubject();
  const createdAt = source.getCreationDate();
  const updatedAt = source.getModificationDate();

  if (title) metadata.title = title;
  if (author) metadata.author = author;
  if (subject) metadata.subject = subject;
  if (createdAt) metadata.createdAt = createdAt;
  if (updatedAt) metadata.updatedAt = updatedAt;

  if (Object.keys(metadata).length === 0) {
    return undefined;
  }
  return metadata;
}

function snapshotPages(source: PDFDocument, docId: string): PdfPage[] {
  const pages = source.getPages();
  return pages.map((page, index) => {
    const { width, height } = page.getSize();
    const rotation = coerceRotation(page.getRotation()?.angle ?? 0);
    return {
      id: `${docId}-page-${index + 1}`,
      index,
      width,
      height,
      rotation,
    };
  });
}

function persistDocument(source: PDFDocument, options?: LoadPdfOptions & { reuseId?: string }): PdfDocument {
  const docId = options?.reuseId ?? options?.id ?? randomId('pdf');
  pdfStore.set(docId, source);
  return {
    id: docId,
    pages: snapshotPages(source, docId),
    metadata: extractMetadata(source),
    sourceName: options?.sourceName,
  };
}

function toUint8Array(input: ArrayBuffer | Uint8Array): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

export async function loadPdf(input: ArrayBuffer | Uint8Array, options?: LoadPdfOptions): Promise<PdfDocument> {
  const bytes = toUint8Array(input);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: false });
  return persistDocument(pdfDoc, options);
}

export async function mergePdfs(documents: PdfDocument[]): Promise<PdfDocument> {
  if (!documents.length) {
    throw new Error('mergePdfs requires at least one document');
  }
  const merged = await PDFDocument.create();

  for (const doc of documents) {
    const pdf = getPdfHandle(doc.id);
    const copiedPages = await merged.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  return persistDocument(merged);
}

export async function reorderPages(doc: PdfDocument, newOrder: string[]): Promise<PdfDocument> {
  if (!newOrder.length) {
    throw new Error('reorderPages requires a non-empty newOrder array');
  }
  const pdf = getPdfHandle(doc.id);
  const indexMap = new Map(doc.pages.map((page, index) => [page.id, index]));
  const resolvedIndices: number[] = [];

  newOrder.forEach((id) => {
    const idx = indexMap.get(id);
    if (typeof idx === 'number') {
      resolvedIndices.push(idx);
    }
  });

  if (!resolvedIndices.length) {
    throw new Error('None of the provided page ids exist in the document');
  }

  // Append any pages not mentioned explicitly to preserve full content
  doc.pages.forEach((page) => {
    if (!newOrder.includes(page.id)) {
      resolvedIndices.push(page.index);
    }
  });

  const reordered = await PDFDocument.create();
  const pages = await reordered.copyPages(pdf, resolvedIndices);
  pages.forEach((page) => reordered.addPage(page));
  return persistDocument(reordered, { sourceName: doc.sourceName });
}

export async function deletePages(doc: PdfDocument, pageIds: string[]): Promise<PdfDocument> {
  if (!pageIds.length) {
    return doc;
  }
  const pagesToKeep = doc.pages.filter((page) => !pageIds.includes(page.id)).map((page) => page.id);
  if (!pagesToKeep.length) {
    throw new Error('Cannot delete all pages from a document');
  }
  return reorderPages(doc, pagesToKeep);
}

export function rotatePage(doc: PdfDocument, pageId: string, rotation: PdfRotation): PdfDocument {
  const pdf = getPdfHandle(doc.id);
  const pageMeta = doc.pages.find((page) => page.id === pageId);
  if (!pageMeta) {
    throw new Error(`Page with id ${pageId} not found`);
  }
  const page = pdf.getPages()[pageMeta.index];
  page.setRotation(degrees(rotation));
  return persistDocument(pdf, { reuseId: doc.id, sourceName: doc.sourceName });
}

export async function exportPdf(doc: PdfDocument, options?: ExportOptions): Promise<Blob | ArrayBuffer> {
  const pdf = getPdfHandle(doc.id);
  const bytes = await pdf.save();
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  if (options?.asBlob && typeof Blob !== 'undefined') {
    return new Blob([buffer], { type: 'application/pdf' });
  }
  return buffer;
}

export function releasePdf(doc: PdfDocument): void {
  pdfStore.delete(doc.id);
}

export type {
  PdfDocument,
  PdfMetadata,
  PdfPage,
  PdfRotation,
  LoadPdfOptions,
  ExportOptions,
} from './types';

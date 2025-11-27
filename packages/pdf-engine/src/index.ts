import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import type {
  ExportOptions,
  LoadPdfOptions,
  PdfDocument,
  PdfMetadata,
  PdfPage,
  PdfRotation,
  PdfTextRun,
  TextFormat,
} from './types';
import { extractTextRunsFromPage } from './textExtraction';
import { loadPdfJs } from './pdfjs';

const pdfStore = new Map<string, PDFDocument>();
const pdfBytesStore = new Map<string, Uint8Array>();
const textIndexStore = new Map<string, Map<number, PdfTextRun[]>>();

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

type PersistOptions = LoadPdfOptions & { reuseId?: string; initialBytes?: Uint8Array };

function persistDocument(source: PDFDocument, options?: PersistOptions): PdfDocument {
  const docId = options?.reuseId ?? options?.id ?? randomId('pdf');
  pdfStore.set(docId, source);
  if (options?.initialBytes) {
    pdfBytesStore.set(docId, options.initialBytes);
  } else {
    pdfBytesStore.delete(docId);
  }
  textIndexStore.delete(docId);
  return {
    id: docId,
    pages: snapshotPages(source, docId),
    metadata: extractMetadata(source),
    sourceName: options?.sourceName,
  };
}

async function getPdfBytes(docId: string): Promise<Uint8Array> {
  const cached = pdfBytesStore.get(docId);
  if (cached) return cached;
  const pdf = getPdfHandle(docId);
  const bytes = await pdf.save();
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  pdfBytesStore.set(docId, buffer);
  return buffer;
}

function invalidateTextCache(docId: string, pageNumber?: number): void {
  const cache = textIndexStore.get(docId);
  if (!cache) return;
  if (typeof pageNumber === 'number') {
    cache.delete(pageNumber);
  } else {
    textIndexStore.delete(docId);
  }
}

function resolvePageIndices(doc: PdfDocument, pageIds: string[]): number[] {
  const indexMap = new Map(doc.pages.map((page) => [page.id, page.index]));
  const indices: number[] = [];
  pageIds.forEach((id) => {
    const idx = indexMap.get(id);
    if (typeof idx === 'number') {
      indices.push(idx);
    }
  });
  if (!indices.length) {
    throw new Error('No matching page ids found in the document');
  }
  return indices;
}

async function buildDocumentFromPageIndices(
  sourceDoc: PdfDocument,
  pageIndices: number[],
  options?: LoadPdfOptions & { reuseId?: string }
): Promise<PdfDocument> {
  const sourceHandle = getPdfHandle(sourceDoc.id);
  const target = await PDFDocument.create();
  const copiedPages = await target.copyPages(sourceHandle, pageIndices);
  copiedPages.forEach((page) => target.addPage(page));
  return persistDocument(target, options);
}

function toUint8Array(input: ArrayBuffer | Uint8Array): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

export async function loadPdf(input: ArrayBuffer | Uint8Array, options?: LoadPdfOptions): Promise<PdfDocument> {
  const bytes = toUint8Array(input);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: false });
  return persistDocument(pdfDoc, { ...options, initialBytes: bytes });
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

  const persisted = persistDocument(merged);
  return persisted;
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
  const updated = persistDocument(reordered, { sourceName: doc.sourceName });
  invalidateTextCache(updated.id);
  pdfBytesStore.delete(updated.id);
  return updated;
}

export async function deletePages(doc: PdfDocument, pageIds: string[]): Promise<PdfDocument> {
  if (!pageIds.length) {
    return doc;
  }
  const pagesToKeep = doc.pages.filter((page) => !pageIds.includes(page.id));
  if (!pagesToKeep.length) {
    throw new Error('Cannot delete all pages from a document');
  }
  const indices = pagesToKeep.map((page) => page.index);
  const updated = await buildDocumentFromPageIndices(doc, indices, { reuseId: doc.id, sourceName: doc.sourceName });
  invalidateTextCache(updated.id);
  pdfBytesStore.delete(updated.id);
  return updated;
}

export async function extractPages(doc: PdfDocument, pageIds: string[]): Promise<PdfDocument> {
  if (!pageIds.length) {
    throw new Error('extractPages requires at least one page id');
  }
  const indices = resolvePageIndices(doc, pageIds);
  const extracted = await buildDocumentFromPageIndices(doc, indices, { sourceName: doc.sourceName });
  return extracted;
}

export function rotatePage(doc: PdfDocument, pageId: string, rotation: PdfRotation): PdfDocument {
  const pdf = getPdfHandle(doc.id);
  const pageMeta = doc.pages.find((page) => page.id === pageId);
  if (!pageMeta) {
    throw new Error(`Page with id ${pageId} not found`);
  }
  const page = pdf.getPages()[pageMeta.index];
  page.setRotation(degrees(rotation));
  const updated = persistDocument(pdf, { reuseId: doc.id, sourceName: doc.sourceName });
  invalidateTextCache(updated.id);
  pdfBytesStore.delete(updated.id);
  return updated;
}

export async function getTextRuns(doc: PdfDocument, pageNumber: number): Promise<PdfTextRun[]> {
  if (pageNumber < 1 || pageNumber > doc.pages.length) {
    throw new Error(`Page ${pageNumber} is out of range`);
  }
  let pageCache = textIndexStore.get(doc.id);
  if (!pageCache) {
    pageCache = new Map();
    textIndexStore.set(doc.id, pageCache);
  }
  const cached = pageCache.get(pageNumber);
  if (cached) {
    return cached;
  }

  const hasWindow = typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined';
  const context: 'browser' | 'node' = hasWindow ? 'browser' : 'node';
  const pdfjs = await loadPdfJs(context);
  const bytes = await getPdfBytes(doc.id);
  const loadingTask = pdfjs.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const runs = await extractTextRunsFromPage(page, pageNumber, { viewport });
  pageCache.set(pageNumber, runs);
  return runs;
}

function resolveFontName(fontName?: string, format?: TextFormat): StandardFonts {
  const base = (fontName || '').toLowerCase();
  const bold = format?.fontWeight === 'bold';
  const italic = format?.fontStyle === 'italic';

  const family = base.includes('times')
    ? 'times'
    : base.includes('courier')
      ? 'courier'
      : base.includes('symbol')
        ? 'symbol'
        : base.includes('zapfdingbats')
          ? 'zapf'
          : 'helvetica';

  if (family === 'times') {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold) return StandardFonts.TimesRomanBold;
    if (italic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  if (family === 'courier') {
    if (bold && italic) return StandardFonts.CourierBoldOblique;
    if (bold) return StandardFonts.CourierBold;
    if (italic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }
  if (family === 'symbol') return StandardFonts.Symbol;
  if (family === 'zapf') return StandardFonts.ZapfDingbats;

  if (bold && italic) return StandardFonts.HelveticaBoldOblique;
  if (bold) return StandardFonts.HelveticaBold;
  if (italic) return StandardFonts.HelveticaOblique;
  return StandardFonts.Helvetica;
}

function parseRgb(color?: string) {
  if (!color) return rgb(0, 0, 0);
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

export async function formatTextRuns(
  doc: PdfDocument,
  pageNumber: number,
  runIds: string[],
  format: TextFormat
): Promise<PdfDocument> {
  if (!runIds.length) {
    return doc;
  }
  if (!format || Object.keys(format).length === 0) {
    return doc;
  }

  const pdf = getPdfHandle(doc.id);
  const page = pdf.getPages()[pageNumber - 1];
  if (!page) {
    throw new Error(`Page ${pageNumber} not found`);
  }

  const runs = await getTextRuns(doc, pageNumber);
  const targetRuns = runs.filter((run) => runIds.includes(run.id));
  if (!targetRuns.length) {
    throw new Error('No matching text runs found');
  }

  const pageHeight = page.getHeight();
  for (const run of targetRuns) {
    const pdfBaselineY = pageHeight - run.y;
    const fontSize = format.fontSize || run.fontSize || 12;
    const font = await pdf.embedFont(resolveFontName(format.fontFamily || run.fontName, format));
    const textWidth = font.widthOfTextAtSize(run.text, fontSize);
    let drawX = run.x;
    if (format.textAlign === 'center') {
      drawX = run.x - textWidth / 2;
    } else if (format.textAlign === 'right') {
      drawX = run.x - textWidth;
    }

    page.drawRectangle({
      x: drawX - 1,
      y: pdfBaselineY - run.height - 1,
      width: textWidth + 2,
      height: run.height + 2,
      color: rgb(1, 1, 1),
    });

    page.drawText(run.text, {
      x: drawX,
      y: pdfBaselineY - run.height,
      size: fontSize,
      font,
      color: parseRgb(format.color),
    });
  }

  const updated = persistDocument(pdf, { reuseId: doc.id, sourceName: doc.sourceName });
  invalidateTextCache(updated.id, pageNumber);
  pdfBytesStore.delete(updated.id);
  return updated;
}

export async function deleteTextRuns(
  doc: PdfDocument,
  pageNumber: number,
  runIds: string[]
): Promise<PdfDocument> {
  if (!runIds.length) {
    return doc;
  }

  const pdf = getPdfHandle(doc.id);
  const runs = await getTextRuns(doc, pageNumber);
  const targetRuns = runs.filter((run) => runIds.includes(run.id));
  if (!targetRuns.length) {
    return doc;
  }

  const page = pdf.getPages()[pageNumber - 1];
  const pageHeight = page.getHeight();
  for (const run of targetRuns) {
    const pdfBaselineY = pageHeight - run.y;
    page.drawRectangle({
      x: run.x - 1,
      y: pdfBaselineY - run.height - 1,
      width: run.width + 2,
      height: run.height + 2,
      color: rgb(1, 1, 1),
    });
  }

  const updated = persistDocument(pdf, { reuseId: doc.id, sourceName: doc.sourceName });
  invalidateTextCache(updated.id, pageNumber);
  pdfBytesStore.delete(updated.id);
  return updated;
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
  pdfBytesStore.delete(doc.id);
  textIndexStore.delete(doc.id);
}

export type {
  PdfDocument,
  PdfMetadata,
  PdfPage,
  PdfRotation,
  PdfTextRun,
  LoadPdfOptions,
  ExportOptions,
  TextFormat,
} from './types';

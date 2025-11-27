import type { PdfTextRun } from './types';
import type { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';

export interface TextExtractionOptions {
  minLength?: number;
  viewport?: { width: number; height: number };
}

export async function extractTextRunsFromPage(
  page: PDFPageProxy,
  pageNumber: number,
  options?: TextExtractionOptions
): Promise<PdfTextRun[]> {
  const textContent = await page.getTextContent();
  const viewport = options?.viewport || page.getViewport({ scale: 1 });
  const runs: PdfTextRun[] = [];

  textContent.items.forEach((item: any, index: number) => {
    const str = item.str?.trim();
    if (!str) return;

    const transform = item.transform || [1, 0, 0, 1, 0, 0];
    const x = transform[4] || 0;
    const y = transform[5] || 0;
    const fontName = item.fontName || 'Helvetica';
    const fontSize = item.height || item.fontSize || 12;
    const width = item.width || (fontSize * (str.length || 1)) * 0.5;
    const height = fontSize;

    runs.push({
      id: `page${pageNumber}-item-${index}`,
      page: pageNumber,
      text: str,
      x,
      y: viewport.height - y,
      width,
      height,
      fontName,
      fontSize,
    });
  });

  return runs;
}

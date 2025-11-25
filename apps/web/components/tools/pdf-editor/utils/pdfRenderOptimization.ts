/**
 * PDF Render Optimization Utilities
 * Specialized optimizations for PDF rendering
 */

import { optimizeCanvasContext, renderToOffscreen, CanvasOperationBatcher } from './canvasOptimization';

/**
 * Optimize PDF page rendering
 */
export interface PDFRenderOptions {
  useOffscreen?: boolean;
  progressive?: boolean;
  quality?: 'low' | 'medium' | 'high';
  cache?: boolean;
}

export async function optimizePDFRender(
  page: any, // PDF.js page object
  canvas: HTMLCanvasElement,
  viewport: any,
  options: PDFRenderOptions = {}
): Promise<void> {
  const {
    useOffscreen = false,
    progressive = false,
    quality = 'high',
    cache = true,
  } = options;

  const ctx = optimizeCanvasContext(canvas, {
    alpha: false,
    desynchronized: true,
    willReadFrequently: false,
  });

  if (!ctx) return;

  // Set up quality-based rendering
  const scale = quality === 'high' ? 2 : quality === 'medium' ? 1.5 : 1;
  const scaledViewport = page.getViewport({ scale });

  if (useOffscreen && typeof OffscreenCanvas !== 'undefined') {
    // Use offscreen canvas for heavy rendering
    await renderToOffscreen(
      async (offscreenCtx) => {
        await page.render({
          canvasContext: offscreenCtx,
          viewport: scaledViewport,
        } as any).promise;
      },
      canvas,
      scaledViewport.width,
      scaledViewport.height
    );
  } else {
    // Standard rendering
    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport,
    } as any).promise;
  }
}

/**
 * Batch PDF page renders
 */
export class PDFRenderBatcher {
  private batcher: CanvasOperationBatcher;
  private renderQueue: Array<{
    page: any;
    canvas: HTMLCanvasElement;
    viewport: any;
    options?: PDFRenderOptions;
  }> = [];

  constructor() {
    this.batcher = new CanvasOperationBatcher();
  }

  add(
    page: any,
    canvas: HTMLCanvasElement,
    viewport: any,
    options?: PDFRenderOptions
  ): void {
    this.renderQueue.push({ page, canvas, viewport, options });

    this.batcher.add(async () => {
      const item = this.renderQueue.shift();
      if (item) {
        await optimizePDFRender(item.page, item.canvas, item.viewport, item.options);
      }
    });
  }

  flush(): void {
    // Process all queued renders
    this.renderQueue.forEach(async ({ page, canvas, viewport, options }) => {
      await optimizePDFRender(page, canvas, viewport, options);
    });
    this.renderQueue = [];
  }
}

/**
 * Progressive PDF loading
 */
export async function loadPDFProgressively(
  pdfDoc: any,
  onProgress?: (progress: number) => void
): Promise<void> {
  const numPages = pdfDoc.numPages;
  let loadedPages = 0;

  // Load pages progressively
  for (let i = 1; i <= numPages; i++) {
    await pdfDoc.getPage(i);
    loadedPages++;
    onProgress?.(loadedPages / numPages);
  }
}

/**
 * Preload adjacent pages
 */
export async function preloadAdjacentPages(
  pdfDoc: any,
  currentPage: number,
  preloadCount: number = 2
): Promise<void> {
  const numPages = pdfDoc.numPages;
  const pagesToPreload: number[] = [];

  // Add previous pages
  for (let i = Math.max(1, currentPage - preloadCount); i < currentPage; i++) {
    pagesToPreload.push(i);
  }

  // Add next pages
  for (let i = currentPage + 1; i <= Math.min(numPages, currentPage + preloadCount); i++) {
    pagesToPreload.push(i);
  }

  // Preload pages
  await Promise.all(
    pagesToPreload.map(pageNum => pdfDoc.getPage(pageNum))
  );
}

/**
 * Render page with quality adjustment based on zoom
 */
export function getRenderQuality(zoom: number): 'low' | 'medium' | 'high' {
  if (zoom < 0.5) return 'low';
  if (zoom < 1.5) return 'medium';
  return 'high';
}


// Page Rendering Utilities
import type { Annotation, PdfTextRun } from '../types';

export interface RenderPageOptions {
  page: any;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  container: HTMLElement;
  zoom: number;
  zoomMode: 'custom' | 'fit-width' | 'fit-page' | 'fit-height';
  devicePixelRatio: number;
}

export interface RenderOverlaysOptions {
  context: CanvasRenderingContext2D;
  pageNumber: number;
  pageNum: number;
  annotations: Annotation[];
  pageAnnotations: Annotation[];
  hiddenLayers: Set<string>;
  selectedAnnotation: string | null;
  selectedAnnotations: Set<string>;
  lockedAnnotations: Set<string>;
  pdfTextRuns: Record<number, PdfTextRun[]>;
  textEditMode: boolean;
  tool: string | null;
  selectedTextRun: string | null;
  editingTextRun: string | null;
  textSelectionStart: { x: number; y: number; runId: string; charIndex: number } | null;
  textSelectionEnd: { x: number; y: number; runId: string; charIndex: number } | null;
  highlightedSearchResults: Array<{ runId: string; startIndex: number; endIndex: number; page: number }>;
  findResults: Array<{ runId: string; startIndex: number; endIndex: number; page: number; text: string }>;
  currentFindIndex: number;
  selectedTextRuns: Set<string>;
  spellCheckEnabled: boolean;
  spellCheckResults: Record<string, string[]>;
  strokeColor: string;
  fillColor: string;
  highlightColor: string;
  strokeWidth: number;
  hexToRgb: (hex: string) => { r: number; g: number; b: number } | null;
  renderAnnotationsUtil: (context: CanvasRenderingContext2D, annotations: Annotation[], viewport: any, strokeColor: string, fillColor: string, highlightColor: string, strokeWidth: number, hexToRgb: (hex: string) => { r: number; g: number; b: number } | null) => void;
  drawSearchHighlights: (context: CanvasRenderingContext2D, highlightedSearchResults: Array<{ runId: string; startIndex: number; endIndex: number; page: number }>, findResults: Array<{ runId: string; startIndex: number; endIndex: number; page: number; text: string }>, currentFindIndex: number, runs: PdfTextRun[], pageNumber: number) => void;
  drawTextSelection: (context: CanvasRenderingContext2D, textSelectionStart: { x: number; y: number; runId: string; charIndex: number }, textSelectionEnd: { x: number; y: number; runId: string; charIndex: number }, runs: PdfTextRun[]) => void;
  drawBatchSelection: (context: CanvasRenderingContext2D, selectedTextRuns: Set<string>, runs: PdfTextRun[]) => void;
  viewport: any;
}

/**
 * Calculate viewport scale based on zoom mode
 */
export const calculateViewportScale = (
  containerWidth: number,
  containerHeight: number,
  pdfWidth: number,
  pdfHeight: number,
  zoom: number,
  zoomMode: 'custom' | 'fit-width' | 'fit-page' | 'fit-height'
): number => {
  if (zoomMode === 'fit-width') {
    return (containerWidth / pdfWidth) * zoom;
  } else if (zoomMode === 'fit-height') {
    return (containerHeight / pdfHeight) * zoom;
  } else if (zoomMode === 'fit-page') {
    const scaleX = containerWidth / pdfWidth;
    const scaleY = containerHeight / pdfHeight;
    return Math.min(scaleX, scaleY) * zoom;
  } else {
    // Custom zoom
    const scaleX = (containerWidth / pdfWidth) * zoom;
    const scaleY = (containerHeight / pdfHeight) * zoom;
    return Math.min(scaleX, scaleY, 5.0); // Max zoom 5x for custom
  }
};

/**
 * Setup canvas for rendering
 */
export const setupCanvas = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  viewport: any,
  devicePixelRatio: number
): void => {
  // Set canvas display size (CSS pixels)
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  
  // Set canvas internal size (device pixels for crisp rendering)
  canvas.width = viewport.width * devicePixelRatio;
  canvas.height = viewport.height * devicePixelRatio;
  
  // Scale context to handle device pixel ratio
  context.scale(devicePixelRatio, devicePixelRatio);
};

/**
 * Draw selection highlights and lock indicators
 */
export const drawSelectionIndicators = (
  context: CanvasRenderingContext2D,
  pageAnnotations: Annotation[],
  selectedAnnotation: string | null,
  selectedAnnotations: Set<string>,
  lockedAnnotations: Set<string>
): void => {
  pageAnnotations.forEach(ann => {
    // Selection highlight
    if (selectedAnnotation === ann.id || selectedAnnotations.has(ann.id)) {
      context.strokeStyle = '#3b82f6';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      if (ann.width && ann.height) {
        context.strokeRect(ann.x - 2, ann.y - 2, ann.width + 4, ann.height + 4);
      }
      context.setLineDash([]);
    }
    
    // Lock indicator
    if (lockedAnnotations.has(ann.id)) {
      context.save();
      context.fillStyle = 'rgba(255, 193, 7, 0.3)';
      if (ann.width && ann.height) {
        context.fillRect(ann.x, ann.y, ann.width, ann.height);
      }
      context.fillStyle = '#ffc107';
      context.font = '16px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      const lockX = ann.width ? ann.x + ann.width / 2 : ann.x;
      const lockY = ann.height ? ann.y + ann.height / 2 : ann.y;
      context.fillText('🔒', lockX, lockY);
      context.restore();
    }
  });
};

/**
 * Draw spell check highlights
 */
export const drawSpellCheckHighlights = (
  context: CanvasRenderingContext2D,
  runs: PdfTextRun[],
  spellCheckResults: Record<string, string[]>
): void => {
  runs.forEach(run => {
    const misspelled = spellCheckResults[run.id] || [];
    if (misspelled.length > 0) {
      context.save();
      context.strokeStyle = '#ef4444'; // Red underline for misspellings
      context.lineWidth = 2;
      context.setLineDash([2, 2]);
      context.beginPath();
      context.moveTo(run.x, run.y);
      context.lineTo(run.x + run.width, run.y);
      context.stroke();
      context.restore();
    }
  });
};

/**
 * Draw text run highlights
 */
export const drawTextRunHighlights = (
  context: CanvasRenderingContext2D,
  runs: PdfTextRun[],
  selectedTextRun: string | null,
  editingTextRun: string | null
): void => {
  runs.forEach(run => {
    if (selectedTextRun === run.id || editingTextRun === run.id) {
      context.save();
      context.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Blue highlight
      context.fillRect(run.x, run.y - run.height, run.width, run.height);
      context.strokeStyle = '#3b82f6';
      context.lineWidth = 1;
      context.strokeRect(run.x, run.y - run.height, run.width, run.height);
      context.restore();
    }
  });
};

/**
 * Draw character-level text selection
 */
export const drawCharacterSelection = (
  context: CanvasRenderingContext2D,
  textSelectionStart: { x: number; y: number; runId: string; charIndex: number },
  textSelectionEnd: { x: number; y: number; runId: string; charIndex: number },
  runs: PdfTextRun[]
): void => {
  if (textSelectionStart.runId === textSelectionEnd.runId) {
    const run = runs.find(r => r.id === textSelectionStart.runId);
    if (run) {
      context.save();
      context.font = `${run.fontSize}px ${run.fontName}`;
      const startIdx = Math.min(textSelectionStart.charIndex, textSelectionEnd.charIndex);
      const endIdx = Math.max(textSelectionStart.charIndex, textSelectionEnd.charIndex);
      const startText = run.text.substring(0, startIdx);
      const endText = run.text.substring(0, endIdx);
      const startX = run.x + context.measureText(startText).width;
      const endX = run.x + context.measureText(endText).width;
      
      // Draw selection highlight
      context.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Blue selection
      context.fillRect(
        Math.min(startX, endX),
        run.y - run.height,
        Math.abs(endX - startX),
        run.height
      );
      context.restore();
    }
  }
};

/**
 * Render all overlays (highlights, selections, annotations, etc.)
 */
export const renderPageOverlays = (options: RenderOverlaysOptions): void => {
  const {
    context,
    pageNumber,
    pageNum,
    pageAnnotations,
    selectedAnnotation,
    selectedAnnotations,
    lockedAnnotations,
    pdfTextRuns,
    textEditMode,
    tool,
    selectedTextRun,
    editingTextRun,
    textSelectionStart,
    textSelectionEnd,
    highlightedSearchResults,
    findResults,
    currentFindIndex,
    selectedTextRuns,
    spellCheckEnabled,
    spellCheckResults,
    strokeColor,
    fillColor,
    highlightColor,
    strokeWidth,
    hexToRgb,
    renderAnnotationsUtil,
    drawSearchHighlights,
    drawTextSelection,
    drawBatchSelection,
    viewport,
  } = options;

  // Draw search result highlights, text selection, and batch selection
  if (pageNumber === pageNum) {
    const runs: PdfTextRun[] = pdfTextRuns[pageNumber] || [];
    
    // Draw search highlights
    if (highlightedSearchResults.length > 0) {
      drawSearchHighlights(context, highlightedSearchResults, findResults, currentFindIndex, runs, pageNumber);
    }
    
    // Draw text selection
    if (textSelectionStart && textSelectionEnd) {
      drawTextSelection(context, textSelectionStart, textSelectionEnd, runs);
    }
    
    // Draw batch selection
    if (selectedTextRuns.size > 0) {
      drawBatchSelection(context, selectedTextRuns, runs);
    }
  }
  
  // Render annotations using utility function
  renderAnnotationsUtil(context, pageAnnotations, viewport, strokeColor, fillColor, highlightColor, strokeWidth, hexToRgb);
  
  // Draw selection highlights and lock indicators
  drawSelectionIndicators(context, pageAnnotations, selectedAnnotation, selectedAnnotations, lockedAnnotations);
  
  // Draw text run highlights and selections (for PDF text editing)
  if ((textEditMode || tool === 'edit-text') && pdfTextRuns[pageNumber]) {
    const runs = pdfTextRuns[pageNumber];
    
    // Draw spell check highlights
    if (spellCheckEnabled) {
      drawSpellCheckHighlights(context, runs, spellCheckResults);
    }
    
    // Draw text selection (character-level)
    if (textSelectionStart && textSelectionEnd) {
      drawCharacterSelection(context, textSelectionStart, textSelectionEnd, runs);
    }
    
    // Draw run highlights
    drawTextRunHighlights(context, runs, selectedTextRun, editingTextRun);
  }
};

/**
 * Manage render cache
 */
export const manageRenderCache = (
  renderCacheRef: React.MutableRefObject<Map<number, { imageData: string; timestamp: number }>>,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  annotations: Annotation[],
  CACHE_EXPIRY: number,
  RENDER_CACHE_SIZE: number
): void => {
  // Cache rendered page if no annotations
  if (annotations.filter(a => a.page === pageNumber).length === 0) {
    const imageData = canvas.toDataURL('image/png');
    renderCacheRef.current.set(pageNumber, {
      imageData,
      timestamp: Date.now(),
    });
    
    // Limit cache size
    if (renderCacheRef.current.size > RENDER_CACHE_SIZE) {
      const oldestKey = Array.from(renderCacheRef.current.keys())
        .sort((a, b) => {
          const aTime = renderCacheRef.current.get(a)!.timestamp;
          const bTime = renderCacheRef.current.get(b)!.timestamp;
          return aTime - bTime;
        })[0];
      renderCacheRef.current.delete(oldestKey);
    }
  }
};



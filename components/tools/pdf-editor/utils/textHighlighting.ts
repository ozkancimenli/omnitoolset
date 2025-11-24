// Text Highlighting Utility Functions
import type { PdfTextRun } from '../types';

export interface SearchHighlight {
  runId: string;
  startIndex: number;
  endIndex: number;
  page: number;
}

export interface TextSelection {
  start: { runId: string; charIndex: number };
  end: { runId: string; charIndex: number };
}

/**
 * Draw search result highlights on canvas
 */
export const drawSearchHighlights = (
  context: CanvasRenderingContext2D,
  highlightedSearchResults: SearchHighlight[],
  findResults: Array<{ runId: string; startIndex: number; endIndex: number; page: number; text: string }>,
  currentFindIndex: number,
  runs: PdfTextRun[],
  pageNumber: number
): void => {
  if (highlightedSearchResults.length === 0) return;
  
  highlightedSearchResults.forEach((highlight) => {
    if (highlight.page === pageNumber) {
      const run = runs.find(r => r.id === highlight.runId);
      if (run) {
        context.font = `${run.fontSize}px ${run.fontName}`;
        const startText = run.text.substring(0, highlight.startIndex);
        const endText = run.text.substring(0, highlight.endIndex);
        const startX = run.x + context.measureText(startText).width;
        const endX = run.x + context.measureText(endText).width;
        
        // Draw highlight
        context.fillStyle = 'rgba(255, 255, 0, 0.3)';
        context.fillRect(
          startX,
          run.y - run.height,
          endX - startX,
          run.height
        );
        
        // Draw border for current result
        if (currentFindIndex >= 0 && findResults[currentFindIndex]?.runId === highlight.runId && 
            findResults[currentFindIndex]?.startIndex === highlight.startIndex) {
          context.strokeStyle = '#FF6B00';
          context.lineWidth = 2;
          context.strokeRect(
            startX - 1,
            run.y - run.height - 1,
            endX - startX + 2,
            run.height + 2
          );
        }
      }
    }
  });
};

/**
 * Draw text selection highlight (supports cross-run selection)
 */
export const drawTextSelection = (
  context: CanvasRenderingContext2D,
  textSelectionStart: { runId: string; charIndex: number } | null,
  textSelectionEnd: { runId: string; charIndex: number } | null,
  runs: PdfTextRun[]
): void => {
  if (!textSelectionStart || !textSelectionEnd) return;
  
  // Single run selection
  if (textSelectionStart.runId === textSelectionEnd.runId) {
    const run = runs.find(r => r.id === textSelectionStart.runId);
    if (run) {
      context.font = `${run.fontSize}px ${run.fontName}`;
      const startIdx = Math.min(textSelectionStart.charIndex, textSelectionEnd.charIndex);
      const endIdx = Math.max(textSelectionStart.charIndex, textSelectionEnd.charIndex);
      const startText = run.text.substring(0, startIdx);
      const endText = run.text.substring(0, endIdx);
      const startX = run.x + context.measureText(startText).width;
      const endX = run.x + context.measureText(endText).width;
      
      // Draw selection highlight
      context.fillStyle = 'rgba(0, 123, 255, 0.3)';
      context.fillRect(
        startX,
        run.y - run.height,
        endX - startX,
        run.height
      );
    }
  } else {
    // Multi-run selection - highlight all runs between start and end
    const startRunIndex = runs.findIndex(r => r.id === textSelectionStart.runId);
    const endRunIndex = runs.findIndex(r => r.id === textSelectionEnd.runId);
    
    if (startRunIndex !== -1 && endRunIndex !== -1) {
      const minIndex = Math.min(startRunIndex, endRunIndex);
      const maxIndex = Math.max(startRunIndex, endRunIndex);
      
      runs.slice(minIndex, maxIndex + 1).forEach((run, idx) => {
        context.font = `${run.fontSize}px ${run.fontName}`;
        
        let startX = run.x;
        let endX = run.x + run.width;
        
        // First run: start from selection start
        if (idx === 0 && startRunIndex === minIndex) {
          const startText = run.text.substring(0, textSelectionStart.charIndex);
          startX = run.x + context.measureText(startText).width;
        }
        
        // Last run: end at selection end
        if (idx === maxIndex - minIndex && endRunIndex === maxIndex) {
          const endText = run.text.substring(0, textSelectionEnd.charIndex);
          endX = run.x + context.measureText(endText).width;
        }
        
        // Draw selection highlight for this run
        context.fillStyle = 'rgba(0, 123, 255, 0.3)';
        context.fillRect(
          startX,
          run.y - run.height,
          endX - startX,
          run.height
        );
      });
    }
  }
};

/**
 * Draw batch selection highlights (multiple selected text runs)
 */
export const drawBatchSelection = (
  context: CanvasRenderingContext2D,
  selectedTextRuns: Set<string>,
  runs: PdfTextRun[]
): void => {
  if (selectedTextRuns.size === 0) return;
  
  runs.forEach(run => {
    if (selectedTextRuns.has(run.id)) {
      // Draw highlight around selected text run
      context.strokeStyle = '#3b82f6';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.strokeRect(
        run.x - 2,
        run.y - run.height - 2,
        run.width + 4,
        run.height + 4
      );
      context.setLineDash([]);
      
      // Draw semi-transparent overlay
      context.fillStyle = 'rgba(59, 130, 246, 0.1)';
      context.fillRect(
        run.x - 2,
        run.y - run.height - 2,
        run.width + 4,
        run.height + 4
      );
    }
  });
};



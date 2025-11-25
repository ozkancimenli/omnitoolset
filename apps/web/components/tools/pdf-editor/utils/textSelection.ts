// Text Selection Utility Functions
import type { PdfTextRun } from '../types';

export interface TextSelection {
  start: { runId: string; charIndex: number };
  end: { runId: string; charIndex: number };
}

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Find character index at position within a text run
 */
export const findCharIndexAtPosition = (
  x: number,
  run: PdfTextRun,
  canvas: HTMLCanvasElement
): number => {
  const context = canvas.getContext('2d');
  if (!context) return 0;
  
  // Measure text to find character position
  context.font = `${run.fontSize}px ${run.fontName}`;
  const relativeX = x - run.x;
  
  // Binary search for character position
  let charIndex = 0;
  
  for (let i = 0; i <= run.text.length; i++) {
    const substr = run.text.substring(0, i);
    const width = context.measureText(substr).width;
    if (width >= relativeX) {
      charIndex = i;
      break;
    }
  }
  
  return Math.max(0, Math.min(run.text.length, charIndex));
};

/**
 * Get selected text from selection start and end
 */
export const getSelectedText = (
  start: { runId: string; charIndex: number },
  end: { runId: string; charIndex: number },
  runs: PdfTextRun[]
): string => {
  if (start.runId === end.runId) {
    // Single run selection
    const run = runs.find(r => r.id === start.runId);
    if (!run) return '';
    
    const startIdx = Math.min(start.charIndex, end.charIndex);
    const endIdx = Math.max(start.charIndex, end.charIndex);
    return run.text.substring(startIdx, endIdx);
  } else {
    // Multi-run selection
    const startRunIndex = runs.findIndex(r => r.id === start.runId);
    const endRunIndex = runs.findIndex(r => r.id === end.runId);
    
    if (startRunIndex === -1 || endRunIndex === -1) return '';
    
    const minIndex = Math.min(startRunIndex, endRunIndex);
    const maxIndex = Math.max(startRunIndex, endRunIndex);
    
    const selectedRuns = runs.slice(minIndex, maxIndex + 1);
    const texts: string[] = [];
    
    selectedRuns.forEach((run, idx) => {
      if (idx === 0 && startRunIndex === minIndex) {
        // First run: start from selection start
        texts.push(run.text.substring(start.charIndex));
      } else if (idx === selectedRuns.length - 1 && endRunIndex === maxIndex) {
        // Last run: end at selection end
        texts.push(run.text.substring(0, end.charIndex));
      } else {
        // Middle runs: full text
        texts.push(run.text);
      }
    });
    
    return texts.join(' ');
  }
};

/**
 * Get text selection rectangle
 */
export const getTextSelectionRect = (
  start: { runId: string; charIndex: number },
  end: { runId: string; charIndex: number },
  runs: PdfTextRun[],
  canvas: HTMLCanvasElement
): SelectionRect | null => {
  const startRun = runs.find(r => r.id === start.runId);
  const endRun = runs.find(r => r.id === end.runId);
  
  if (!startRun || !endRun) return null;
  
  const context = canvas.getContext('2d');
  if (!context) return null;
  
  context.font = `${startRun.fontSize}px ${startRun.fontName}`;
  
  if (start.runId === end.runId) {
    // Same run - single selection
    const startText = startRun.text.substring(0, start.charIndex);
    const endText = startRun.text.substring(0, end.charIndex);
    const startX = startRun.x + context.measureText(startText).width;
    const endX = startRun.x + context.measureText(endText).width;
    
    return {
      x: Math.min(startX, endX),
      y: startRun.y - startRun.height,
      width: Math.abs(endX - startX),
      height: startRun.height,
    };
  } else {
    // Multi-run selection (simplified - just highlight runs)
    return {
      x: startRun.x,
      y: startRun.y - startRun.height,
      width: endRun.x + endRun.width - startRun.x,
      height: startRun.height,
    };
  }
};



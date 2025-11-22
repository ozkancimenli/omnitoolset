// Text Extraction Utilities
import type { PdfTextItem, PdfTextRun } from '../types';

export const mapTextItemsToRuns = (textItems: PdfTextItem[], pageNumber: number): PdfTextRun[] => {
  const runs: PdfTextRun[] = [];
  let currentRun: PdfTextItem[] = [];
  let currentY = -1;
  const lineThreshold = 5; // Pixels - items within this Y distance are on same line
  
  textItems.forEach((item, index) => {
    if (item.str.trim() === '') return; // Skip empty items
    
    // Check if this item is on a new line
    if (currentY === -1 || Math.abs(item.y - currentY) > lineThreshold) {
      // Save previous run if exists
      if (currentRun.length > 0) {
        const runText = currentRun.map(i => i.str).join('');
        const firstItem = currentRun[0];
        const lastItem = currentRun[currentRun.length - 1];
        const runWidth = lastItem.x + lastItem.width - firstItem.x;
        
        runs.push({
          id: `run-${pageNumber}-${runs.length}`,
          text: runText,
          x: firstItem.x,
          y: firstItem.y,
          width: runWidth,
          height: firstItem.height,
          fontSize: firstItem.fontSize,
          fontName: firstItem.fontName,
          page: pageNumber,
          startIndex: index - currentRun.length,
          endIndex: index - 1,
        });
      }
      
      // Start new run
      currentRun = [item];
      currentY = item.y;
    } else {
      // Same line - add to current run
      currentRun.push(item);
    }
  });
  
  // Add last run
  if (currentRun.length > 0) {
    const runText = currentRun.map(i => i.str).join('');
    const firstItem = currentRun[0];
    const lastItem = currentRun[currentRun.length - 1];
    const runWidth = lastItem.x + lastItem.width - firstItem.x;
    
    runs.push({
      id: `run-${pageNumber}-${runs.length}`,
      text: runText,
      x: firstItem.x,
      y: firstItem.y,
      width: runWidth,
      height: firstItem.height,
      fontSize: firstItem.fontSize,
      fontName: firstItem.fontName,
      page: pageNumber,
      startIndex: textItems.length - currentRun.length,
      endIndex: textItems.length - 1,
    });
  }
  
  return runs;
};

export const findTextRunAtPosition = (
  x: number,
  y: number,
  runs: PdfTextRun[],
  tolerance: number = 200
): PdfTextRun | null => {
  if (runs.length === 0) {
    return null;
  }
  
  let closestRun: PdfTextRun | null = null;
  let closestDistance = Infinity;
  
  runs.forEach((run) => {
    const textTop = run.y - run.height;
    const textBottom = run.y;
    const textLeft = run.x;
    const textRight = run.x + run.width;
    
    const isNear = (
      x >= textLeft - tolerance &&
      x <= textRight + tolerance &&
      y >= textTop - tolerance &&
      y <= textBottom + tolerance
    );
    
    if (isNear) {
      const centerX = run.x + run.width / 2;
      const centerY = run.y - run.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestRun = run;
      }
    }
  });
  
  return closestRun;
};


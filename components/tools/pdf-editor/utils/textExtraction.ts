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
  tolerance: number = 50 // Reduced from 200 to 50 for more precise detection
): PdfTextRun | null => {
  if (runs.length === 0) {
    console.log('[TEXT DETECT] No runs available');
    return null;
  }
  
  console.log('[TEXT DETECT] Searching for text at:', { x, y }, 'in', runs.length, 'runs');
  
  let closestRun: PdfTextRun | null = null;
  let closestDistance = Infinity;
  
  runs.forEach((run, index) => {
    // PDF coordinates: y=0 at bottom, text runs have y at bottom of text
    const textTop = run.y - run.height; // Top of text (smaller y value)
    const textBottom = run.y; // Bottom of text (larger y value)
    const textLeft = run.x;
    const textRight = run.x + run.width;
    
    // Check if click is within text bounds (with tolerance)
    const isWithinBounds = (
      x >= textLeft - tolerance &&
      x <= textRight + tolerance &&
      y >= textTop - tolerance &&
      y <= textBottom + tolerance
    );
    
    if (isWithinBounds) {
      const centerX = run.x + run.width / 2;
      const centerY = run.y - run.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      console.log('[TEXT DETECT] Found candidate run', index, ':', {
        id: run.id,
        text: run.text.substring(0, 30),
        bounds: { left: textLeft, right: textRight, top: textTop, bottom: textBottom },
        distance
      });
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestRun = run;
      }
    }
  });
  
  if (closestRun) {
    console.log('[TEXT DETECT] Selected run:', closestRun.id, closestRun.text.substring(0, 50));
  } else {
    console.log('[TEXT DETECT] No run found - click outside all text bounds');
  }
  
  return closestRun;
};



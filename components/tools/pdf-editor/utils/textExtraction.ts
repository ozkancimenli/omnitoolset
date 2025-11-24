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
  tolerance: number = 50 // Reduced tolerance since we now have individual items
): PdfTextRun | null => {
  if (runs.length === 0) {
    return null;
  }
  
  let closestRun: PdfTextRun | null = null;
  let closestDistance = Infinity;
  
  // IMPROVED: Like Sejda - check individual items first, then grouped runs
  // Individual items (prefixed with "item-") are checked first for precise clicking
  const individualRuns = runs.filter(r => r.id.startsWith('item-'));
  const groupedRuns = runs.filter(r => !r.id.startsWith('item-'));
  
  // Check individual items first (more precise)
  const runsToCheck = [...individualRuns, ...groupedRuns];
  
  runsToCheck.forEach((run) => {
    // Canvas coordinates: y=0 at top
    // Text runs: y is at bottom of text (baseline)
    const textTop = run.y - run.height;
    const textBottom = run.y;
    const textLeft = run.x;
    const textRight = run.x + run.width;
    
    // IMPROVED: More precise detection like Sejda
    // 1. Direct hit within text bounds (highest priority)
    const isDirectHit = (
      x >= textLeft &&
      x <= textRight &&
      y >= textTop &&
      y <= textBottom
    );
    
    // 2. Within expanded bounds (with tolerance)
    const isWithinBounds = (
      x >= textLeft - tolerance &&
      x <= textRight + tolerance &&
      y >= textTop - tolerance &&
      y <= textBottom + tolerance
    );
    
    // 3. Near text (within character width/height)
    const charWidth = run.width / Math.max(run.text.length, 1);
    const isNearText = (
      Math.abs(x - (textLeft + textRight) / 2) < charWidth * 2 &&
      Math.abs(y - (textTop + textBottom) / 2) < run.height * 2
    );
    
    if (isDirectHit || isWithinBounds || isNearText) {
      // Calculate distance to text center
      const centerX = run.x + run.width / 2;
      const centerY = run.y - run.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      
      // Prioritize: direct hits > individual items > grouped runs
      let priority = 1;
      if (isDirectHit) priority = 0.1; // Direct hits get highest priority
      if (run.id.startsWith('item-')) priority *= 0.5; // Individual items preferred over grouped
      
      const adjustedDistance = distance * priority;
      
      if (adjustedDistance < closestDistance) {
        closestDistance = adjustedDistance;
        closestRun = run;
      }
    }
  });
  
  return closestRun;
};



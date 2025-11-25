import type { PdfTextRun } from '../types';

export interface FindResult {
  runId: string;
  startIndex: number;
  endIndex: number;
  page: number;
  text: string;
}

export function findTextInPdf(
  searchText: string,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  options: {
    useRegex?: boolean;
    caseSensitive?: boolean;
    wholeWords?: boolean;
    searchAllPages?: boolean;
    currentPage?: number;
  } = {}
): FindResult[] {
  const {
    useRegex = false,
    caseSensitive = false,
    wholeWords = false,
    searchAllPages = false,
    currentPage = 1,
  } = options;

  const results: FindResult[] = [];
  const pagesToSearch = searchAllPages
    ? Object.keys(pdfTextRuns).map(Number)
    : [currentPage];

  let searchPattern: RegExp | string = searchText;
  
  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      searchPattern = new RegExp(searchText, flags);
    } catch (error) {
      console.error('Invalid regex pattern:', error);
      return [];
    }
  } else {
    if (wholeWords) {
      const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = caseSensitive ? 'g' : 'gi';
      searchPattern = new RegExp(`\\b${escaped}\\b`, flags);
    } else {
      searchPattern = caseSensitive ? searchText : searchText.toLowerCase();
    }
  }

  for (const pageNum of pagesToSearch) {
    const runs = pdfTextRuns[pageNum] || [];
    
    for (const run of runs) {
      const text = run.text;
      let matches: RegExpMatchArray[] = [];
      
      if (useRegex || wholeWords) {
        const regex = searchPattern as RegExp;
        let match;
        while ((match = regex.exec(text)) !== null) {
          matches.push(match);
          if (!regex.global) break;
        }
        regex.lastIndex = 0; // Reset for next run
      } else {
        const searchLower = (searchPattern as string).toLowerCase();
        const textLower = text.toLowerCase();
        let index = 0;
        while ((index = textLower.indexOf(searchLower, index)) !== -1) {
          matches.push({
            index,
            length: searchText.length,
            input: text,
            [0]: text.substring(index, index + searchText.length),
          } as RegExpMatchArray);
          index += searchText.length;
        }
      }
      
      for (const match of matches) {
        results.push({
          runId: run.id,
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
          page: pageNum,
          text: match[0],
        });
      }
    }
  }

  return results;
}

export function getSelectedText(
  start: { x: number; y: number; runId: string; charIndex: number },
  end: { x: number; y: number; runId: string; charIndex: number },
  runs: PdfTextRun[]
): string | null {
  const startRun = runs.find(r => r.id === start.runId);
  const endRun = runs.find(r => r.id === end.runId);
  
  if (!startRun || !endRun) return null;
  
  if (startRun.id === endRun.id) {
    // Single run selection
    const startIdx = Math.min(start.charIndex, end.charIndex);
    const endIdx = Math.max(start.charIndex, end.charIndex);
    return startRun.text.substring(startIdx, endIdx);
  }
  
  // Multi-run selection
  const startRunIndex = runs.findIndex(r => r.id === start.runId);
  const endRunIndex = runs.findIndex(r => r.id === end.runId);
  const minIndex = Math.min(startRunIndex, endRunIndex);
  const maxIndex = Math.max(startRunIndex, endRunIndex);
  
  let selectedText = '';
  for (let i = minIndex; i <= maxIndex; i++) {
    const run = runs[i];
    if (i === minIndex) {
      selectedText += run.text.substring(start.charIndex);
    } else if (i === maxIndex) {
      selectedText += run.text.substring(0, end.charIndex);
    } else {
      selectedText += run.text;
    }
    if (i < maxIndex) {
      selectedText += ' ';
    }
  }
  
  return selectedText;
}

/**
 * Navigate to a specific find result
 */
export const navigateToFindResult = (
  index: number,
  findResults: FindResult[],
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  setPageNum?: (page: number) => void,
  setSelectedTextRun?: (id: string | null) => void,
  setTextSelectionStart?: (start: { x: number; y: number; runId: string; charIndex: number } | null) => void,
  setTextSelectionEnd?: (end: { x: number; y: number; runId: string; charIndex: number } | null) => void,
  setCurrentFindIndex?: (index: number) => void,
  renderPage?: (page: number) => void
): void => {
  if (index < 0 || index >= findResults.length) return;
  
  const result = findResults[index];
  const runs = pdfTextRuns[result.page] || [];
  const run = runs.find(r => r.id === result.runId);
  
  if (run) {
    // Switch to the page if needed
    if (result.page !== pageNum && setPageNum) {
      setPageNum(result.page);
    }
    
    setSelectedTextRun?.(run.id);
    setTextSelectionStart?.({ x: 0, y: 0, runId: run.id, charIndex: result.startIndex });
    setTextSelectionEnd?.({ x: 0, y: 0, runId: run.id, charIndex: result.endIndex });
    setCurrentFindIndex?.(index);
    
    // Scroll to result after page renders
    if (renderPage) {
      setTimeout(() => {
        renderPage(result.page);
      }, 100);
    }
  }
};

/**
 * Navigate to next/previous find result
 */
export const navigateFindResult = (
  direction: 'next' | 'prev',
  findResults: FindResult[],
  currentFindIndex: number,
  navigateToFindResultFn: (index: number) => void
): void => {
  if (findResults.length === 0) return;
  
  const newIndex = direction === 'next'
    ? (currentFindIndex + 1) % findResults.length
    : (currentFindIndex - 1 + findResults.length) % findResults.length;
  
  navigateToFindResultFn(newIndex);
};

/**
 * Replace text in PDF (using engine or fallback)
 */
export const replaceTextInPdf = async (
  searchText: string,
  replaceText: string,
  pdfEngineRef: React.MutableRefObject<any>,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  numPages: number,
  file: File | null,
  pdfUrl: string | null,
  setPdfUrl: (url: string | null) => void,
  pdfLibDocRef: React.MutableRefObject<any>,
  extractTextLayer: (page: number) => Promise<void>,
  renderPage: (page: number) => Promise<void>,
  updatePdfText: (runId: string, newText: string) => void,
  findTextInPdf: (searchText: string) => void,
  caseSensitive: boolean,
  wholeWords: boolean,
  useRegex: boolean
): Promise<void> => {
  if (!searchText.trim()) return;
  
  // Use engine for advanced search and replace across all pages
  if (pdfEngineRef.current) {
    const result = await pdfEngineRef.current.searchAndReplace(
      searchText,
      replaceText,
      {
        caseSensitive,
        wholeWords,
        regex: useRegex,
      }
    );
    
    if (result.success) {
      if (result.replacements > 0) {
        // Reload PDF to show changes
        if (file && pdfEngineRef.current) {
          const pdfBytes = await pdfEngineRef.current.savePdf();
          const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
          const newUrl = URL.createObjectURL(blob);
          
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
          setPdfUrl(newUrl);
          
          // Update pdf-lib ref
          const { PDFDocument } = await import('pdf-lib');
          pdfLibDocRef.current = await PDFDocument.load(pdfBytes);
          
          // Re-extract text layers for all pages
          for (let i = 1; i <= numPages; i++) {
            await extractTextLayer(i);
          }
          
          // Re-render current page
          await renderPage(pageNum);
        }
        
        // Note: toast should be called by caller
        findTextInPdf(searchText); // Refresh find results
      }
    }
    return;
  }
  
  // Fallback to legacy method (single page only)
  const runs = pdfTextRuns[pageNum] || [];
  let replaced = 0;
  
  runs.forEach(run => {
    if (run.text.includes(searchText)) {
      const newText = run.text.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceText);
      if (newText !== run.text) {
        updatePdfText(run.id, newText);
        replaced++;
      }
    }
  });
  
  if (replaced > 0) {
    findTextInPdf(searchText); // Refresh find results
  }
};


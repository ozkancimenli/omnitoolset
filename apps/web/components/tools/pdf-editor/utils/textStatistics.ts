import type { PdfTextRun } from '../types';

export interface TextStatistics {
  totalChars: number;
  totalWords: number;
  totalRuns: number;
  totalLines: number;
  totalParagraphs: number;
  totalSentences: number;
  pageStats: Array<{ page: number; chars: number; words: number; runs: number }>;
  pagesAnalyzed: number;
  averageWordsPerPage: number;
  averageCharsPerPage: number;
}

export function calculateTextStats(
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  allPages: boolean = false
): TextStatistics {
  const pagesToAnalyze = allPages 
    ? Object.keys(pdfTextRuns).map(Number).sort((a, b) => a - b)
    : [pageNum];
  
  let totalChars = 0;
  let totalWords = 0;
  let totalRuns = 0;
  let totalLines = 0;
  let totalParagraphs = 0;
  let totalSentences = 0;
  const pageStats: Array<{ page: number; chars: number; words: number; runs: number }> = [];
  
  pagesToAnalyze.forEach(pageNumber => {
    const runs = pdfTextRuns[pageNumber] || [];
    let pageChars = 0;
    let pageWords = 0;
    let pageLines = 0;
    const pageTexts: string[] = [];
  
    runs.forEach(run => {
      pageChars += run.text.length;
      totalChars += run.text.length;
      
      const words = run.text.trim().split(/\s+/).filter(w => w.length > 0);
      pageWords += words.length;
      totalWords += words.length;
      
      // Count lines (text runs are typically on separate lines)
      if (run.text.trim().length > 0) {
        pageLines++;
        totalLines++;
      }
      
      pageTexts.push(run.text);
    });
    
    totalRuns += runs.length;
    
    // Count paragraphs (empty lines separate paragraphs)
    const fullPageText = pageTexts.join('\n');
    const paragraphs = fullPageText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    totalParagraphs += paragraphs.length;
    
    // Count sentences (basic sentence detection)
    const sentences = fullPageText.match(/[.!?]+/g) || [];
    totalSentences += sentences.length;
    
    pageStats.push({
      page: pageNumber,
      chars: pageChars,
      words: pageWords,
      runs: runs.length,
    });
  });
  
  return {
    totalChars,
    totalWords,
    totalRuns,
    totalLines,
    totalParagraphs,
    totalSentences,
    pageStats,
    pagesAnalyzed: pagesToAnalyze.length,
    averageWordsPerPage: pagesToAnalyze.length > 0 ? Math.round(totalWords / pagesToAnalyze.length) : 0,
    averageCharsPerPage: pagesToAnalyze.length > 0 ? Math.round(totalChars / pagesToAnalyze.length) : 0,
  };
}

/**
 * Save text style
 */
export const saveTextStyle = (
  name: string,
  editingTextFormat: any,
  setTextStyles: (updater: (prev: Array<{ name: string; format: any }>) => Array<{ name: string; format: any }>) => void
): void => {
  if (!editingTextFormat || Object.keys(editingTextFormat).length === 0) {
    return;
  }
  
  setTextStyles(prev => [...prev, { name, format: { ...editingTextFormat } }]);
};

/**
 * Apply text style
 */
export const applyTextStyle = (
  style: { name: string; format: any },
  setEditingTextFormat: (format: any) => void
): void => {
  setEditingTextFormat(style.format);
};

/**
 * Spell check (basic implementation)
 */
export const checkSpelling = (text: string): string[] => {
  // Basic spell check - in production, use a proper spell check library
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'
  ]);
  
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const misspelled: string[] = [];
  
  words.forEach(word => {
    if (word.length > 2 && !commonWords.has(word) && !/^\d+$/.test(word)) {
      // Simple heuristic: words not in common list might be misspelled
      // In production, use a proper dictionary
      if (Math.random() > 0.95) { // Simulate some misspellings for demo
        misspelled.push(word);
      }
    }
  });
  
  return misspelled;
};

/**
 * Text transformation
 */
export const transformText = (text: string, transform: 'uppercase' | 'lowercase' | 'capitalize'): string => {
  switch (transform) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    default:
      return text;
  }
};


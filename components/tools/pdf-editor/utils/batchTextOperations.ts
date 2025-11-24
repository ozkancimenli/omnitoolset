// Batch Text Operations Utilities
import { toast } from '@/components/Toast';
import type { PdfTextRun } from '../types';

export interface TextFormat {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * Apply format to multiple selected text runs
 */
export const applyFormatToBatchTextRuns = async (
  selectedTextRuns: Set<string>,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  format: TextFormat,
  updatePdfText: (runId: string, newText: string, format?: TextFormat) => Promise<void>,
  renderPage: (page: number) => void
): Promise<void> => {
  if (selectedTextRuns.size === 0) {
    toast.warning('No text selected. Select text runs with Ctrl/Cmd+Click');
    return;
  }

  const runs = pdfTextRuns[pageNum] || [];
  let updatedCount = 0;

  for (const runId of selectedTextRuns) {
    const run = runs.find(r => r.id === runId);
    if (run) {
      // Apply format to each selected run
      await updatePdfText(runId, run.text, format);
      updatedCount++;
    }
  }

  toast.success(`Format applied to ${updatedCount} text run(s)`);
  renderPage(pageNum);
};

/**
 * Delete multiple selected text runs
 */
export const deleteBatchTextRuns = async (
  selectedTextRuns: Set<string>,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number,
  pdfEngineRef: React.MutableRefObject<any>,
  setPdfTextRuns: (updater: (prev: Record<number, PdfTextRun[]>) => Record<number, PdfTextRun[]>) => void,
  setSelectedTextRuns: (runs: Set<string>) => void,
  renderPage: (page: number) => void
): Promise<void> => {
  if (selectedTextRuns.size === 0) {
    toast.warning('No text selected');
    return;
  }

  if (!confirm(`Delete ${selectedTextRuns.size} text run(s)?`)) {
    return;
  }

  const runs = pdfTextRuns[pageNum] || [];
  const runsToDelete = Array.from(selectedTextRuns);
  
  // Remove text runs from state
  setPdfTextRuns(prev => {
    const pageRuns = prev[pageNum] || [];
    return {
      ...prev,
      [pageNum]: pageRuns.filter(r => !runsToDelete.includes(r.id))
    };
  });

  // Update PDF using engine if available
  if (pdfEngineRef.current) {
    for (const runId of runsToDelete) {
      const run = runs.find(r => r.id === runId);
      if (run) {
        await pdfEngineRef.current.modifyText(pageNum, [{ runId, newText: '' }]);
      }
    }
  }

  setSelectedTextRuns(new Set());
  toast.success(`Deleted ${runsToDelete.length} text run(s)`);
  renderPage(pageNum);
};

/**
 * Copy selected text runs to clipboard
 */
export const copyBatchTextRuns = (
  selectedTextRuns: Set<string>,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pageNum: number
): void => {
  if (selectedTextRuns.size === 0) {
    toast.warning('No text selected');
    return;
  }

  const runs = pdfTextRuns[pageNum] || [];
  const selectedRuns = Array.from(selectedTextRuns)
    .map(runId => runs.find(r => r.id === runId))
    .filter(Boolean) as PdfTextRun[];

  const textToCopy = selectedRuns.map(r => r.text).join('\n');
  navigator.clipboard.writeText(textToCopy).then(() => {
    toast.success(`Copied ${selectedRuns.length} text run(s) to clipboard`);
  }).catch(err => {
    console.error('Failed to copy text:', err);
    toast.error('Failed to copy text');
  });
};



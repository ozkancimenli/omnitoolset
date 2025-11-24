// Text Edit History Hook
import { useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from '@/components/Toast';
import type { PdfTextRun } from '../types';
import { updatePdfTextOverlay as updatePdfTextOverlayUtil } from '../utils/pdfTextUpdate';

interface UseTextEditHistoryProps {
  textEditHistory: Array<{ runId: string; oldText: string; newText: string; format?: any }>;
  textEditHistoryIndex: number;
  setTextEditHistory: (updater: (prev: Array<{ runId: string; oldText: string; newText: string; format?: any }>) => Array<{ runId: string; oldText: string; newText: string; format?: any }>) => void;
  setTextEditHistoryIndex: (updater: (prev: number) => number) => void;
  pdfTextRuns: Record<number, PdfTextRun[]>;
  pageNum: number;
  pdfEngineRef: React.MutableRefObject<any>;
  file: File | null;
  pdfUrl: string | null;
  setPdfUrl: (url: string | null) => void;
  pdfLibDocRef: React.MutableRefObject<any>;
  setPdfTextRuns: (updater: (prev: Record<number, PdfTextRun[]>) => Record<number, PdfTextRun[]>) => void;
  renderPage: (page: number) => Promise<void>;
  updatePdfTextOverlay: (runId: string, newText: string, format?: any) => void;
}

export const useTextEditHistory = (props: UseTextEditHistoryProps) => {
  const {
    textEditHistory,
    textEditHistoryIndex,
    setTextEditHistory,
    setTextEditHistoryIndex,
    pdfTextRuns,
    pageNum,
    pdfEngineRef,
    file,
    pdfUrl,
    setPdfUrl,
    pdfLibDocRef,
    setPdfTextRuns,
    renderPage,
    updatePdfTextOverlay,
  } = props;

  const undoTextEdit = useCallback(async () => {
    // Use engine undo if available
    if (pdfEngineRef.current) {
      const status = pdfEngineRef.current.getUndoRedoStatus();
      if (!status.canUndo) {
        toast.warning('Nothing to undo');
        return;
      }
      
      const result = await pdfEngineRef.current.undo();
      if (result.success) {
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
          pdfLibDocRef.current = await PDFDocument.load(pdfBytes);
          
          // Update text runs from engine
          const engineRuns = pdfEngineRef.current.getTextRuns(pageNum);
          setPdfTextRuns(prev => ({
            ...prev,
            [pageNum]: engineRuns.map((run: any) => ({
              id: run.id,
              text: run.text,
              x: run.x,
              y: run.y,
              width: run.width,
              height: run.height,
              fontSize: run.fontSize,
              fontName: run.fontName,
              fontWeight: run.fontWeight,
              fontStyle: run.fontStyle,
              color: run.color,
              page: run.page,
              transform: run.transform,
              startIndex: run.startIndex,
              endIndex: run.endIndex,
              textAlign: 'left' as const,
            })),
          }));
          
          // Re-render
          await renderPage(pageNum);
        }
        
        toast.success('Text edit undone');
        return;
      } else {
        toast.error(result.error || 'Failed to undo');
        return;
      }
    }
    
    // Fallback to legacy method
    if (textEditHistoryIndex < 0) {
      toast.info('No text edits to undo');
      return;
    }
    
    const edit = textEditHistory[textEditHistoryIndex];
    const runs = pdfTextRuns[pageNum] || [];
    const run = runs.find(r => r.id === edit.runId);
    
    if (run) {
      updatePdfTextOverlay(edit.runId, edit.oldText, edit.format);
      setTextEditHistoryIndex(prev => prev - 1);
      toast.success('Text edit undone');
    }
  }, [textEditHistory, textEditHistoryIndex, pageNum, pdfTextRuns, file, pdfUrl, pdfEngineRef, setPdfUrl, pdfLibDocRef, setPdfTextRuns, renderPage, updatePdfTextOverlay]);

  const redoTextEdit = useCallback(async () => {
    // Use engine redo if available
    if (pdfEngineRef.current) {
      const status = pdfEngineRef.current.getUndoRedoStatus();
      if (!status.canRedo) {
        toast.warning('Nothing to redo');
        return;
      }
      
      const result = await pdfEngineRef.current.redo();
      if (result.success) {
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
          pdfLibDocRef.current = await PDFDocument.load(pdfBytes);
          
          // Update text runs from engine
          const engineRuns = pdfEngineRef.current.getTextRuns(pageNum);
          setPdfTextRuns(prev => ({
            ...prev,
            [pageNum]: engineRuns.map((run: any) => ({
              id: run.id,
              text: run.text,
              x: run.x,
              y: run.y,
              width: run.width,
              height: run.height,
              fontSize: run.fontSize,
              fontName: run.fontName,
              fontWeight: run.fontWeight,
              fontStyle: run.fontStyle,
              color: run.color,
              page: run.page,
              transform: run.transform,
              startIndex: run.startIndex,
              endIndex: run.endIndex,
              textAlign: 'left' as const,
            })),
          }));
          
          // Re-render
          await renderPage(pageNum);
        }
        
        toast.success('Text edit redone');
        return;
      } else {
        toast.error(result.error || 'Failed to redo');
        return;
      }
    }
    
    // Fallback to legacy method
    if (textEditHistoryIndex >= textEditHistory.length - 1) {
      toast.info('No text edits to redo');
      return;
    }
    
    const nextIndex = textEditHistoryIndex + 1;
    const edit = textEditHistory[nextIndex];
    const runs = pdfTextRuns[pageNum] || [];
    const run = runs.find(r => r.id === edit.runId);
    
    if (run) {
      updatePdfTextOverlay(edit.runId, edit.newText, edit.format);
      setTextEditHistoryIndex(nextIndex);
      toast.success('Text edit redone');
    }
  }, [textEditHistory, textEditHistoryIndex, pageNum, pdfTextRuns, file, pdfUrl, pdfEngineRef, setPdfUrl, pdfLibDocRef, setPdfTextRuns, renderPage, updatePdfTextOverlay]);

  const saveTextEditToHistory = useCallback((runId?: string, oldText?: string, newText?: string, format?: any) => {
    if (runId && oldText !== undefined && newText !== undefined) {
      setTextEditHistory(prev => {
        const newHistory = prev.slice(0, textEditHistoryIndex + 1);
        newHistory.push({ runId, oldText, newText, format });
        return newHistory;
      });
      setTextEditHistoryIndex(prev => prev + 1);
    }
  }, [textEditHistoryIndex, setTextEditHistory, setTextEditHistoryIndex]);

  return {
    undoTextEdit,
    redoTextEdit,
    saveTextEditToHistory,
  };
};



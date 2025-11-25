// PDF Text Update Utilities
import { toast } from '@/components/Toast';
import type { PdfTextRun, Annotation } from '../types';
import { sanitizeTextForPDF } from '../utils';

export interface TextFormat {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  textOutline?: { width: number; color: string };
}

/**
 * Update PDF text using overlay method (fallback)
 */
export const updatePdfTextOverlay = (
  runId: string,
  newText: string,
  run: PdfTextRun,
  pageNum: number,
  annotations: Annotation[],
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  format?: TextFormat,
  setAnnotations?: (annotations: Annotation[]) => void,
  saveToHistory?: (annotations: Annotation[]) => void,
  setTextEditHistory?: (updater: (prev: Array<{ runId: string; oldText: string; newText: string; format?: TextFormat }>) => Array<{ runId: string; oldText: string; newText: string; format?: TextFormat }>) => void,
  textEditHistoryIndex?: number,
  setTextEditHistoryIndex?: (updater: (prev: number) => number) => void
): void => {
  if (!run) return;
  
  // Remove any existing overlay annotations for this text run
  const existingOverlays = annotations.filter(ann => 
    ann.id.startsWith(`pdf-text-edit-${runId}`) || 
    ann.id.startsWith(`pdf-text-cover-${runId}`)
  );
  const filteredAnnotations = annotations.filter(ann => !existingOverlays.includes(ann));
  
  // Calculate text width for new text
  let textWidth = run.width;
  if (canvasRef.current) {
    const context = canvasRef.current.getContext('2d');
    if (context) {
      const fontSize = format?.fontSize || run.fontSize;
      const fontFamily = format?.fontFamily || run.fontName;
      context.font = `${fontSize}px ${fontFamily}`;
      textWidth = Math.max(context.measureText(newText).width, run.width);
    }
  }
  
  // Add white rectangle to cover old text (with padding)
  const padding = 3;
  const whiteRect: Annotation = {
    id: `pdf-text-cover-${runId}-${Date.now()}`,
    type: 'rectangle',
    x: run.x - padding,
    y: run.y - run.height - padding,
    width: Math.max(run.width, textWidth) + (padding * 2),
    height: run.height + (padding * 2),
    fillColor: '#FFFFFF',
    strokeColor: '#FFFFFF',
    page: pageNum,
    zIndex: 1000,
  };
  
  // Add new text annotation with formatting
  const newAnnotation: Annotation = {
    id: `pdf-text-edit-${runId}-${Date.now()}`,
    type: 'text',
    x: run.x,
    y: run.y,
    text: newText,
    fontSize: format?.fontSize || run.fontSize,
    fontFamily: format?.fontFamily || run.fontName,
    fontWeight: format?.fontWeight || run.fontWeight || 'normal',
    fontStyle: format?.fontStyle || run.fontStyle || 'normal',
    textDecoration: format?.textDecoration || run.textDecoration || 'none',
    color: format?.color || run.color || '#000000',
    textAlign: format?.textAlign || run.textAlign || 'left',
    page: pageNum,
    width: textWidth,
    height: format?.fontSize || run.fontSize,
    zIndex: 1001,
  };
  
  const updatedAnnotations = [...filteredAnnotations, whiteRect, newAnnotation];
  setAnnotations?.(updatedAnnotations);
  saveToHistory?.(updatedAnnotations);
  
  // Save to text edit history for undo/redo
  if (setTextEditHistory && setTextEditHistoryIndex && textEditHistoryIndex !== undefined) {
    const oldText = run.text;
    setTextEditHistory(prev => {
      const newHistory = prev.slice(0, textEditHistoryIndex + 1);
      newHistory.push({ runId, oldText, newText, format });
      return newHistory;
    });
    setTextEditHistoryIndex(prev => prev + 1);
  }
  
  toast.success('PDF text updated');
};

/**
 * Update PDF text using engine or rebuild method
 */
export const updatePdfTextInStream = async (
  runId: string,
  newText: string,
  run: PdfTextRun,
  pageNum: number,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pdfEngineRef: React.MutableRefObject<any>,
  pdfLibDocRef: React.MutableRefObject<any>,
  format?: TextFormat,
  rebuildPdfPageWithText?: (pageNumber: number, textModifications: Array<{ runId: string; newText: string; format?: TextFormat }>) => Promise<boolean>,
  renderPage?: (page: number, useCache?: boolean) => Promise<void>,
  setPdfTextRuns?: (updater: (prev: Record<number, PdfTextRun[]>) => Record<number, PdfTextRun[]>) => void,
  saveTextEditToHistory?: (runId: string, oldText: string, newText: string, format?: TextFormat) => void,
  updatePdfTextOverlayFn?: (runId: string, newText: string, format?: TextFormat) => void
): Promise<void> => {
  if (!pdfLibDocRef.current) {
    console.log('[Edit] pdfLibDocRef is null, using overlay mode');
    updatePdfTextOverlayFn?.(runId, newText, format);
    return;
  }
  
  // Sanitize text input
  const sanitizedText = sanitizeTextForPDF(newText);
  if (!sanitizedText.trim()) {
    toast.error('Invalid text content');
    return;
  }
  
  try {
    // Try PdfEngine first (preferred method)
    if (pdfEngineRef.current) {
      console.log('[Edit] Using PdfEngine to modify text:', runId, sanitizedText);
      const result = await pdfEngineRef.current.modifyText(pageNum, [{
        runId,
        newText: sanitizedText,
        format: {
          fontSize: format?.fontSize,
          fontFamily: format?.fontFamily,
          fontWeight: format?.fontWeight,
          fontStyle: format?.fontStyle,
          color: format?.color,
          textAlign: format?.textAlign,
          textDecoration: format?.textDecoration,
        },
      }]);
      
      if (result.success) {
        console.log('[Edit] PdfEngine modifyText succeeded');
        
        // Update the text run in state
        setPdfTextRuns?.(prev => {
          const pageRuns = prev[pageNum] || [];
          const updatedRuns = pageRuns.map(r => {
            if (r.id === runId) {
              return {
                ...r,
                text: sanitizedText,
                fontSize: format?.fontSize || r.fontSize,
                fontName: format?.fontFamily || r.fontName,
                fontWeight: format?.fontWeight || r.fontWeight,
                fontStyle: format?.fontStyle || r.fontStyle,
                color: format?.color || r.color,
              };
            }
            return r;
          });
          return {
            ...prev,
            [pageNum]: updatedRuns,
          };
        });
        
        // Re-render the page
        if (renderPage) {
          requestAnimationFrame(() => {
            renderPage(pageNum, false);
          });
        }
        
        // Save to history
        saveTextEditToHistory?.(runId, run.text, sanitizedText, format);
        
        toast.success('PDF text updated successfully!');
        return;
      } else {
        console.log('[Edit] PdfEngine modifyText failed:', result.error);
        toast.warning('Engine modification failed, trying rebuild method...');
      }
    }
    
    // Fallback: Rebuild PDF page
    if (rebuildPdfPageWithText) {
      console.log('[Edit] Using rebuildPdfPageWithText fallback');
      const success = await rebuildPdfPageWithText(pageNum, [{
        runId,
        newText: sanitizedText,
        format,
      }]);
      
      if (success) {
        // Update the text run in state
        setPdfTextRuns?.(prev => {
          const pageRuns = prev[pageNum] || [];
          const updatedRuns = pageRuns.map(r => {
            if (r.id === runId) {
              return {
                ...r,
                text: sanitizedText,
                fontSize: format?.fontSize || r.fontSize,
                fontName: format?.fontFamily || r.fontName,
                fontWeight: format?.fontWeight || r.fontWeight,
                fontStyle: format?.fontStyle || r.fontStyle,
                color: format?.color || r.color,
              };
            }
            return r;
          });
          return {
            ...prev,
            [pageNum]: updatedRuns,
          };
        });
        
        // Re-render the page
        if (renderPage) {
          await renderPage(pageNum);
        }
        
        // Save to history
        saveTextEditToHistory?.(runId, run.text, sanitizedText, format);
        
        toast.success('PDF text updated successfully!');
      } else {
        // Fallback to overlay mode
        toast.warning('Using overlay mode for text editing');
        updatePdfTextOverlayFn?.(runId, newText, format);
      }
    }
  } catch (error) {
    console.error('Error updating PDF text in stream:', error);
    toast.error('Failed to update PDF text. Using overlay mode.');
    updatePdfTextOverlayFn?.(runId, newText, format);
  }
};


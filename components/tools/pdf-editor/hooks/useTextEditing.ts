// Text Editing Hook
import { useState, useRef, useCallback } from 'react';
import { toast } from '@/components/Toast';
import type { PdfTextRun, PdfTextItem } from '../types';
import { mapTextItemsToRuns, findTextRunAtPosition } from '../utils/textExtraction';

interface UseTextEditingProps {
  pdfDocRef: React.MutableRefObject<any>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  pageNum: number;
}

export const useTextEditing = ({ pdfDocRef, canvasRef, pageNum }: UseTextEditingProps) => {
  const [pdfTextItems, setPdfTextItems] = useState<Record<number, PdfTextItem[]>>({});
  const [pdfTextRuns, setPdfTextRuns] = useState<Record<number, PdfTextRun[]>>({});
  const [selectedTextRun, setSelectedTextRun] = useState<string | null>(null);
  const [editingTextRun, setEditingTextRun] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState<string>('');
  const [textEditMode, setTextEditMode] = useState(false);
  const [textRunsCache, setTextRunsCache] = useState<Record<number, { runs: PdfTextRun[]; timestamp: number }>>({});
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract text layer from PDF
  const extractTextLayer = useCallback(async (pageNumber: number, viewport?: any) => {
    if (!pdfDocRef.current) {
      console.log('[Edit] extractTextLayer: No PDF document');
      return;
    }
    console.log('[Edit] extractTextLayer: Starting for page', pageNumber);

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const textViewport = viewport || page.getViewport({ scale: 1.0 });
      
      const textItems: PdfTextItem[] = [];
      
      textContent.items.forEach((item: any) => {
        if (!item.str || item.str.trim() === '') return;
        
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const pdfX = transform[4];
        const pdfY = transform[5]; // Keep in PDF coordinates (y=0 at bottom)
        
        const fontSize = item.height || (item.transform ? Math.abs(transform[3]) : 12);
        const width = item.width || 0;
        
        textItems.push({
          str: item.str || '',
          x: pdfX,
          y: pdfY,
          width,
          height: fontSize,
          fontName: item.fontName || 'Arial',
          fontSize,
          transform,
          page: pageNumber,
          dir: item.dir || 'ltr',
          hasEOL: item.hasEOL || false,
        });
      });
      
      setPdfTextItems(prev => ({ ...prev, [pageNumber]: textItems }));
      
      // Map text items to text runs
      const textRuns = mapTextItemsToRuns(textItems, pageNumber);
      console.log('[Edit] extractTextLayer: Extracted', textRuns.length, 'text runs for page', pageNumber);
      setPdfTextRuns(prev => ({ ...prev, [pageNumber]: textRuns }));
      
      // Cache text runs
      setTextRunsCache(prev => ({
        ...prev,
        [pageNumber]: { runs: textRuns, timestamp: Date.now() }
      }));
    } catch (error) {
      console.error('Error extracting text layer:', error);
    }
  }, [pdfDocRef]);

  // Find text run at position
  const findTextRunAtPositionLocal = useCallback((x: number, y: number, pageNumber: number): PdfTextRun | null => {
    const runs: PdfTextRun[] = pdfTextRuns[pageNumber] || [];
    console.log('[HOOK] findTextRunAtPosition called:', { x, y, pageNumber, runsCount: runs.length });
    return findTextRunAtPosition(x, y, runs, 150); // 150px tolerance for aggressive detection
  }, [pdfTextRuns]);

  return {
    pdfTextItems,
    pdfTextRuns,
    selectedTextRun,
    editingTextRun,
    editingTextValue,
    textEditMode,
    textRunsCache,
    previewTimeoutRef,
    setPdfTextItems,
    setPdfTextRuns,
    setSelectedTextRun,
    setEditingTextRun,
    setEditingTextValue,
    setTextEditMode,
    extractTextLayer,
    findTextRunAtPosition: findTextRunAtPositionLocal,
  };
};



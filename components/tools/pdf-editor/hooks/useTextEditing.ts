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

  // Extract text layer from PDF - IMPROVED: Better coordinate conversion like Sejda
  const extractTextLayer = useCallback(async (pageNumber: number, viewport?: any) => {
    if (!pdfDocRef.current) {
      console.log('[Edit] extractTextLayer: No PDF document');
      return;
    }

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const textViewport = viewport || page.getViewport({ scale: 1.0 });
      
      const textItems: PdfTextItem[] = [];
      
      // IMPROVED: Extract each text item with proper coordinate conversion
      textContent.items.forEach((item: any) => {
        if (!item.str || item.str.trim() === '') return;
        
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        
        // PDF.js coordinates: transform[4] = x, transform[5] = y (PDF coordinate system, y=0 at bottom)
        // Convert to canvas coordinates (y=0 at top)
        const pdfX = transform[4];
        const pdfY = transform[5];
        
        // Convert PDF Y to canvas Y (flip vertically)
        // PDF: y=0 at bottom, Canvas: y=0 at top
        const canvasY = textViewport.height - pdfY;
        
        // Get font size from transform matrix or item height
        const fontSize = item.height || (transform ? Math.abs(transform[3]) : 12);
        const width = item.width || (item.transform ? Math.abs(transform[0]) * fontSize : 0);
        
        textItems.push({
          str: item.str || '',
          x: pdfX, // X stays the same
          y: canvasY, // Converted to canvas coordinates
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
      
      // IMPROVED: Create individual clickable text items (like Sejda) + grouped runs
      // First, create individual text runs for each item (for better click detection)
      const individualRuns: PdfTextRun[] = textItems.map((item, index) => ({
        id: `item-${pageNumber}-${index}`,
        text: item.str,
        x: item.x,
        y: item.y, // Already in canvas coordinates
        width: item.width || item.fontSize * item.str.length * 0.6, // Estimate if width not available
        height: item.height,
        fontSize: item.fontSize,
        fontName: item.fontName,
        page: pageNumber,
        startIndex: index,
        endIndex: index,
      }));
      
      // Also create grouped runs for better text editing
      const groupedRuns = mapTextItemsToRuns(textItems, pageNumber);
      
      // Combine both: individual items first (for precise clicking), then grouped runs
      const allRuns = [...individualRuns, ...groupedRuns];
      
      console.log('[Edit] extractTextLayer: Extracted', textItems.length, 'text items,', allRuns.length, 'total runs for page', pageNumber);
      setPdfTextRuns(prev => ({ ...prev, [pageNumber]: allRuns }));
      
      // Cache text runs
      setTextRunsCache(prev => ({
        ...prev,
        [pageNumber]: { runs: allRuns, timestamp: Date.now() }
      }));
    } catch (error) {
      console.error('Error extracting text layer:', error);
    }
  }, [pdfDocRef]);

  // Find text run at position - AGGRESSIVE detection
  const findTextRunAtPositionLocal = useCallback((x: number, y: number, pageNumber: number): PdfTextRun | null => {
    const runs: PdfTextRun[] = pdfTextRuns[pageNumber] || [];
    if (runs.length === 0) {
      console.log('[HOOK] No text runs available for page', pageNumber);
      return null;
    }
    return findTextRunAtPosition(x, y, runs, 200); // 200px tolerance for maximum detection
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



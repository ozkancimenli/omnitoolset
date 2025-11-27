import { useCallback, useRef } from 'react';
import { toast } from '@/components/Toast';
import type { ToolType, Annotation, PdfTextRun } from '../types';
import { getCanvasCoordinates as getCanvasCoordinatesUtil } from '../utils/coordinates';

export interface UseCanvasHandlersOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  tool: ToolType;
  pageNum: number;
  isEditable: boolean;
  spacePressed: boolean;
  pdfTextRuns: Record<number, PdfTextRun[]>;
  pdfDocRef: React.RefObject<any>;
  textInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  annotations: Annotation[];
  selectedAnnotation: string | null;
  selectedTextRun: string | null;
  lockedAnnotations: Set<string>;
  selectedAnnotations: Set<string>;
  isDragging: boolean;
  dragOffset: { x: number; y: number } | null;
  isPanning: boolean;
  panStart: { x: number; y: number } | null;
  isSelectingText: boolean;
  textSelectionStart: { x: number; y: number; runId: string; charIndex: number } | null;
  textSelectionEnd: { x: number; y: number; runId: string; charIndex: number } | null;
  isDrawingFreehand: boolean;
  freehandPath: { x: number; y: number }[];
  isDrawingPolygon: boolean;
  polygonPoints: { x: number; y: number }[];
  measureStart: { x: number; y: number } | null;
  drawStart: { x: number; y: number } | null;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  // Setters
  setTool: (tool: ToolType) => void;
  setIsPanning: (panning: boolean) => void;
  setPanStart: (start: { x: number; y: number } | null) => void;
  setTextEditMode: (mode: boolean) => void;
  setEditingTextRun: (id: string | null) => void;
  setEditingTextValue: (value: string) => void;
  setSelectedTextRun: (id: string | null) => void;
  setTextSelectionStart: (start: { x: number; y: number; runId: string; charIndex: number } | null) => void;
  setTextSelectionEnd: (end: { x: number; y: number; runId: string; charIndex: number } | null) => void;
  setEditingCharIndex: (index: number | null) => void;
  setIsSelectingText: (selecting: boolean) => void;
  setSelectedTextRuns: (runs: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  setSelectedAnnotation: (id: string | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setDragOffset: (offset: { x: number; y: number } | null) => void;
  setFreehandPath: (path: { x: number; y: number }[] | ((prev: { x: number; y: number }[]) => { x: number; y: number }[])) => void;
  setIsDrawingFreehand: (drawing: boolean) => void;
  setPolygonPoints: (points: { x: number; y: number }[] | ((prev: { x: number; y: number }[]) => { x: number; y: number }[])) => void;
  setIsDrawingPolygon: (drawing: boolean) => void;
  setMeasureStart: (start: { x: number; y: number } | null) => void;
  setDrawStart: (start: { x: number; y: number } | null) => void;
  setIsDrawing: (drawing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  saveToHistory: (annotations: Annotation[]) => void;
  renderPage: (page: number) => void;
  extractTextLayer: (page: number) => Promise<void>;
  findTextRunAtPosition: (x: number, y: number, page: number) => PdfTextRun | null;
  findCharIndexAtPosition: (x: number, run: PdfTextRun, page: number) => number;
  getSelectedText: (start: { x: number; y: number; runId: string; charIndex: number }, end: { x: number; y: number; runId: string; charIndex: number }, runs: PdfTextRun[]) => string | null;
  viewportRef: React.MutableRefObject<{ width: number; height: number; scale: number } | null>;
  hoveredTextRun: string | null;
  setHoveredTextRun: (id: string | null) => void;
}

export function useCanvasHandlers(options: UseCanvasHandlersOptions) {
  const {
    canvasRef,
    containerRef,
    tool,
    pageNum,
    isEditable,
    spacePressed,
    pdfTextRuns,
    pdfDocRef,
    textInputRef,
    annotations,
    selectedAnnotation,
    selectedTextRun,
    lockedAnnotations,
    selectedAnnotations,
    isDragging,
    dragOffset,
    isPanning,
    panStart,
    isSelectingText,
    textSelectionStart,
    textSelectionEnd,
    isDrawingFreehand,
    freehandPath,
    isDrawingPolygon,
    polygonPoints,
    measureStart,
    drawStart,
    strokeColor,
    fillColor,
    strokeWidth,
    setTool,
    setIsPanning,
    setPanStart,
    setTextEditMode,
    setEditingTextRun,
    setEditingTextValue,
    setSelectedTextRun,
    setTextSelectionStart,
    setTextSelectionEnd,
    setEditingCharIndex,
    setIsSelectingText,
    setSelectedTextRuns,
    setSelectedAnnotation,
    setIsDragging,
    setDragOffset,
    setFreehandPath,
    setIsDrawingFreehand,
    setPolygonPoints,
    setIsDrawingPolygon,
    setMeasureStart,
    setDrawStart,
    setIsDrawing,
    setAnnotations,
    saveToHistory,
    renderPage,
    extractTextLayer,
    findTextRunAtPosition,
    findCharIndexAtPosition,
    getSelectedText,
    viewportRef,
    hoveredTextRun,
    setHoveredTextRun,
  } = options;

  const lastClickTimeRef = useRef<number>(0);
  const lastClickCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const CLICK_DELAY = 300;
  const DOUBLE_CLICK_DISTANCE = 10;

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinatesUtil(e, canvasRef, viewportRef);
    
    // Mouse Pan: Space + drag or Middle mouse button or Right-click drag
    const isPanTrigger = spacePressed || e.button === 1 || (e.button === 2 && e.ctrlKey);
    if (isPanTrigger && !tool) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    
    // AGGRESSIVE TEXT DETECTION: Always try to find text on click, regardless of tool
    // This enables direct text editing by clicking on any text
    const runs: PdfTextRun[] = pdfTextRuns[pageNum] || [];
    
    // If no text runs, try to extract them first
    if (runs.length === 0 && pdfDocRef.current) {
      extractTextLayer(pageNum).then(() => {
        toast.info('Text layer extracted. Click on text to edit.');
      });
      return;
    }
    
    // Try to find text run at click position with aggressive detection
    const clickedRun = findTextRunAtPosition(coords.x, coords.y, pageNum);
    
    if (clickedRun) {
      // DIRECT EDIT MODE - immediately enable editing when text is clicked
      setTool('edit-text');
      setTextEditMode(true);
      setEditingTextRun(clickedRun.id);
      setEditingTextValue(clickedRun.text);
      setSelectedTextRun(clickedRun.id);
      
      // Find character index at click position
      const charIndex = findCharIndexAtPosition(coords.x, clickedRun, pageNum);
      setTextSelectionStart({ x: coords.x, y: coords.y, runId: clickedRun.id, charIndex });
      setTextSelectionEnd({ x: coords.x, y: coords.y, runId: clickedRun.id, charIndex });
      setEditingCharIndex(charIndex);
      setIsSelectingText(true);
      
      // Multi-select with Ctrl/Cmd
      if ((e as any).ctrlKey || (e as any).metaKey) {
        setSelectedTextRuns(prev => new Set([...prev, clickedRun.id]));
      } else {
        setSelectedTextRuns(new Set([clickedRun.id]));
      }
      
      toast.success(`✏️ Editing: "${clickedRun.text.substring(0, 30)}${clickedRun.text.length > 30 ? '...' : ''}"`);
      
      // Focus text input for immediate editing
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          textInputRef.current.select();
        }
      }, 50);
      
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Check if clicking on existing annotation to select/drag
    if (!tool) {
      const pageAnnotations = annotations.filter(ann => ann.page === pageNum && !lockedAnnotations.has(ann.id));
      for (const ann of pageAnnotations) {
        let isInside = false;
        
        if (ann.type === 'text' && ann.text) {
          const fontSize = ann.fontSize || 16;
          const fontFamily = ann.fontFamily || 'Arial';
          if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
              context.font = `${fontSize}px ${fontFamily}`;
              const metrics = context.measureText(ann.text);
              const textWidth = metrics.width;
              const textHeight = fontSize;
              
              let textX = ann.x;
              if (ann.textAlign === 'center') {
                textX = ann.x - textWidth / 2;
              } else if (ann.textAlign === 'right') {
                textX = ann.x - textWidth;
              }
              
              isInside = (
                coords.x >= textX &&
                coords.x <= textX + textWidth &&
                coords.y >= ann.y - textHeight &&
                coords.y <= ann.y
              );
            }
          }
        } else if (ann.width && ann.height) {
          isInside = (
            coords.x >= ann.x &&
            coords.x <= ann.x + ann.width &&
            coords.y >= ann.y &&
            coords.y <= ann.y + ann.height
          );
        }
        
        if (isInside) {
          setSelectedAnnotation(ann.id);
          setIsDragging(true);
          setDragOffset({
            x: coords.x - ann.x,
            y: coords.y - ann.y,
          });
          return;
        }
      }
      setSelectedAnnotation(null);
      return;
    }
    
    if (!isEditable) return;
    
    // Start freehand drawing
    if (tool === 'freehand') {
      setFreehandPath([coords]);
      setIsDrawingFreehand(true);
      setIsDrawing(true);
      return;
    }
    
    // Polygon tool - add point on click
    if (tool === 'polygon' || tool === 'callout') {
      if (!isDrawingPolygon) {
        setPolygonPoints([coords]);
        setIsDrawingPolygon(true);
      } else {
        setPolygonPoints(prev => [...prev, coords]);
      }
      setIsDrawing(true);
      return;
    }
    
    // Measurement tools - set start point
    if (tool === 'ruler' || tool === 'measure') {
      setMeasureStart(coords);
      setDrawStart(coords);
      setIsDrawing(true);
      return;
    }
    
    setDrawStart(coords);
    setIsDrawing(true);
  }, [
    canvasRef,
    viewportRef,
    spacePressed,
    tool,
    pdfTextRuns,
    pageNum,
    pdfDocRef,
    findTextRunAtPosition,
    findCharIndexAtPosition,
    annotations,
    lockedAnnotations,
    isEditable,
    isDrawingPolygon,
    canvasRef,
    textInputRef,
    setTool,
    setIsPanning,
    setPanStart,
    setTextEditMode,
    setEditingTextRun,
    setEditingTextValue,
    setSelectedTextRun,
    setTextSelectionStart,
    setTextSelectionEnd,
    setEditingCharIndex,
    setIsSelectingText,
    setSelectedTextRuns,
    setSelectedAnnotation,
    setIsDragging,
    setDragOffset,
    setFreehandPath,
    setIsDrawingFreehand,
    setPolygonPoints,
    setIsDrawingPolygon,
    setMeasureStart,
    setDrawStart,
    setIsDrawing,
    extractTextLayer,
  ]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Mouse Pan: Handle panning
    if (isPanning && panStart && containerRef.current) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      
      containerRef.current.scrollLeft -= deltaX;
      containerRef.current.scrollTop -= deltaY;
      
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
      return;
    }
    
    // Handle text selection drag
    if (isSelectingText && textSelectionStart && (tool === 'edit-text' || selectedTextRun)) {
      const coords = getCanvasCoordinatesUtil(e, canvasRef, viewportRef);
      const runs = pdfTextRuns[pageNum] || [];
      const currentRun = findTextRunAtPosition(coords.x, coords.y, pageNum);
      
      if (currentRun) {
        const charIndex = findCharIndexAtPosition(coords.x, currentRun, pageNum);
        setTextSelectionEnd({ x: coords.x, y: coords.y, runId: currentRun.id, charIndex });
        
        requestAnimationFrame(() => {
          renderPage(pageNum);
        });
      } else {
        setTextSelectionEnd({ x: coords.x, y: coords.y, runId: textSelectionStart.runId, charIndex: textSelectionStart.charIndex });
      }
    }
    
    const coords = getCanvasCoordinatesUtil(e, canvasRef, viewportRef);
    
    // Handle dragging annotations
    if (isDragging && selectedAnnotation && dragOffset) {
      const newAnnotations = annotations.map(ann => {
        if (ann.id === selectedAnnotation) {
          return {
            ...ann,
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y,
          };
        }
        return ann;
      });
      setAnnotations(newAnnotations);
      return;
    }
    
    // Handle freehand drawing
    if (tool === 'freehand' && isDrawingFreehand) {
      setFreehandPath(prev => [...prev, coords]);
      if (canvasRef.current && pdfDocRef.current) {
        renderPage(pageNum);
        const context = canvasRef.current.getContext('2d');
        if (context && freehandPath.length > 0) {
          context.strokeStyle = strokeColor;
          context.lineWidth = strokeWidth;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.beginPath();
          context.moveTo(freehandPath[0].x, freehandPath[0].y);
          for (let i = 1; i < freehandPath.length; i++) {
            context.lineTo(freehandPath[i].x, freehandPath[i].y);
          }
          context.lineTo(coords.x, coords.y);
          context.stroke();
        }
      }
      return;
    }
    
    // Polygon preview
    if ((tool === 'polygon' || tool === 'callout') && isDrawingPolygon && polygonPoints.length > 0) {
      if (canvasRef.current) {
        renderPage(pageNum);
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.strokeStyle = strokeColor;
          context.fillStyle = fillColor;
          context.lineWidth = strokeWidth;
          context.beginPath();
          context.moveTo(polygonPoints[0].x, polygonPoints[0].y);
          for (let i = 1; i < polygonPoints.length; i++) {
            context.lineTo(polygonPoints[i].x, polygonPoints[i].y);
          }
          context.lineTo(coords.x, coords.y);
          if (tool === 'polygon') {
            context.closePath();
            context.fill();
          }
          context.stroke();
        }
      }
      return;
    }
    
    // Measurement preview
    if ((tool === 'ruler' || tool === 'measure') && measureStart) {
      if (canvasRef.current) {
        renderPage(pageNum);
        const context = canvasRef.current.getContext('2d');
        if (context) {
          context.strokeStyle = tool === 'ruler' ? '#000000' : '#3b82f6';
          context.lineWidth = 2;
          context.setLineDash([5, 5]);
          context.beginPath();
          context.moveTo(measureStart.x, measureStart.y);
          if (tool === 'ruler') {
            context.lineTo(coords.x, measureStart.y);
          } else {
            context.lineTo(coords.x, coords.y);
          }
          context.stroke();
          context.setLineDash([]);
        }
      }
      return;
    }

    if (
      !isSelectingText &&
      !isDragging &&
      !isDrawingFreehand &&
      !(isDrawingPolygon && (tool === 'polygon' || tool === 'callout')) &&
      tool !== 'freehand'
    ) {
      const hoverCandidate = findTextRunAtPosition(coords.x, coords.y, pageNum);
      if (hoverCandidate) {
        if (hoveredTextRun !== hoverCandidate.id) {
          setHoveredTextRun(hoverCandidate.id);
        }
      } else if (hoveredTextRun) {
        setHoveredTextRun(null);
      }
    }
  }, [
    isPanning,
    panStart,
    containerRef,
    isSelectingText,
    textSelectionStart,
    tool,
    selectedTextRun,
    pdfTextRuns,
    pageNum,
    isDragging,
    selectedAnnotation,
    dragOffset,
    annotations,
    isDrawingFreehand,
    freehandPath,
    isDrawingPolygon,
    polygonPoints,
    measureStart,
    canvasRef,
    pdfDocRef,
    strokeColor,
    fillColor,
    strokeWidth,
    findTextRunAtPosition,
    findCharIndexAtPosition,
    setPanStart,
    setTextSelectionEnd,
    setAnnotations,
    setFreehandPath,
    renderPage,
    isDragging,
    hoveredTextRun,
    setHoveredTextRun,
  ]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Mouse Pan: End panning
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      e.preventDefault();
      return;
    }
    
    // End text selection - auto-copy selected text
    if (isSelectingText && textSelectionStart && textSelectionEnd) {
      const runs = pdfTextRuns[pageNum] || [];
      const selectedText = getSelectedText(textSelectionStart, textSelectionEnd, runs);
      
      if (selectedText && selectedText.trim().length > 0) {
        if (e.ctrlKey || e.metaKey || true) {
          navigator.clipboard.writeText(selectedText).then(() => {
            toast.success(`Copied ${selectedText.length} characters to clipboard`);
          }).catch(err => {
            console.error('Failed to copy text:', err);
            toast.error('Failed to copy text');
          });
        }
      }
      
      setIsSelectingText(false);
      return;
    }
    
    if (isSelectingText) {
      setIsSelectingText(false);
      return;
    }
    
    // Handle drag end
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(null);
      if (selectedAnnotation) {
        saveToHistory(annotations);
        toast.info('Annotation moved');
      }
      return;
    }
    
    if (!drawStart || !tool || !isEditable) {
      setIsDrawing(false);
      setDrawStart(null);
      return;
    }
    
    const coords = getCanvasCoordinatesUtil(e, canvasRef, viewportRef);
    
    // Handle drawing completion based on tool
    // This is a simplified version - full implementation would handle all tools
    setIsDrawing(false);
    setDrawStart(null);
  }, [
    isPanning,
    isSelectingText,
    textSelectionStart,
    textSelectionEnd,
    isDragging,
    selectedAnnotation,
    drawStart,
    tool,
    isEditable,
    pdfTextRuns,
    pageNum,
    annotations,
    getSelectedText,
    setIsPanning,
    setPanStart,
    setIsSelectingText,
    setIsDragging,
    setDragOffset,
    setIsDrawing,
    setDrawStart,
    saveToHistory,
  ]);

  const handleCanvasMouseLeave = useCallback(() => {
    setHoveredTextRun(null);
  }, [setHoveredTextRun]);

  return {
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasMouseLeave,
  };
}

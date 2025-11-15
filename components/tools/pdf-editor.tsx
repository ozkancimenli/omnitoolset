'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from '@/components/Toast';

interface PdfEditorProps {
  toolId?: string;
}

type ToolType = 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'link' | 'note' | 'freehand' | 'eraser' | null;
type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

interface Annotation {
  id: string;
  type: 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'link' | 'note' | 'freehand';
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string; // Font family (Arial, Times, Helvetica, Courier)
  textAlign?: 'left' | 'center' | 'right'; // Text alignment
  color?: string;
  strokeColor?: string;
  fillColor?: string;
  page: number;
  width?: number;
  height?: number;
  imageData?: string;
  endX?: number;
  endY?: number;
  url?: string; // For link annotations
  comment?: string; // For sticky notes
  isEditing?: boolean; // For inline text editing
  freehandPath?: { x: number; y: number }[]; // For freehand drawing
  zIndex?: number; // Layer order
}

export default function PdfEditor({ toolId }: PdfEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentText, setCurrentText] = useState('');
  const [fontSize, setFontSize] = useState(16);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [strokeColor, setStrokeColor] = useState('#FF0000');
  const [fillColor, setFillColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [tool, setTool] = useState<ToolType>(null);
  const [isEditable, setIsEditable] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [freehandPath, setFreehandPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);
  const pdfLibDocRef = useRef<PDFDocument | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Undo/Redo system
  const saveToHistory = useCallback((newAnnotations: Annotation[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations([...history[newIndex]]);
      toast.info('Undone');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations([...history[newIndex]]);
      toast.info('Redone');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please select a valid PDF file.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size is too large. Please select a PDF file smaller than 50MB.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setFile(selectedFile);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
      setPageNum(1);
      setIsEditable(true);
      setZoom(1);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/pdf' && !droppedFile.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Please drop a valid PDF file.');
        return;
      }
      if (droppedFile.size > 50 * 1024 * 1024) {
        toast.error('File size is too large. Please select a PDF file smaller than 50MB.');
        return;
      }
      setFile(droppedFile);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
      setPageNum(1);
      setIsEditable(true);
      setZoom(1);
    }
  };

  useEffect(() => {
    if (file) {
      loadPDF();
    }
  }, [file]);

  const loadPDF = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      try {
        const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
        if (!response.ok) throw new Error('Worker not found');
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBufferForViewing = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBufferForViewing,
        useSystemFonts: true,
        verbosity: 0
      }).promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);

      // Generate thumbnails
      const thumbnails: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ 
            canvasContext: context, 
            viewport,
            canvas: canvas 
          } as any).promise;
          thumbnails.push(canvas.toDataURL());
        }
      }
      setPageThumbnails(thumbnails);
      
      const arrayBufferForEditing = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBufferForEditing);
      
      try {
        const pdfLibDoc = await PDFDocument.load(fileBytes, {
          ignoreEncryption: false,
          updateMetadata: false,
        });
        pdfLibDocRef.current = pdfLibDoc;
      } catch (pdfLibError) {
        console.warn('PDF-lib loading failed:', pdfLibError);
        try {
          const retryBuffer = await file.arrayBuffer();
          const retryBytes = new Uint8Array(retryBuffer);
          const pdfLibDoc = await PDFDocument.load(retryBytes, {
            ignoreEncryption: true,
            updateMetadata: false,
          });
          pdfLibDocRef.current = pdfLibDoc;
        } catch {
          pdfLibDocRef.current = null;
          setIsEditable(false);
        }
      }
      
      setIsEditable(pdfLibDocRef.current !== null);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      await renderPage(1);
      toast.success('PDF loaded successfully!');
    } catch (error) {
      console.error('Error loading PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error loading PDF: ${errorMessage}`);
      setFile(null);
      setPdfUrl(null);
      pdfDocRef.current = null;
      pdfLibDocRef.current = null;
      setIsEditable(true);
      setAnnotations([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPage = async (pageNumber: number, scale: number = 2.0 * zoom) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ 
        canvasContext: context, 
        viewport,
        canvas: canvas 
      } as any).promise;
      
      // Draw annotations
      const pageAnnotations = annotations.filter(ann => ann.page === pageNumber);
      pageAnnotations.forEach(ann => {
        context.save();
        
        if (ann.type === 'text' && ann.text) {
          context.fillStyle = ann.color || '#000000';
          const fontFamily = ann.fontFamily || 'Arial';
          const fontSize = ann.fontSize || 16;
          context.font = `${fontSize}px ${fontFamily}`;
          context.textAlign = (ann.textAlign || 'left') as CanvasTextAlign;
          context.textBaseline = 'bottom';
          
          // Calculate text position based on alignment
          let textX = ann.x;
          if (ann.textAlign === 'center') {
            const metrics = context.measureText(ann.text);
            textX = ann.x - metrics.width / 2;
          } else if (ann.textAlign === 'right') {
            const metrics = context.measureText(ann.text);
            textX = ann.x - metrics.width;
          }
          
          context.fillText(ann.text, textX, ann.y);
        } else if (ann.type === 'highlight' && ann.width && ann.height) {
          const rgbColor = hexToRgb(ann.color || highlightColor);
          context.fillStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.3)`;
          context.fillRect(ann.x, ann.y, ann.width, ann.height);
        } else if (ann.type === 'image' && ann.imageData && ann.width && ann.height) {
          const img = new Image();
          img.src = ann.imageData;
          img.onload = () => {
            context.drawImage(img, ann.x, ann.y, ann.width!, ann.height!);
          };
        } else if (ann.type === 'rectangle' && ann.width && ann.height) {
          context.strokeStyle = ann.strokeColor || strokeColor;
          context.fillStyle = ann.fillColor || 'transparent';
          context.lineWidth = strokeWidth;
          context.fillRect(ann.x, ann.y, ann.width, ann.height);
          context.strokeRect(ann.x, ann.y, ann.width, ann.height);
        } else if (ann.type === 'circle' && ann.width && ann.height) {
          context.strokeStyle = ann.strokeColor || strokeColor;
          context.fillStyle = ann.fillColor || 'transparent';
          context.lineWidth = strokeWidth;
          const centerX = ann.x + ann.width / 2;
          const centerY = ann.y + ann.height / 2;
          const radius = Math.min(ann.width, ann.height) / 2;
          context.beginPath();
          context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          context.fill();
          context.stroke();
        } else if (ann.type === 'line' && ann.endX !== undefined && ann.endY !== undefined) {
          context.strokeStyle = ann.strokeColor || strokeColor;
          context.lineWidth = strokeWidth;
          context.beginPath();
          context.moveTo(ann.x, ann.y);
          context.lineTo(ann.endX, ann.endY);
          context.stroke();
        } else if (ann.type === 'arrow' && ann.endX !== undefined && ann.endY !== undefined) {
          context.strokeStyle = ann.strokeColor || strokeColor;
          context.fillStyle = ann.strokeColor || strokeColor;
          context.lineWidth = strokeWidth;
          const dx = ann.endX - ann.x;
          const dy = ann.endY - ann.y;
          const angle = Math.atan2(dy, dx);
          const arrowLength = 15;
          const arrowAngle = Math.PI / 6;
          
          context.beginPath();
          context.moveTo(ann.x, ann.y);
          context.lineTo(ann.endX, ann.endY);
          context.lineTo(
            ann.endX - arrowLength * Math.cos(angle - arrowAngle),
            ann.endY - arrowLength * Math.sin(angle - arrowAngle)
          );
          context.moveTo(ann.endX, ann.endY);
          context.lineTo(
            ann.endX - arrowLength * Math.cos(angle + arrowAngle),
            ann.endY - arrowLength * Math.sin(angle + arrowAngle)
          );
          context.stroke();
          context.fill();
        } else if (ann.type === 'link' && ann.width && ann.height) {
          // Draw link annotation
          context.strokeStyle = ann.strokeColor || '#0066cc';
          context.fillStyle = 'rgba(0, 102, 204, 0.1)';
          context.lineWidth = 2;
          context.setLineDash([5, 5]);
          context.fillRect(ann.x, ann.y, ann.width, ann.height);
          context.strokeRect(ann.x, ann.y, ann.width, ann.height);
          context.setLineDash([]);
          // Draw link icon
          if (ann.url) {
            context.fillStyle = '#0066cc';
            context.font = '12px Arial';
            context.fillText('🔗', ann.x + 5, ann.y + 15);
          }
        } else if (ann.type === 'note' && ann.width && ann.height) {
          // Draw sticky note
          context.fillStyle = ann.fillColor || '#FFFF99';
          context.strokeStyle = ann.strokeColor || '#FFD700';
          context.lineWidth = 2;
          context.fillRect(ann.x, ann.y, ann.width, ann.height);
          context.strokeRect(ann.x, ann.y, ann.width, ann.height);
          // Draw comment text
          if (ann.comment) {
            context.fillStyle = '#000000';
            context.font = '12px Arial';
            context.textAlign = 'left';
            const lines = ann.comment.split('\n');
            lines.forEach((line, i) => {
              context.fillText(line.substring(0, 20), ann.x + 5, ann.y + 15 + i * 15);
            });
          }
        } else if (ann.type === 'freehand' && ann.freehandPath && ann.freehandPath.length > 0) {
          // Draw freehand path
          context.strokeStyle = ann.strokeColor || strokeColor;
          context.lineWidth = strokeWidth;
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.beginPath();
          context.moveTo(ann.freehandPath[0].x, ann.freehandPath[0].y);
          for (let i = 1; i < ann.freehandPath.length; i++) {
            context.lineTo(ann.freehandPath[i].x, ann.freehandPath[i].y);
          }
          context.stroke();
        }
        
        // Selection highlight
        if (selectedAnnotation === ann.id) {
          context.strokeStyle = '#3b82f6';
          context.lineWidth = 2;
          context.setLineDash([5, 5]);
          if (ann.width && ann.height) {
            context.strokeRect(ann.x - 2, ann.y - 2, ann.width + 4, ann.height + 4);
          }
          context.setLineDash([]);
        }
        
        context.restore();
      });
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  useEffect(() => {
    if (pdfDocRef.current && pageNum > 0) {
      renderPage(pageNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, annotations, zoom, selectedAnnotation]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    
    // Check if double-clicking on text annotation to edit
    if (e.detail === 2) {
      const pageAnnotations = annotations.filter(ann => ann.page === pageNum);
      for (const ann of pageAnnotations) {
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
              
              // Check if click is within text bounds
              let textX = ann.x;
              if (ann.textAlign === 'center') {
                textX = ann.x - textWidth / 2;
              } else if (ann.textAlign === 'right') {
                textX = ann.x - textWidth;
              }
              
              if (
                coords.x >= textX &&
                coords.x <= textX + textWidth &&
                coords.y >= ann.y - textHeight &&
                coords.y <= ann.y
              ) {
                setEditingAnnotation(ann.id);
                setEditingText(ann.text);
                setSelectedAnnotation(ann.id);
                setTool(null);
                return;
              }
            }
          }
        }
      }
    }
    
    // Check if clicking on existing annotation to select/drag
    if (!tool) {
      const pageAnnotations = annotations.filter(ann => ann.page === pageNum);
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
    
    setDrawStart(coords);
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    
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
      setFreehandPath([...freehandPath, coords]);
      // Redraw canvas with current path
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
    
    if (!isDrawing || !drawStart || !tool) return;
    
    // Preview drawing (optional - can be implemented for better UX)
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    
    if (!isDrawing || !drawStart || !tool || !isEditable) {
      setIsDrawing(false);
      setDrawStart(null);
      return;
    }
    
    const coords = getCanvasCoordinates(e);
    const newAnnotations = [...annotations];
    
    if (tool === 'text' && currentText.trim()) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        x: coords.x,
        y: coords.y,
        text: currentText,
        fontSize,
        fontFamily,
        textAlign,
        color: textColor,
        page: pageNum,
      };
      newAnnotations.push(newAnnotation);
      setCurrentText('');
      setTool(null);
      toast.success('Text added');
    } else if (tool === 'highlight') {
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 5 && height > 5) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'highlight',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          color: highlightColor,
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Highlight added');
      }
    } else if (tool === 'rectangle') {
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 5 && height > 5) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'rectangle',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          strokeColor,
          fillColor,
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Rectangle added');
      }
    } else if (tool === 'circle') {
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 5 && height > 5) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'circle',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          strokeColor,
          fillColor,
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Circle added');
      }
    } else if (tool === 'line' || tool === 'arrow') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: tool,
        x: drawStart.x,
        y: drawStart.y,
        endX: coords.x,
        endY: coords.y,
        strokeColor,
        page: pageNum,
      };
      newAnnotations.push(newAnnotation);
      toast.success(`${tool === 'arrow' ? 'Arrow' : 'Line'} added`);
    } else if (tool === 'link') {
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 10 && height > 10) {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          const newAnnotation: Annotation = {
            id: Date.now().toString(),
            type: 'link',
            x: Math.min(drawStart.x, coords.x),
            y: Math.min(drawStart.y, coords.y),
            width,
            height,
            url,
            strokeColor: '#0066cc',
            page: pageNum,
          };
          newAnnotations.push(newAnnotation);
          toast.success('Link added');
        }
      }
    } else if (tool === 'note') {
      const comment = prompt('Enter comment:', '');
      if (comment) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'note',
          x: coords.x,
          y: coords.y,
          width: 150,
          height: 100,
          comment,
          fillColor: '#FFFF99',
          strokeColor: '#FFD700',
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Sticky note added');
      }
    } else if (tool === 'freehand' && freehandPath.length > 0) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'freehand',
        x: Math.min(...freehandPath.map(p => p.x)),
        y: Math.min(...freehandPath.map(p => p.y)),
        width: Math.max(...freehandPath.map(p => p.x)) - Math.min(...freehandPath.map(p => p.x)),
        height: Math.max(...freehandPath.map(p => p.y)) - Math.min(...freehandPath.map(p => p.y)),
        freehandPath: [...freehandPath],
        strokeColor,
        page: pageNum,
      };
      newAnnotations.push(newAnnotation);
      setFreehandPath([]);
      toast.success('Freehand drawing added');
    } else if (tool === 'eraser') {
      // Eraser: Remove annotations that intersect with the eraser area
      const eraserSize = 20;
      const erased = newAnnotations.filter(ann => {
        if (ann.page !== pageNum) return true;
        // Check if annotation intersects with eraser circle
        const centerX = coords.x;
        const centerY = coords.y;
        if (ann.width && ann.height) {
          const annCenterX = ann.x + ann.width / 2;
          const annCenterY = ann.y + ann.height / 2;
          const distance = Math.sqrt(
            Math.pow(centerX - annCenterX, 2) + Math.pow(centerY - annCenterY, 2)
          );
          return distance > eraserSize + Math.max(ann.width, ann.height) / 2;
        }
        return true;
      });
      if (erased.length < newAnnotations.length) {
        setAnnotations(erased);
        saveToHistory(erased);
        toast.success('Annotation erased');
        setIsDrawing(false);
        setDrawStart(null);
        setTool(null);
        return;
      }
    }
    
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    setIsDrawing(false);
    setDrawStart(null);
    setFreehandPath([]);
    setIsDrawingFreehand(false);
    setTool(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const newAnnotation: Annotation = {
            id: Date.now().toString(),
            type: 'image',
            x: canvas.width / 2 - 50,
            y: canvas.height / 2 - 50,
            width: 100,
            height: 100,
            imageData,
            page: pageNum,
          };
          const newAnnotations = [...annotations, newAnnotation];
          setAnnotations(newAnnotations);
          saveToHistory(newAnnotations);
          toast.success('Image added');
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDownload = async () => {
    if (!file) {
      toast.error('Please load a PDF file first.');
      return;
    }

    if (!pdfLibDocRef.current) {
      toast.error('This PDF cannot be edited. You can only view it.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = pdfLibDocRef.current;
      const pages = pdfDoc.getPages();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const annotation of annotations) {
        if (annotation.page > 0 && annotation.page <= pages.length) {
          const page = pages[annotation.page - 1];
          const { width, height } = page.getSize();

          if (annotation.type === 'text' && annotation.text) {
            const fontSize = annotation.fontSize || 16;
            const color = annotation.color || '#000000';
            const rgbColor = hexToRgb(color);
            const fontFamily = annotation.fontFamily || 'Arial';
            
            // Use appropriate font based on selection
            let font = helveticaFont;
            if (fontFamily === 'Times New Roman') {
              font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            } else if (fontFamily === 'Courier New') {
              font = await pdfDoc.embedFont(StandardFonts.Courier);
            } else {
              font = helveticaFont; // Default to Helvetica for Arial, Helvetica, etc.
            }
            
            // Calculate text position based on alignment
            let textX = annotation.x;
            if (annotation.textAlign === 'center' || annotation.textAlign === 'right') {
              const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);
              if (annotation.textAlign === 'center') {
                textX = annotation.x - textWidth / 2;
              } else if (annotation.textAlign === 'right') {
                textX = annotation.x - textWidth;
              }
            }
            
            page.drawText(annotation.text, {
              x: textX,
              y: height - annotation.y - fontSize,
              size: fontSize,
              font: font,
              color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
            });
          } else if (annotation.type === 'highlight' && annotation.width && annotation.height) {
            const rgbColor = hexToRgb(annotation.color || highlightColor);
            page.drawRectangle({
              x: annotation.x,
              y: height - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
              opacity: 0.3,
            });
          } else if (annotation.type === 'image' && annotation.imageData && annotation.width && annotation.height) {
            try {
              const imageBytes = await fetch(annotation.imageData).then(res => res.arrayBuffer());
              let image;
              if (annotation.imageData.startsWith('data:image/png')) {
                image = await pdfDoc.embedPng(imageBytes);
              } else {
                image = await pdfDoc.embedJpg(imageBytes);
              }
              page.drawImage(image, {
                x: annotation.x,
                y: height - annotation.y - annotation.height,
                width: annotation.width,
                height: annotation.height,
              });
            } catch (error) {
              console.error('Error embedding image:', error);
            }
          } else if (annotation.type === 'rectangle' && annotation.width && annotation.height) {
            const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
            page.drawRectangle({
              x: annotation.x,
              y: height - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              borderColor: rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255),
              borderWidth: strokeWidth,
            });
          } else if (annotation.type === 'circle' && annotation.width && annotation.height) {
            const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
            const centerX = annotation.x + annotation.width / 2;
            const centerY = height - (annotation.y + annotation.height / 2);
            const radius = Math.min(annotation.width, annotation.height) / 2;
            // Draw circle using path
            const strokeColorRgb = rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255);
            page.drawCircle({
              x: centerX,
              y: centerY,
              size: radius,
              borderColor: strokeColorRgb,
              borderWidth: strokeWidth,
            });
          } else if (annotation.type === 'line' && annotation.endX !== undefined && annotation.endY !== undefined) {
            const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
            const strokeColorRgb = rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255);
            // Draw line using path
            const startY = height - annotation.y;
            const endY = height - annotation.endY;
            page.drawLine({
              start: { x: annotation.x, y: startY },
              end: { x: annotation.endX, y: endY },
              thickness: strokeWidth,
              color: strokeColorRgb,
            });
          } else if (annotation.type === 'arrow' && annotation.endX !== undefined && annotation.endY !== undefined) {
            const strokeRgb = hexToRgb(annotation.strokeColor || strokeColor);
            const strokeColorRgb = rgb(strokeRgb.r / 255, strokeRgb.g / 255, strokeRgb.b / 255);
            // Draw arrow line
            const startY = height - annotation.y;
            const endY = height - annotation.endY;
            page.drawLine({
              start: { x: annotation.x, y: startY },
              end: { x: annotation.endX, y: endY },
              thickness: strokeWidth,
              color: strokeColorRgb,
            });
            // Arrow head - simplified triangle
            const dx = annotation.endX - annotation.x;
            const dy = annotation.endY - annotation.y;
            const angle = Math.atan2(dy, dx);
            const arrowSize = 10;
            const arrowX1 = annotation.endX - arrowSize * Math.cos(angle - Math.PI / 6);
            const arrowY1 = height - (annotation.endY - arrowSize * Math.sin(angle - Math.PI / 6));
            const arrowX2 = annotation.endX - arrowSize * Math.cos(angle + Math.PI / 6);
            const arrowY2 = height - (annotation.endY - arrowSize * Math.sin(angle + Math.PI / 6));
            page.drawLine({
              start: { x: annotation.endX, y: endY },
              end: { x: arrowX1, y: arrowY1 },
              thickness: strokeWidth,
              color: strokeColorRgb,
            });
            page.drawLine({
              start: { x: annotation.endX, y: endY },
              end: { x: arrowX2, y: arrowY2 },
              thickness: strokeWidth,
              color: strokeColorRgb,
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_edited.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error creating edited PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const removeAnnotation = (id: string) => {
    const newAnnotations = annotations.filter(ann => ann.id !== id);
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    setSelectedAnnotation(null);
    toast.success('Annotation removed');
  };

  const clearAllAnnotations = () => {
    if (confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([]);
      saveToHistory([]);
      toast.success('All annotations cleared');
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden" style={{ height: '100%', minHeight: '800px' }}>
      {/* File Upload - Premium Design */}
      {!file && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="w-full max-w-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-16 text-center bg-gradient-to-br from-gray-50/50 via-white to-gray-50/50 dark:from-gray-950/20 dark:via-slate-900 dark:to-gray-950/20 hover:border-gray-500 dark:hover:border-gray-500 hover:shadow-2xl hover:shadow-gray-500/20 transition-all duration-300 cursor-pointer group"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="text-center">
              <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📄</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Upload Your PDF Document
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-2">
                Drag and drop your PDF file here, or click to browse
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Supported: PDF files up to 50MB
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900/30 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium">
                <span>✨</span>
                <span>100% Free • No Registration • Secure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-100 dark:bg-slate-900" style={{ height: '100%', minHeight: '800px' }}>
          {!isEditable && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-l-4 border-yellow-500 rounded-r-xl p-3 shadow-lg max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-yellow-900 dark:text-yellow-200 text-xs font-semibold">
                    View-Only Mode - This PDF cannot be edited
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Editor Layout - iLovePDF Style */}
          <div className="flex-1 flex relative overflow-hidden" style={{ height: '100%', minHeight: '600px' }}>
            {/* Sidebar - Overlay Style (iLovePDF) */}
            {showThumbnails && (
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-2xl z-40 transform transition-transform duration-300">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📑</span>
                      <span>Pages</span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {numPages}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2 overflow-y-auto h-full">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPageNum(page)}
                      className={`w-full group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        page === pageNum
                          ? 'border-gray-500 bg-gray-50 dark:bg-gray-950/50 shadow-lg shadow-gray-500/20 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-slate-800 hover:shadow-md'
                      }`}
                    >
                      {page === pageNum && (
                        <div className="absolute top-2 right-2 z-10 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          Active
                        </div>
                      )}
                      <div className="p-2">
                        {pageThumbnails[page - 1] ? (
                          <img
                            src={pageThumbnails[page - 1]}
                            alt={`Page ${page}`}
                            className="w-full h-auto rounded-lg shadow-sm"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-slate-400 dark:text-slate-500 font-medium">Page {page}</span>
                          </div>
                        )}
                        <p className={`text-xs mt-2 text-center font-medium ${page === pageNum ? 'text-gray-900 dark:text-gray-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          Page {page}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Editor Area - iLovePDF Style Full Screen */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 w-full" style={{ height: '100%', minHeight: '600px' }}>
              {/* Compact Toolbar - iLovePDF Style */}
              <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0">
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: History & Tools */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Undo/Redo - Icon Buttons */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Undo (Ctrl+Z)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Redo (Ctrl+Y)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Tools - Icon Grid */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => setTool(tool === 'text' ? null : 'text')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'text'
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Add Text (T)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'highlight' ? null : 'highlight')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'highlight'
                              ? 'bg-yellow-500 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Highlight (H)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setTool(tool === 'image' ? null : 'image');
                            imageInputRef.current?.click();
                          }}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'image'
                              ? 'bg-green-600 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Add Image (I)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'rectangle' ? null : 'rectangle')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'rectangle'
                              ? 'bg-gray-700 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Rectangle (R)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'circle' ? null : 'circle')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'circle'
                              ? 'bg-gray-600 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Circle (C)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'line' ? null : 'line')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'line'
                              ? 'bg-pink-600 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Line (L)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'arrow' ? null : 'arrow')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'arrow'
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Arrow (A)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Advanced Tools */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => setTool(tool === 'link' ? null : 'link')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'link'
                              ? 'bg-gray-700 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Add Link (L)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'note' ? null : 'note')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'note'
                              ? 'bg-yellow-500 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Sticky Note (N)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'freehand' ? null : 'freehand')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'freehand'
                              ? 'bg-gray-600 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Freehand Draw (F)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'eraser' ? null : 'eraser')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'eraser'
                              ? 'bg-gray-600 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Eraser (E)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      {/* Tool Options Panel */}
                      {tool && (
                        <div className="flex items-center gap-2 ml-2 px-3 py-2 bg-gray-50 dark:bg-gray-950/30 rounded-lg border border-gray-200 dark:border-gray-800">
                          {tool === 'text' && (
                            <>
                              <input
                                type="text"
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                placeholder="Enter text..."
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm w-40"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && currentText.trim()) {
                                    setTool(null);
                                  }
                                }}
                              />
                              <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                title="Font Family"
                              >
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Courier New">Courier</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Verdana">Verdana</option>
                              </select>
                              <input
                                type="number"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                min="8"
                                max="72"
                                className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                title="Font Size"
                              />
                              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-1">
                                <button
                                  onClick={() => setTextAlign('left')}
                                  className={`px-2 py-1 rounded text-sm transition-all ${
                                    textAlign === 'left'
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                                  title="Align Left"
                                >
                                  ⬅
                                </button>
                                <button
                                  onClick={() => setTextAlign('center')}
                                  className={`px-2 py-1 rounded text-sm transition-all ${
                                    textAlign === 'center'
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                                  title="Align Center"
                                >
                                  ⬌
                                </button>
                                <button
                                  onClick={() => setTextAlign('right')}
                                  className={`px-2 py-1 rounded text-sm transition-all ${
                                    textAlign === 'right'
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                                  title="Align Right"
                                >
                                  ➡
                                </button>
                              </div>
                              <input
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                                title="Text Color"
                              />
                            </>
                          )}
                          {(tool === 'highlight' || tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'arrow') && (
                            <>
                              <input
                                type="color"
                                value={tool === 'highlight' ? highlightColor : strokeColor}
                                onChange={(e) => {
                                  if (tool === 'highlight') setHighlightColor(e.target.value);
                                  else setStrokeColor(e.target.value);
                                }}
                                className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                                title="Color"
                              />
                              {tool !== 'highlight' && (
                                <input
                                  type="number"
                                  value={strokeWidth}
                                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                                  min="1"
                                  max="10"
                                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                                  title="Stroke Width"
                                />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: View Controls */}
                    <div className="flex items-center gap-2">
                      {/* Zoom Controls */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 transition-all text-slate-700 dark:text-slate-300"
                          title="Zoom Out"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                          </svg>
                        </button>
                        <span className="text-slate-700 dark:text-slate-300 text-sm min-w-[50px] text-center font-semibold px-2">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 transition-all text-slate-700 dark:text-slate-300"
                          title="Zoom In"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setZoom(1)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all"
                          title="Fit to Page"
                        >
                          Fit
                        </button>
                      </div>

                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Page Navigation */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                          disabled={pageNum <= 1}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Previous Page"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-slate-700 dark:text-slate-300 text-sm min-w-[70px] text-center font-semibold px-2">
                          {pageNum} / {numPages}
                        </span>
                        <button
                          onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
                          disabled={pageNum >= numPages}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Next Page"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Toggle Sidebar */}
                      <button
                        onClick={() => setShowThumbnails(!showThumbnails)}
                        className={`p-2 rounded-md transition-all ${
                          showThumbnails
                            ? 'bg-gray-900 text-white shadow-lg'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                        title="Toggle Pages Panel"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Canvas - iLovePDF Style Full Screen */}
              <div
                ref={containerRef}
                className="flex-1 bg-slate-200 dark:bg-slate-950 overflow-auto flex justify-center items-center p-4 relative"
                style={{ minHeight: '400px', height: '100%' }}
              >
                <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm relative">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    className="block"
                    style={{ cursor: tool ? 'crosshair' : selectedAnnotation ? 'move' : 'default' }}
                  />
                  
                  {/* Inline Text Editor */}
                  {editingAnnotation && (() => {
                    const ann = annotations.find(a => a.id === editingAnnotation);
                    if (!ann || ann.type !== 'text' || ann.page !== pageNum) return null;
                    
                    const fontSize = ann.fontSize || 16;
                    const fontFamily = ann.fontFamily || 'Arial';
                    const canvas = canvasRef.current;
                    if (!canvas) return null;
                    
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    
                    // Calculate text position
                    let textX = ann.x / scaleX;
                    let textY = ann.y / scaleY;
                    
                    return (
                      <input
                        ref={textInputRef}
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => {
                          if (editingAnnotation) {
                            const newAnnotations = annotations.map(a => {
                              if (a.id === editingAnnotation) {
                                return { ...a, text: editingText };
                              }
                              return a;
                            });
                            setAnnotations(newAnnotations);
                            saveToHistory(newAnnotations);
                            setEditingAnnotation(null);
                            toast.success('Text updated');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          } else if (e.key === 'Escape') {
                            setEditingAnnotation(null);
                            setEditingText('');
                          }
                        }}
                        style={{
                          position: 'absolute',
                          left: `${rect.left + textX}px`,
                          top: `${rect.top + textY - fontSize}px`,
                          fontSize: `${fontSize}px`,
                          fontFamily: fontFamily,
                          color: ann.color || '#000000',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid #111827',
                          outline: 'none',
                          padding: '2px 4px',
                          minWidth: '100px',
                          borderRadius: '4px',
                        }}
                        className="text-editor-input"
                        autoFocus
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Annotations Panel - Compact Bottom Bar */}
              {annotations.filter(ann => ann.page === pageNum).length > 0 && (
                <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 dark:text-gray-400">📝</span>
                      <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                        Page {pageNum}: {annotations.filter(ann => ann.page === pageNum).length} annotations
                      </h3>
                    </div>
                    <button
                      onClick={clearAllAnnotations}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                    {annotations
                      .filter(ann => ann.page === pageNum)
                      .map((ann) => (
                        <div
                          key={ann.id}
                          className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all cursor-pointer border flex-shrink-0 ${
                            selectedAnnotation === ann.id
                              ? 'bg-gray-50 dark:bg-gray-950/50 border-gray-500'
                              : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
                          }`}
                          onClick={() => setSelectedAnnotation(ann.id === selectedAnnotation ? null : ann.id)}
                        >
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            ann.type === 'text' ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300' :
                            ann.type === 'highlight' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                            ann.type === 'image' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                            'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}>
                            {ann.type}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 text-xs">
                            {ann.text || ann.type}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAnnotation(ann.id);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs transition-colors p-0.5"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Download Button - Compact Bottom Bar */}
              <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg flex-shrink-0 flex justify-center">
                <button
                  onClick={handleDownload}
                  disabled={isProcessing || annotations.length === 0}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && !file && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-gray-900 dark:border-t-gray-400 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Loading PDF...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we process your document</p>
          </div>
        </div>
      )}
    </div>
  );
}

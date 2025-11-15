'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from '@/components/Toast';

interface PdfEditorProps {
  toolId?: string;
}

type ToolType = 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | null;
type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

interface Annotation {
  id: string;
  type: 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  color?: string;
  strokeColor?: string;
  fillColor?: string;
  page: number;
  width?: number;
  height?: number;
  imageData?: string;
  endX?: number;
  endY?: number;
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
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
          context.font = `${ann.fontSize || 16}px Arial`;
          context.fillText(ann.text, ann.x, ann.y);
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
    if (!tool || !isEditable) return;
    
    const coords = getCanvasCoordinates(e);
    setDrawStart(coords);
    setIsDrawing(true);
    
    // Check if clicking on existing annotation
    const pageAnnotations = annotations.filter(ann => ann.page === pageNum);
    for (const ann of pageAnnotations) {
      if (ann.x <= coords.x && coords.x <= (ann.x + (ann.width || 0)) &&
          ann.y <= coords.y && coords.y <= (ann.y + (ann.height || 0))) {
        setSelectedAnnotation(ann.id);
        return;
      }
    }
    setSelectedAnnotation(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || !tool) return;
    
    const coords = getCanvasCoordinates(e);
    // Preview drawing (optional - can be implemented for better UX)
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    }
    
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    setIsDrawing(false);
    setDrawStart(null);
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
            page.drawText(annotation.text, {
              x: annotation.x,
              y: height - annotation.y - fontSize,
              size: fontSize,
              font: helveticaFont,
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
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* File Upload - Premium Design */}
      {!file && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className="w-full max-w-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl p-16 text-center bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer group"
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
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Upload Your PDF Document
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-2">
                Drag and drop your PDF file here, or click to browse
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Supported: PDF files up to 50MB
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                <span>✨</span>
                <span>100% Free • No Registration • Secure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
          {!isEditable && (
            <div className="mx-6 mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-l-4 border-yellow-500 rounded-r-xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-900 dark:text-yellow-200 text-sm font-semibold mb-1">
                    View-Only Mode
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs">
                    This PDF cannot be edited (may be password-protected). You can view it, but editing features are disabled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Editor Layout - Professional Design */}
          <div className="flex-1 flex gap-0 overflow-hidden">
            {/* Sidebar - Modern Page Thumbnails */}
            {showThumbnails && (
              <div className="w-64 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400">📑</span>
                      <span>Pages</span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {numPages}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPageNum(page)}
                      className={`w-full group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        page === pageNum
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-800 hover:shadow-md'
                      }`}
                    >
                      {page === pageNum && (
                        <div className="absolute top-2 right-2 z-10 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
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
                        <p className={`text-xs mt-2 text-center font-medium ${page === pageNum ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          Page {page}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Editor Area - Professional Design */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
              {/* Premium Toolbar */}
              <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="px-4 py-3">
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
                              ? 'bg-indigo-600 text-white shadow-lg'
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
                              ? 'bg-blue-600 text-white shadow-lg'
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
                              ? 'bg-purple-600 text-white shadow-lg'
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

                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />

                      {/* Tool Options Panel */}
                      {tool && (
                        <div className="flex items-center gap-2 ml-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          {tool === 'text' && (
                            <>
                              <input
                                type="text"
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                placeholder="Enter text..."
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-40"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && currentText.trim()) {
                                    setTool(null);
                                  }
                                }}
                              />
                              <input
                                type="number"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                min="8"
                                max="72"
                                className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                title="Font Size"
                              />
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
                                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                            ? 'bg-indigo-600 text-white shadow-lg'
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

              {/* PDF Canvas - Premium Design */}
              <div
                ref={containerRef}
                className="flex-1 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 overflow-auto flex justify-center items-start"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-slate-900/10">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    className="rounded-lg shadow-xl"
                    style={{ cursor: tool ? 'crosshair' : selectedAnnotation ? 'move' : 'default' }}
                  />
                </div>
              </div>

              {/* Annotations Panel - Modern Design */}
              {annotations.filter(ann => ann.page === pageNum).length > 0 && (
                <div className="px-6 py-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 text-lg">📝</span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Annotations on Page {pageNum}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full font-medium">
                        {annotations.filter(ann => ann.page === pageNum).length}
                      </span>
                    </div>
                    <button
                      onClick={clearAllAnnotations}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors font-semibold px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {annotations
                      .filter(ann => ann.page === pageNum)
                      .map((ann) => (
                        <div
                          key={ann.id}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer border ${
                            selectedAnnotation === ann.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-md'
                              : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
                          }`}
                          onClick={() => setSelectedAnnotation(ann.id === selectedAnnotation ? null : ann.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                              ann.type === 'text' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' :
                              ann.type === 'highlight' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                              ann.type === 'image' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                              'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                            }`}>
                              {ann.type}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                              {ann.text || `${ann.type.charAt(0).toUpperCase() + ann.type.slice(1)} annotation`}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAnnotation(ann.id);
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                            title="Delete annotation"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Download Button - Premium Design */}
              <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="flex justify-center">
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || annotations.length === 0}
                    className="group relative px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download Edited PDF</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isProcessing && !file && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Loading PDF...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we process your document</p>
          </div>
        </div>
      )}
    </div>
  );
}

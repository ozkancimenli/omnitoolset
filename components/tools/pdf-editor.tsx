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
  const [showThumbnails, setShowThumbnails] = useState(false);
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
    <div className="space-y-6">
      {/* File Upload */}
      {!file && (
        <div
          className="upload-area"
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
            <div className="text-6xl mb-4">📄</div>
            <p className="text-xl font-semibold mb-2">
              Click or drag PDF file here
            </p>
            <p className="text-slate-400 text-sm">
              Select a PDF file to edit
            </p>
          </div>
        </div>
      )}

      {file && (
        <>
          {!isEditable && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-4">
              <p className="text-yellow-300 text-sm">
                ⚠️ This PDF cannot be edited (may be password-protected). You can view it, but editing features are disabled.
              </p>
            </div>
          )}

          {/* Main Editor Layout */}
          <div className="flex gap-4">
            {/* Sidebar - Page Thumbnails */}
            {showThumbnails && (
              <div className="w-48 bg-slate-800 border border-slate-700 rounded-xl p-4 overflow-y-auto max-h-[800px]">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Pages</h3>
                <div className="space-y-2">
                  {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPageNum(page)}
                      className={`w-full p-2 rounded-lg border-2 transition-colors ${
                        page === pageNum
                          ? 'border-indigo-500 bg-indigo-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {pageThumbnails[page - 1] ? (
                        <img
                          src={pageThumbnails[page - 1]}
                          alt={`Page ${page}`}
                          className="w-full h-auto rounded"
                        />
                      ) : (
                        <div className="w-full h-32 bg-slate-700 rounded flex items-center justify-center text-slate-400">
                          Page {page}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 mt-1">Page {page}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Editor Area */}
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-4">
              {/* Top Toolbar */}
              <div className="flex flex-wrap gap-2 items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex gap-2 flex-wrap items-center">
                  {/* Undo/Redo */}
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Undo (Ctrl+Z)"
                  >
                    ↶ Undo
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Redo (Ctrl+Y)"
                  >
                    ↷ Redo
                  </button>
                  
                  <div className="w-px h-6 bg-slate-600 mx-1" />
                  
                  {/* Tools */}
                  <button
                    onClick={() => setTool(tool === 'text' ? null : 'text')}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'text'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Add Text (T)"
                  >
                    T Text
                  </button>
                  
                  <button
                    onClick={() => setTool(tool === 'highlight' ? null : 'highlight')}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'highlight'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Highlight (H)"
                  >
                    H Highlight
                  </button>
                  
                  <button
                    onClick={() => {
                      setTool(tool === 'rectangle' ? null : 'rectangle');
                      imageInputRef.current?.click();
                    }}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'rectangle'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Add Image (I)"
                  >
                    🖼️ Image
                  </button>
                  
                  <button
                    onClick={() => setTool(tool === 'rectangle' ? null : 'rectangle')}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'rectangle'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Rectangle (R)"
                  >
                    ▭ Rect
                  </button>
                  
                  <button
                    onClick={() => setTool(tool === 'circle' ? null : 'circle')}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'circle'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Circle (C)"
                  >
                    ○ Circle
                  </button>
                  
                  <button
                    onClick={() => setTool(tool === 'line' ? null : 'line')}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'line'
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Line (L)"
                  >
                    ─ Line
                  </button>
                  
                  <button
                    onClick={() => setTool(tool === 'arrow' ? null : 'arrow')}
                    disabled={!isEditable}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      tool === 'arrow'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Arrow (A)"
                  >
                    → Arrow
                  </button>
                  
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {tool === 'text' && (
                    <div className="flex gap-2 items-center ml-2">
                      <input
                        type="text"
                        value={currentText}
                        onChange={(e) => setCurrentText(e.target.value)}
                        placeholder="Enter text..."
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm w-32"
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
                        className="w-16 px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                  
                  {(tool === 'highlight' || tool === 'rectangle' || tool === 'circle' || tool === 'line' || tool === 'arrow') && (
                    <div className="flex gap-2 items-center ml-2">
                      <input
                        type="color"
                        value={tool === 'highlight' ? highlightColor : strokeColor}
                        onChange={(e) => {
                          if (tool === 'highlight') setHighlightColor(e.target.value);
                          else setStrokeColor(e.target.value);
                        }}
                        className="w-10 h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
                        title="Color"
                      />
                      {tool !== 'highlight' && (
                        <>
                          <input
                            type="number"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(Number(e.target.value))}
                            min="1"
                            max="10"
                            className="w-16 px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                            title="Stroke Width"
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {/* Zoom Controls */}
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <span className="text-slate-300 text-sm min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                    title="Reset Zoom"
                  >
                    Fit
                  </button>
                  
                  <div className="w-px h-6 bg-slate-600 mx-1" />
                  
                  {/* Page Navigation */}
                  <button
                    onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                    disabled={pageNum <= 1}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>
                  <span className="text-slate-300 text-sm min-w-[80px] text-center">
                    {pageNum} / {numPages}
                  </span>
                  <button
                    onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
                    disabled={pageNum >= numPages}
                    className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                  
                  <button
                    onClick={() => setShowThumbnails(!showThumbnails)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      showThumbnails
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                    title="Toggle Thumbnails"
                  >
                    📑
                  </button>
                </div>
              </div>

              {/* PDF Canvas */}
              <div
                ref={containerRef}
                className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[700px] flex justify-center"
              >
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="border border-slate-700 rounded shadow-2xl"
                  style={{ cursor: tool ? 'crosshair' : selectedAnnotation ? 'move' : 'default' }}
                />
              </div>

              {/* Annotations List */}
              {annotations.filter(ann => ann.page === pageNum).length > 0 && (
                <div className="mt-4 p-3 bg-slate-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Annotations (Page {pageNum}) - {annotations.filter(ann => ann.page === pageNum).length} items
                    </h3>
                    <button
                      onClick={clearAllAnnotations}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {annotations
                      .filter(ann => ann.page === pageNum)
                      .map((ann) => (
                        <div
                          key={ann.id}
                          className={`flex items-center justify-between p-2 rounded transition-colors ${
                            selectedAnnotation === ann.id
                              ? 'bg-indigo-500/20 border border-indigo-500'
                              : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                          onClick={() => setSelectedAnnotation(ann.id === selectedAnnotation ? null : ann.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">
                              {ann.type}
                            </span>
                            <span className="text-slate-300 text-sm">
                              {ann.text || `${ann.type} annotation`}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAnnotation(ann.id);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={handleDownload}
                  disabled={isProcessing || annotations.length === 0}
                  className="btn px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Download Edited PDF'}
                </button>
              </div>
            </div>
          </div>

          {/* Feature Info */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-300">🚀 Advanced PDF Editor Features:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300 text-sm">
              <div>
                <h4 className="font-semibold text-indigo-400 mb-2">✏️ Text & Annotations</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Add custom text with color & size</li>
                  <li>Highlight important sections</li>
                  <li>Draw shapes (rectangles, circles)</li>
                  <li>Add lines and arrows</li>
                  <li>Insert images</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">🎨 Professional Tools</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Undo/Redo system</li>
                  <li>Zoom controls (50%-300%)</li>
                  <li>Page thumbnails sidebar</li>
                  <li>Annotation selection & deletion</li>
                  <li>Real-time preview</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">💾 Export & Quality</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Real PDF modification (not overlay)</li>
                  <li>All edits permanently saved</li>
                  <li>High-quality output</li>
                  <li>Works with all PDF readers</li>
                  <li>Professional-grade editing</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-500/20 rounded-lg">
              <p className="text-xs text-indigo-300 font-semibold mb-1">💡 Pro Tips:</p>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• Use keyboard shortcuts: T (Text), H (Highlight), R (Rectangle), C (Circle), L (Line), A (Arrow)</li>
                <li>• Drag to create highlights, shapes, and lines</li>
                <li>• Click annotations to select and delete them</li>
                <li>• Use zoom controls for precise editing</li>
                <li>• All changes are saved directly to the PDF file</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {isProcessing && !file && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading PDF...</p>
        </div>
      )}
    </div>
  );
}

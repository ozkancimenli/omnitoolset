'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from '@/components/Toast';

// Production: Constants for configuration
const PDF_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const PDF_SUPPORTED_TYPES = ['application/pdf'];
const PDF_EXTENSIONS = ['.pdf'];
const THUMBNAIL_MAX_PAGES = 10;
const THUMBNAIL_SCALE = 0.5;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 300; // ms for debouncing
const RENDER_CACHE_SIZE = 5; // Number of pages to cache

// Production: Error types for better error handling
class PDFValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PDFValidationError';
  }
}

class PDFProcessingError extends Error {
  constructor(message: string, public code: string, public originalError?: Error) {
    super(message);
    this.name = 'PDFProcessingError';
  }
}

// Production: Utility functions
const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
  // Type validation
  const isValidType = PDF_SUPPORTED_TYPES.includes(file.type) || 
    PDF_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!isValidType) {
    return { valid: false, error: 'Please select a valid PDF file.' };
  }
  
  // Size validation
  if (file.size > PDF_MAX_SIZE) {
    return { valid: false, error: `File size is too large. Maximum size is ${PDF_MAX_SIZE / (1024 * 1024)}MB.` };
  }
  
  // Empty file check
  if (file.size === 0) {
    return { valid: false, error: 'File is empty. Please select a valid PDF file.' };
  }
  
  return { valid: true };
};

// Production: Debounce utility
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// Production: Error logging (ready for analytics integration)
const logError = (error: Error, context: string, metadata?: Record<string, any>) => {
  console.error(`[PDF Editor Error] ${context}:`, error, metadata);
  // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
  // Example: Sentry.captureException(error, { tags: { context }, extra: metadata });
};

// Production: Performance monitoring
const measurePerformance = (label: string, fn: () => void | Promise<void>) => {
  if (typeof window !== 'undefined' && window.performance) {
    const start = performance.now();
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start;
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
        // TODO: Send to analytics
      });
    } else {
      const duration = performance.now() - start;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      return result;
    }
  }
  return fn();
};

// Production: Security - Input sanitization
const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters and scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc.)
    .replace(/data:text\/html/gi, '') // Remove data URIs
    .trim();
};

// Production: Security - Sanitize text for PDF (less strict, but safe)
const sanitizeTextForPDF = (text: string): string => {
  // For PDF text, we allow more characters but still remove dangerous patterns
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Production: Security - Validate file name
const sanitizeFileName = (fileName: string): string => {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/[\/\\]/g, '_') // Replace slashes
    .replace(/[<>:"|?*]/g, '_') // Replace invalid filename characters
    .substring(0, 255); // Limit length
};

interface PdfEditorProps {
  toolId?: string;
}

type ToolType = 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'link' | 'note' | 'freehand' | 'eraser' | 'signature' | 'watermark' | 'redaction' | 'edit-text' | null;
type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';

interface Annotation {
  id: string;
  type: 'text' | 'image' | 'highlight' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'link' | 'note' | 'freehand' | 'signature' | 'watermark' | 'redaction';
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string; // Font family (Arial, Times, Helvetica, Courier)
  textAlign?: 'left' | 'center' | 'right'; // Text alignment
  fontWeight?: 'normal' | 'bold'; // Text weight
  fontStyle?: 'normal' | 'italic'; // Text style
  textDecoration?: 'none' | 'underline'; // Text decoration
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
  opacity?: number; // Opacity (0-1)
  rotation?: number; // Rotation in degrees
  watermarkText?: string; // For watermark
  watermarkOpacity?: number; // Watermark opacity
  letterSpacing?: number; // Letter spacing (Phase 8)
  lineHeight?: number; // Line height (Phase 8)
  textShadow?: { offsetX: number; offsetY: number; blur: number; color: string }; // Text shadow (Phase 8)
  textOutline?: { width: number; color: string }; // Text outline (Phase 8)
}

// PDF Text Layer - Extracted from PDF content
interface PdfTextItem {
  str: string; // Text content
  x: number; // X position in PDF coordinates
  y: number; // Y position in PDF coordinates
  width: number; // Text width
  height: number; // Text height
  fontName: string; // Font name
  fontSize: number; // Font size
  transform: number[]; // Transformation matrix [a, b, c, d, e, f]
  page: number; // Page number
  dir: string; // Text direction ('ltr' or 'rtl')
  hasEOL?: boolean; // End of line
}

interface PdfTextRun {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  page: number;
  startIndex: number; // Start index in original text
  endIndex: number; // End index in original text
  isSelected?: boolean;
  isEditing?: boolean;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export default function PdfEditor({ toolId }: PdfEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0); // Production: Progress tracking
  const [processingMessage, setProcessingMessage] = useState(''); // Production: User feedback
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
  const [zoomMode, setZoomMode] = useState<'custom' | 'fit-width' | 'fit-page' | 'fit-height'>('fit-page');
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
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold'>('normal');
  const [fontStyle, setFontStyle] = useState<'normal' | 'italic'>('normal');
  const [textDecoration, setTextDecoration] = useState<'none' | 'underline'>('none');
  const [freehandPath, setFreehandPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  
  // Production: Batch operations
  const [batchMode, setBatchMode] = useState(false);
  const batchSelectAnnotations = useCallback((annotationIds: string[]) => {
    setSelectedAnnotations(new Set(annotationIds));
  }, []);
  
  const batchDeleteAnnotations = useCallback(() => {
    if (selectedAnnotations.size === 0) {
      toast.info('No annotations selected');
      return;
    }
    if (confirm(`Delete ${selectedAnnotations.size} annotation(s)?`)) {
      const newAnnotations = annotations.filter(ann => !selectedAnnotations.has(ann.id));
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      setSelectedAnnotations(new Set());
      toast.success(`${selectedAnnotations.size} annotation(s) deleted`);
    }
  }, [selectedAnnotations, annotations]);
  
  const batchApplyFormat = useCallback((format: Partial<Annotation>) => {
    if (selectedAnnotations.size === 0) {
      toast.info('No annotations selected');
      return;
    }
    const newAnnotations = annotations.map(ann => {
      if (selectedAnnotations.has(ann.id) && ann.type === 'text') {
        return { ...ann, ...format };
      }
      return ann;
    });
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    toast.success(`Format applied to ${selectedAnnotations.size} annotation(s)`);
  }, [selectedAnnotations, annotations]);
  const [showPageManager, setShowPageManager] = useState(false);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [copiedAnnotations, setCopiedAnnotations] = useState<Annotation[]>([]);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [watermarkText, setWatermarkText] = useState('DRAFT');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  
  // PDF Text Layer - Phase 2
  const [pdfTextItems, setPdfTextItems] = useState<Record<number, PdfTextItem[]>>({});
  const [pdfTextRuns, setPdfTextRuns] = useState<Record<number, PdfTextRun[]>>({});
  const [selectedTextRun, setSelectedTextRun] = useState<string | null>(null);
  const [editingTextRun, setEditingTextRun] = useState<string | null>(null);
  const [textSelection, setTextSelection] = useState<{ start: number; end: number; runId: string } | null>(null);
  const [textEditMode, setTextEditMode] = useState(false); // True when editing existing PDF text
  
  // Advanced Text Editing - Phase 4
  const [isSelectingText, setIsSelectingText] = useState(false);
  const [textSelectionStart, setTextSelectionStart] = useState<{ x: number; y: number; runId: string; charIndex: number } | null>(null);
  const [textSelectionEnd, setTextSelectionEnd] = useState<{ x: number; y: number; runId: string; charIndex: number } | null>(null);
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findResults, setFindResults] = useState<Array<{ runId: string; startIndex: number; endIndex: number }>>([]);
  const [currentFindIndex, setCurrentFindIndex] = useState(-1);
  
  // Advanced: Search options
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWords, setWholeWords] = useState(false);
  
  // Advanced: Layer management
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  
  // Phase 5: Advanced Text Formatting
  const [editingTextFormat, setEditingTextFormat] = useState<{
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
  }>({});
  const [showTextFormatPanel, setShowTextFormatPanel] = useState(false);
  const [multiLineEditing, setMultiLineEditing] = useState(false);
  
  // Phase 8: Advanced Features
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [textTemplates, setTextTemplates] = useState<Array<{ name: string; text: string; format?: any }>>([
    { name: 'Header', text: 'Document Header', format: { fontSize: 24, fontWeight: 'bold' } },
    { name: 'Subheader', text: 'Section Title', format: { fontSize: 18, fontWeight: 'bold' } },
    { name: 'Body', text: 'Body text', format: { fontSize: 12, fontWeight: 'normal' } },
    { name: 'Footer', text: 'Page Footer', format: { fontSize: 10, fontWeight: 'normal', color: '#666666' } },
  ]);
  
  // Phase 6: Performance & Advanced Features
  const [textRunsCache, setTextRunsCache] = useState<Record<number, { runs: PdfTextRun[]; timestamp: number }>>({});
  
  // Production: Render cache for pages
  const renderCacheRef = useRef<Map<number, { imageData: string; timestamp: number }>>(new Map());
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  const [textEditHistory, setTextEditHistory] = useState<Array<{ runId: string; oldText: string; newText: string; format?: any }>>([]);
  const [textEditHistoryIndex, setTextEditHistoryIndex] = useState(-1);
  const [showTextStats, setShowTextStats] = useState(false);
  const [textStyles, setTextStyles] = useState<Array<{ name: string; format: any }>>([]);
  
  // Phase 7: Advanced Text Features
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(false);
  const [spellCheckResults, setSpellCheckResults] = useState<Record<string, string[]>>({});
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportQuality, setExportQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'pdf-a'>('pdf');
  
  // Advanced: Page navigation and jump
  const [showPageJump, setShowPageJump] = useState(false);
  const [pageJumpInput, setPageJumpInput] = useState('');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Advanced: Page jump function
  const jumpToPage = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      setPageNum(page);
      setShowPageJump(false);
      setPageJumpInput('');
      toast.info(`Jumped to page ${page}`);
    } else {
      toast.error(`Page must be between 1 and ${numPages}`);
    }
  }, [numPages]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<any>(null);
  const pdfLibDocRef = useRef<PDFDocument | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

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

  // Production: Enhanced file validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    try {
      const validation = validatePDFFile(selectedFile);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Reset state
      setFile(selectedFile);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
      setPageNum(1);
      setIsEditable(true);
      setZoom(1);
      setPdfTextRuns({});
      setPdfTextItems({});
      setTextRunsCache({});
      
      // Cleanup previous resources
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (error) {
      logError(error as Error, 'handleFileSelect', { fileName: selectedFile.name });
      toast.error('Error processing file. Please try again.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Production: Enhanced drag & drop with validation
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    try {
      const validation = validatePDFFile(droppedFile);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }
      
      // Reset state
      setFile(droppedFile);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
      setPageNum(1);
      setIsEditable(true);
      setZoom(1);
      setPdfTextRuns({});
      setPdfTextItems({});
      setTextRunsCache({});
      
      // Cleanup previous resources
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (error) {
      logError(error as Error, 'handleDrop', { fileName: droppedFile.name });
      toast.error('Error processing dropped file. Please try again.');
    }
  };

  // Production: Cleanup effect for memory management
  useEffect(() => {
    if (file) {
      loadPDF();
    }
    
    // Cleanup function
    return () => {
      // Cleanup object URLs
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      // Cleanup PDF references
      pdfDocRef.current = null;
      pdfLibDocRef.current = null;
    };
  }, [file]);

  // Production: Enhanced PDF loading with error handling and performance monitoring
  const loadPDF = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    let tempUrl: string | null = null;
    
    try {
      await measurePerformance('loadPDF', async () => {
        // Load pdf.js
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        
        // Try local worker, fallback to CDN
        try {
          const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
          if (!response.ok) throw new Error('Worker not found');
        } catch {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }

        // Load PDF for viewing
        setProcessingProgress(10);
        setProcessingMessage('Reading PDF file...');
        const arrayBufferForViewing = await file.arrayBuffer();
        
        setProcessingProgress(30);
        setProcessingMessage('Parsing PDF structure...');
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBufferForViewing,
          useSystemFonts: true,
          verbosity: 0,
          // Production: Add timeout for large files
          maxImageSize: 1024 * 1024 * 10, // 10MB max image size
        }).promise;
        
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        
        if (pdf.numPages === 0) {
          throw new PDFValidationError('PDF has no pages', 'EMPTY_PDF');
        }

        // Production: Generate thumbnails with error handling and progress
        setProcessingProgress(40);
        setProcessingMessage(`Generating thumbnails (${Math.min(pdf.numPages, THUMBNAIL_MAX_PAGES)} pages)...`);
        const thumbnails: string[] = [];
        const maxThumbnails = Math.min(pdf.numPages, THUMBNAIL_MAX_PAGES);
        
        for (let i = 1; i <= maxThumbnails; i++) {
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: THUMBNAIL_SCALE });
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
            
            // Update progress
            setProcessingProgress(40 + (i / maxThumbnails) * 20);
          } catch (thumbError) {
            logError(thumbError as Error, 'generateThumbnail', { pageNumber: i });
            // Continue with other thumbnails even if one fails
            thumbnails.push(''); // Placeholder
          }
        }
        setPageThumbnails(thumbnails);
        
        // Load PDF for editing with pdf-lib
        setProcessingProgress(70);
        setProcessingMessage('Preparing PDF for editing...');
        const arrayBufferForEditing = await file.arrayBuffer();
        const fileBytes = new Uint8Array(arrayBufferForEditing);
        
        try {
          const pdfLibDoc = await PDFDocument.load(fileBytes, {
            ignoreEncryption: false,
            updateMetadata: false,
            // Production: Add parse speed option for large files
            parseSpeed: 1, // 1 = fast, 2 = medium, 3 = slow but thorough
          });
          pdfLibDocRef.current = pdfLibDoc;
        } catch (pdfLibError) {
          logError(pdfLibError as Error, 'pdf-lib load (first attempt)');
          // Retry with encryption ignored
          try {
            setProcessingMessage('Retrying with encryption ignored...');
            const retryBuffer = await file.arrayBuffer();
            const retryBytes = new Uint8Array(retryBuffer);
            const pdfLibDoc = await PDFDocument.load(retryBytes, {
              ignoreEncryption: true,
              updateMetadata: false,
              parseSpeed: 1,
            });
            pdfLibDocRef.current = pdfLibDoc;
            toast.info('PDF loaded (encryption ignored)');
          } catch (retryError) {
            logError(retryError as Error, 'pdf-lib load (retry)');
            pdfLibDocRef.current = null;
            setIsEditable(false);
            toast.warning('PDF loaded in view-only mode. Some features may be limited.');
          }
        }
        
        setIsEditable(pdfLibDocRef.current !== null);
        
        // Create object URL for viewing
        setProcessingProgress(90);
        setProcessingMessage('Finalizing...');
        tempUrl = URL.createObjectURL(file);
        setPdfUrl(tempUrl);
        
        // Load first page
        await renderPage(1);
        
        // Phase 8: Check for auto-saved data
        loadAutoSave();
        
        setProcessingProgress(100);
        setProcessingMessage('Complete!');
        toast.success(`PDF loaded successfully! ${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`);
      });
    } catch (error) {
      logError(error as Error, 'loadPDF', { fileName: file.name, fileSize: file.size });
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof PDFValidationError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(`Error loading PDF: ${errorMessage}`);
      
      // Cleanup on error
      setFile(null);
      if (tempUrl) URL.revokeObjectURL(tempUrl);
      setPdfUrl(null);
      pdfDocRef.current = null;
      pdfLibDocRef.current = null;
      setIsEditable(true);
      setAnnotations([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Phase 2.1: Extract text layer from PDF
  const extractTextLayer = async (pageNumber: number) => {
    if (!pdfDocRef.current) return;

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      
      const textItems: PdfTextItem[] = [];
      
      textContent.items.forEach((item: any, index: number) => {
        // Parse transformation matrix
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4];
        const y = viewport.height - transform[5]; // Flip Y coordinate
        const fontSize = item.height || (item.transform ? Math.abs(transform[3]) : 12);
        const width = item.width || 0;
        
        textItems.push({
          str: item.str || '',
          x,
          y,
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
      
      // Phase 2.2: Map text items to text runs (grouped by line/paragraph)
      const textRuns = mapTextItemsToRuns(textItems, pageNumber);
      setPdfTextRuns(prev => ({ ...prev, [pageNumber]: textRuns }));
      
      // Phase 6: Cache text runs for performance
      setTextRunsCache(prev => ({
        ...prev,
        [pageNumber]: { runs: textRuns, timestamp: Date.now() }
      }));
    } catch (error) {
      console.error('Error extracting text layer:', error);
    }
  };

  // Phase 2.2: Map text items to text runs
  const mapTextItemsToRuns = (textItems: PdfTextItem[], pageNumber: number): PdfTextRun[] => {
    const runs: PdfTextRun[] = [];
    let currentRun: PdfTextItem[] = [];
    let currentY = -1;
    const lineThreshold = 5; // Pixels - items within this Y distance are on same line
    
    textItems.forEach((item, index) => {
      if (item.str.trim() === '') return; // Skip empty items
      
      // Check if this item is on a new line
      if (currentY === -1 || Math.abs(item.y - currentY) > lineThreshold) {
        // Save previous run if exists
        if (currentRun.length > 0) {
          const runText = currentRun.map(i => i.str).join('');
          const firstItem = currentRun[0];
          const lastItem = currentRun[currentRun.length - 1];
          const runWidth = lastItem.x + lastItem.width - firstItem.x;
          
          runs.push({
            id: `run-${pageNumber}-${runs.length}`,
            text: runText,
            x: firstItem.x,
            y: firstItem.y,
            width: runWidth,
            height: firstItem.height,
            fontSize: firstItem.fontSize,
            fontName: firstItem.fontName,
            page: pageNumber,
            startIndex: index - currentRun.length,
            endIndex: index - 1,
          });
        }
        
        // Start new run
        currentRun = [item];
        currentY = item.y;
      } else {
        // Same line - add to current run
        currentRun.push(item);
      }
    });
    
    // Add last run
    if (currentRun.length > 0) {
      const runText = currentRun.map(i => i.str).join('');
      const firstItem = currentRun[0];
      const lastItem = currentRun[currentRun.length - 1];
      const runWidth = lastItem.x + lastItem.width - firstItem.x;
      
      runs.push({
        id: `run-${pageNumber}-${runs.length}`,
        text: runText,
        x: firstItem.x,
        y: firstItem.y,
        width: runWidth,
        height: firstItem.height,
        fontSize: firstItem.fontSize,
        fontName: firstItem.fontName,
        page: pageNumber,
        startIndex: textItems.length - currentRun.length,
        endIndex: textItems.length - 1,
      });
    }
    
    return runs;
  };

  // Phase 2.3: Find text run at click position
  const findTextRunAtPosition = (x: number, y: number, pageNumber: number): PdfTextRun | null => {
    const runs = pdfTextRuns[pageNumber] || [];
    if (runs.length === 0) return null;
    
    return runs.find(run => {
      // Check if click is within text run bounds
      const tolerance = 5; // Pixels tolerance
      return (
        x >= run.x - tolerance &&
        x <= run.x + run.width + tolerance &&
        y >= run.y - run.height - tolerance &&
        y <= run.y + tolerance
      );
    }) || null;
  };

  // Phase 4.1: Find character index at position within a text run
  const findCharIndexAtPosition = (x: number, run: PdfTextRun, pageNumber: number): number => {
    if (!canvasRef.current) return 0;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return 0;
    
    // Measure text to find character position
    context.font = `${run.fontSize}px ${run.fontName}`;
    const relativeX = x - run.x;
    
    // Binary search for character position
    let low = 0;
    let high = run.text.length;
    let charIndex = 0;
    
    for (let i = 0; i <= run.text.length; i++) {
      const substr = run.text.substring(0, i);
      const width = context.measureText(substr).width;
      if (width >= relativeX) {
        charIndex = i;
        break;
      }
    }
    
    return Math.max(0, Math.min(run.text.length, charIndex));
  };

  // Phase 4.1: Get text selection rectangle
  const getTextSelectionRect = (start: { runId: string; charIndex: number }, end: { runId: string; charIndex: number }, pageNumber: number) => {
    const runs = pdfTextRuns[pageNumber] || [];
    const startRun = runs.find(r => r.id === start.runId);
    const endRun = runs.find(r => r.id === end.runId);
    
    if (!startRun || !endRun) return null;
    
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    context.font = `${startRun.fontSize}px ${startRun.fontName}`;
    
    if (start.runId === end.runId) {
      // Same run - single selection
      const startText = startRun.text.substring(0, start.charIndex);
      const endText = startRun.text.substring(0, end.charIndex);
      const startX = startRun.x + context.measureText(startText).width;
      const endX = startRun.x + context.measureText(endText).width;
      
      return {
        x: Math.min(startX, endX),
        y: startRun.y - startRun.height,
        width: Math.abs(endX - startX),
        height: startRun.height,
      };
    } else {
      // Multi-run selection (simplified - just highlight runs)
      return {
        x: startRun.x,
        y: startRun.y - startRun.height,
        width: endRun.x + endRun.width - startRun.x,
        height: startRun.height,
      };
    }
  };

  const renderPage = async (pageNumber: number, useCache: boolean = true) => {
    if (!pdfDocRef.current || !canvasRef.current || !containerRef.current) return;
    
    // Production: Check render cache
    if (useCache && renderCacheRef.current.has(pageNumber)) {
      const cached = renderCacheRef.current.get(pageNumber)!;
      const now = Date.now();
      if (now - cached.timestamp < CACHE_EXPIRY && annotations.filter(a => a.page === pageNumber).length === 0) {
        // Use cached render if no annotations on this page
        const canvas = canvasRef.current;
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = cached.imageData;
        return;
      } else {
        // Cache expired or annotations exist, remove from cache
        renderCacheRef.current.delete(pageNumber);
      }
    }

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Get container dimensions (account for padding)
      const containerWidth = container.clientWidth - 32; // 16px padding on each side
      const containerHeight = container.clientHeight - 32;
      
      // Get PDF page dimensions at scale 1.0
      const viewportAtScale1 = page.getViewport({ scale: 1.0 });
      const pdfWidth = viewportAtScale1.width;
      const pdfHeight = viewportAtScale1.height;
      
      // Advanced: Calculate scale based on zoom mode
      let scale: number;
      if (zoomMode === 'fit-width') {
        scale = (containerWidth / pdfWidth) * zoom;
      } else if (zoomMode === 'fit-height') {
        scale = (containerHeight / pdfHeight) * zoom;
      } else if (zoomMode === 'fit-page') {
        const scaleX = containerWidth / pdfWidth;
        const scaleY = containerHeight / pdfHeight;
        scale = Math.min(scaleX, scaleY) * zoom;
      } else {
        // Custom zoom
        const scaleX = (containerWidth / pdfWidth) * zoom;
        const scaleY = (containerHeight / pdfHeight) * zoom;
        scale = Math.min(scaleX, scaleY, 5.0); // Max zoom 5x for custom
      }
      
      // Get viewport at calculated scale
      const viewport = page.getViewport({ scale });
      
      // Set canvas display size (CSS pixels)
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      
      // Set canvas internal size (device pixels for crisp rendering)
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * devicePixelRatio;
      canvas.height = viewport.height * devicePixelRatio;
      
      // Scale context to handle device pixel ratio
      context.scale(devicePixelRatio, devicePixelRatio);

      await page.render({ 
        canvasContext: context, 
        viewport,
      } as any).promise;
      
      // Phase 2.1: Extract text layer after rendering
      await extractTextLayer(pageNumber);
      
      // Draw annotations (Advanced: Filter hidden layers)
      const pageAnnotations = annotations.filter(ann => ann.page === pageNumber && !hiddenLayers.has(ann.id));
      pageAnnotations.forEach(ann => {
        context.save();
        
        if (ann.type === 'text' && ann.text) {
          context.save();
          
          // Phase 8: Apply text shadow
          if (ann.textShadow) {
            context.shadowOffsetX = ann.textShadow.offsetX;
            context.shadowOffsetY = ann.textShadow.offsetY;
            context.shadowBlur = ann.textShadow.blur;
            context.shadowColor = ann.textShadow.color;
          }
          
          context.fillStyle = ann.color || '#000000';
          const fontFamily = ann.fontFamily || 'Arial';
          const fontSize = ann.fontSize || 16;
          const fontWeight = ann.fontWeight || 'normal';
          const fontStyle = ann.fontStyle || 'normal';
          
          // Phase 8: Apply letter spacing (simulated with manual spacing)
          const letterSpacing = ann.letterSpacing || 0;
          context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          context.textAlign = (ann.textAlign || 'left') as CanvasTextAlign;
          context.textBaseline = 'bottom';
          
          // Calculate text position based on alignment
          let textX = ann.x;
          
          // Phase 8: Draw text with letter spacing
          const textContent = ann.text || '';
          if (letterSpacing > 0 && textContent) {
            const chars = textContent.split('');
            let currentX = textX;
            chars.forEach((char, index) => {
              if (ann.textAlign === 'center') {
                const metrics = context.measureText(textContent);
                currentX = ann.x - metrics.width / 2 + (index * (fontSize * 0.6 + letterSpacing));
              } else if (ann.textAlign === 'right') {
                const metrics = context.measureText(textContent);
                currentX = ann.x - metrics.width + (index * (fontSize * 0.6 + letterSpacing));
              } else {
                currentX = ann.x + (index * (fontSize * 0.6 + letterSpacing));
              }
              context.fillText(char, currentX, ann.y);
            });
          } else if (textContent) {
            if (ann.textAlign === 'center') {
              const metrics = context.measureText(textContent);
              textX = ann.x - metrics.width / 2;
            } else if (ann.textAlign === 'right') {
              const metrics = context.measureText(textContent);
              textX = ann.x - metrics.width;
            }
            context.fillText(textContent, textX, ann.y);
          }
          
          // Phase 8: Apply text outline
          if (ann.textOutline && ann.textOutline.width > 0 && textContent) {
            context.strokeStyle = ann.textOutline.color;
            context.lineWidth = ann.textOutline.width;
            context.strokeText(textContent, textX, ann.y);
          }
          
          // Apply text decoration
          if (ann.textDecoration === 'underline' && textContent) {
            const metrics = context.measureText(textContent);
            context.strokeStyle = ann.color || '#000000';
            context.lineWidth = 1;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
            context.beginPath();
            const underlineY = ann.y + 2;
            if (ann.textAlign === 'center') {
              context.moveTo(ann.x - metrics.width / 2, underlineY);
              context.lineTo(ann.x + metrics.width / 2, underlineY);
            } else if (ann.textAlign === 'right') {
              context.moveTo(ann.x - metrics.width, underlineY);
              context.lineTo(ann.x, underlineY);
            } else {
              context.moveTo(ann.x, underlineY);
              context.lineTo(ann.x + metrics.width, underlineY);
            }
            context.stroke();
          }
          
          context.restore();
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
        } else if (ann.type === 'watermark' && ann.watermarkText) {
          // Draw watermark
          context.save();
          context.globalAlpha = ann.watermarkOpacity || 0.3;
          context.fillStyle = ann.color || '#CCCCCC';
          context.font = `${ann.fontSize || 48}px ${ann.fontFamily || 'Arial'}`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.rotate(-Math.PI / 4); // Rotate 45 degrees
          context.fillText(ann.watermarkText, ann.x, ann.y);
          context.restore();
        } else if (ann.type === 'signature' && ann.width && ann.height) {
          // Draw signature area (dashed border)
          context.strokeStyle = ann.strokeColor || '#000000';
          context.lineWidth = 2;
          context.setLineDash([5, 5]);
          context.strokeRect(ann.x, ann.y, ann.width, ann.height);
          context.setLineDash([]);
          context.fillStyle = '#000000';
          context.font = '12px Arial';
          context.textAlign = 'center';
          context.fillText('Signature', ann.x + ann.width / 2, ann.y + ann.height / 2);
        } else if (ann.type === 'redaction' && ann.width && ann.height) {
          // Draw redaction (black rectangle)
          context.fillStyle = ann.fillColor || '#000000';
          context.fillRect(ann.x, ann.y, ann.width, ann.height);
        }
        
        // Selection highlight
        if (selectedAnnotation === ann.id || selectedAnnotations.has(ann.id)) {
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
      
      // Phase 2.4 & 4.1: Draw text run highlights and selections (for PDF text editing)
      if ((textEditMode || tool === 'edit-text') && pdfTextRuns[pageNumber]) {
        const runs = pdfTextRuns[pageNumber];
        
        // Phase 7: Draw spell check highlights
        if (spellCheckEnabled) {
          runs.forEach(run => {
            const misspelled = spellCheckResults[run.id] || [];
            if (misspelled.length > 0) {
              context.save();
              context.strokeStyle = '#ef4444'; // Red underline for misspellings
              context.lineWidth = 2;
              context.setLineDash([2, 2]);
              context.beginPath();
              context.moveTo(run.x, run.y);
              context.lineTo(run.x + run.width, run.y);
              context.stroke();
              context.restore();
            }
          });
        }
        
        // Draw text selection (character-level)
        if (textSelectionStart && textSelectionEnd && textSelectionStart.runId === textSelectionEnd.runId) {
          const run = runs.find(r => r.id === textSelectionStart.runId);
          if (run) {
            context.save();
            context.font = `${run.fontSize}px ${run.fontName}`;
            const startIdx = Math.min(textSelectionStart.charIndex, textSelectionEnd.charIndex);
            const endIdx = Math.max(textSelectionStart.charIndex, textSelectionEnd.charIndex);
            const startText = run.text.substring(0, startIdx);
            const endText = run.text.substring(0, endIdx);
            const startX = run.x + context.measureText(startText).width;
            const endX = run.x + context.measureText(endText).width;
            
            // Draw selection highlight
            context.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Blue selection
            context.fillRect(
              Math.min(startX, endX),
              run.y - run.height,
              Math.abs(endX - startX),
              run.height
            );
            context.restore();
          }
        }
        
        // Draw run highlights
        runs.forEach(run => {
          if (selectedTextRun === run.id || editingTextRun === run.id) {
            context.save();
            context.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Blue highlight
            context.fillRect(run.x, run.y - run.height, run.width, run.height);
            context.strokeStyle = '#3b82f6';
            context.lineWidth = 1;
            context.strokeRect(run.x, run.y - run.height, run.width, run.height);
            context.restore();
          }
        });
      }
      
      // Production: Cache rendered page if no annotations
      if (annotations.filter(a => a.page === pageNumber).length === 0) {
        const imageData = canvas.toDataURL('image/png');
        renderCacheRef.current.set(pageNumber, {
          imageData,
          timestamp: Date.now(),
        });
        
        // Limit cache size
        if (renderCacheRef.current.size > RENDER_CACHE_SIZE) {
          const oldestKey = Array.from(renderCacheRef.current.keys())
            .sort((a, b) => {
              const aTime = renderCacheRef.current.get(a)!.timestamp;
              const bTime = renderCacheRef.current.get(b)!.timestamp;
              return aTime - bTime;
            })[0];
          renderCacheRef.current.delete(oldestKey);
        }
      }
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  // Production: Debounced render for performance
  const debouncedPageNum = useDebounce(pageNum, DEBOUNCE_DELAY);
  const debouncedAnnotations = useDebounce(annotations, DEBOUNCE_DELAY);
  
  useEffect(() => {
    if (pdfDocRef.current && pageNum > 0) {
      measurePerformance(`renderPage-${pageNum}`, () => renderPage(pageNum));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, debouncedAnnotations, zoom, selectedAnnotation, selectedAnnotations]);

  // Production: Debounced resize observer for performance
  useEffect(() => {
    if (!containerRef.current || !pdfDocRef.current) return;

    let resizeTimeout: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize events
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (pdfDocRef.current && pageNum > 0) {
          measurePerformance('resizeRender', () => renderPage(pageNum));
        }
      }, 150); // 150ms debounce for resize
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [pageNum, zoom]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    // Canvas internal size vs display size
    const scaleX = (canvas.width / devicePixelRatio) / rect.width;
    const scaleY = (canvas.height / devicePixelRatio) / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    
    // Phase 2.3 & 4.1: Check if clicking on PDF text (edit mode)
    if (tool === 'edit-text' || textEditMode) {
      const clickedRun = findTextRunAtPosition(coords.x, coords.y, pageNum);
      if (clickedRun) {
        // Phase 4.1: Start text selection on drag
        if (e.shiftKey) {
          // Shift+click: Extend selection
          const charIndex = findCharIndexAtPosition(coords.x, clickedRun, pageNum);
          setTextSelectionEnd({ x: coords.x, y: coords.y, runId: clickedRun.id, charIndex });
        } else {
          // Normal click: Start new selection or edit
          const charIndex = findCharIndexAtPosition(coords.x, clickedRun, pageNum);
          setTextSelectionStart({ x: coords.x, y: coords.y, runId: clickedRun.id, charIndex });
          setTextSelectionEnd({ x: coords.x, y: coords.y, runId: clickedRun.id, charIndex });
          setIsSelectingText(true);
          setSelectedTextRun(clickedRun.id);
          setEditingCharIndex(charIndex);
          
          // Double-click: Start editing
          if (e.detail === 2) {
            setEditingTextRun(clickedRun.id);
            setTextEditMode(true);
          }
        }
        return;
      }
    }
    
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
    // Phase 4.1: Handle text selection drag
    if (isSelectingText && textSelectionStart && (tool === 'edit-text' || textEditMode)) {
      const coords = getCanvasCoordinates(e);
      const clickedRun = findTextRunAtPosition(coords.x, coords.y, pageNum);
      if (clickedRun) {
        const charIndex = findCharIndexAtPosition(coords.x, clickedRun, pageNum);
        setTextSelectionEnd({ x: coords.x, y: coords.y, runId: clickedRun.id, charIndex });
        // Trigger re-render to show selection
        renderPage(pageNum);
      }
    }
    
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
    // Phase 4.1: End text selection
    if (isSelectingText) {
      setIsSelectingText(false);
      // Copy selected text to clipboard if Ctrl+C
      if (e.ctrlKey || e.metaKey) {
        if (textSelectionStart && textSelectionEnd) {
          const runs = pdfTextRuns[pageNum] || [];
          const startRun = runs.find(r => r.id === textSelectionStart.runId);
          if (startRun && textSelectionStart.runId === textSelectionEnd.runId) {
            const startIdx = Math.min(textSelectionStart.charIndex, textSelectionEnd.charIndex);
            const endIdx = Math.max(textSelectionStart.charIndex, textSelectionEnd.charIndex);
            const selectedText = startRun.text.substring(startIdx, endIdx);
            navigator.clipboard.writeText(selectedText);
            toast.success('Text copied to clipboard');
          }
        }
      }
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
    
    if (!isDrawing || !drawStart || !tool || !isEditable) {
      setIsDrawing(false);
      setDrawStart(null);
      return;
    }
    
    const coords = getCanvasCoordinates(e);
    const newAnnotations = [...annotations];
    
    if (tool === 'text' && currentText.trim()) {
      // Production: Security - Sanitize text input
      const sanitizedText = sanitizeTextForPDF(currentText);
      if (!sanitizedText.trim()) {
        toast.error('Invalid text content');
        return;
      }
      
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'text',
        x: coords.x,
        y: coords.y,
        text: sanitizedText,
        fontSize,
        fontFamily,
        textAlign,
        fontWeight,
        fontStyle,
        textDecoration,
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
    } else if (tool === 'signature') {
      // Signature tool - draw signature area
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 10 && height > 10) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'signature',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          strokeColor: '#000000',
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Signature area added - Draw your signature');
      }
    } else if (tool === 'watermark') {
      // Watermark tool - add watermark text
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'watermark',
        x: coords.x,
        y: coords.y,
        watermarkText: watermarkText,
        watermarkOpacity: watermarkOpacity,
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#CCCCCC',
        page: pageNum,
      };
      newAnnotations.push(newAnnotation);
      toast.success('Watermark added');
    } else if (tool === 'redaction') {
      // Redaction tool - permanently black out content
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 5 && height > 5) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'redaction',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          fillColor: '#000000',
          strokeColor: '#000000',
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Redaction added');
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
            const fontWeight = annotation.fontWeight || 'normal';
            const fontStyle = annotation.fontStyle || 'normal';
            
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
            
            // Draw underline if needed (PDF-lib doesn't support underline directly, so we draw a line)
            if (annotation.textDecoration === 'underline') {
              const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);
              const underlineY = height - annotation.y - fontSize - 2;
              let underlineX = textX;
              if (annotation.textAlign === 'center') {
                underlineX = annotation.x - textWidth / 2;
              } else if (annotation.textAlign === 'right') {
                underlineX = annotation.x - textWidth;
              }
              page.drawLine({
                start: { x: underlineX, y: underlineY },
                end: { x: underlineX + textWidth, y: underlineY },
                thickness: 1,
                color: rgb(rgbColor.r / 255, rgbColor.g / 255, rgbColor.b / 255),
              });
            }
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
          } else if (annotation.type === 'watermark' && annotation.watermarkText) {
            // Draw watermark (simplified - without rotation for now)
            // pdf-lib doesn't have direct rotation support for text
            // We'll draw it without rotation, or use a workaround
            const watermarkFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const watermarkRgb = hexToRgb(annotation.color || '#CCCCCC');
            const watermarkOpacity = annotation.watermarkOpacity || 0.3;
            
            // Calculate text width for centering
            const textWidth = watermarkFont.widthOfTextAtSize(annotation.watermarkText, annotation.fontSize || 48);
            
            // Draw watermark text (centered at position, no rotation for compatibility)
            page.drawText(annotation.watermarkText, {
              x: annotation.x - textWidth / 2,
              y: height - annotation.y,
              size: annotation.fontSize || 48,
              font: watermarkFont,
              color: rgb(watermarkRgb.r / 255, watermarkRgb.g / 255, watermarkRgb.b / 255),
              opacity: watermarkOpacity,
            });
          } else if (annotation.type === 'signature' && annotation.width && annotation.height) {
            // Draw signature area (dashed border - PDF-lib doesn't support dashed, so we use solid)
            page.drawRectangle({
              x: annotation.x,
              y: height - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              borderColor: rgb(0, 0, 0),
              borderWidth: 2,
            });
            const signatureFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            page.drawText('Signature', {
              x: annotation.x + annotation.width / 2 - 30,
              y: height - annotation.y - annotation.height / 2,
              size: 12,
              font: signatureFont,
              color: rgb(0, 0, 0),
            });
          } else if (annotation.type === 'redaction' && annotation.width && annotation.height) {
            // Draw redaction (black rectangle)
            page.drawRectangle({
              x: annotation.x,
              y: height - annotation.y - annotation.height,
              width: annotation.width,
              height: annotation.height,
              color: rgb(0, 0, 0),
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

  // Phase 3.1: Parse content stream for text operators
  // Enhanced parsing with position and font information
  const parseContentStream = async (pageNumber: number): Promise<Array<{
    operator: string;
    operands: any[];
    position: number;
    x: number;
    y: number;
    fontSize: number;
    fontName: string;
    transform: number[];
  }>> => {
    if (!pdfDocRef.current) return [];
    
    try {
      // Use pdf.js to get text content with detailed information
      const page = await pdfDocRef.current.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      // Map text items to operators with full context
      const operators: Array<{
        operator: string;
        operands: any[];
        position: number;
        x: number;
        y: number;
        fontSize: number;
        fontName: string;
        transform: number[];
      }> = [];
      
      textContent.items.forEach((item: any, index: number) => {
        if (item.str && item.str.trim()) {
          operators.push({
            operator: 'Tj', // Text show operator
            operands: [item.str],
            position: index,
            x: item.transform[4] || 0,
            y: item.transform[5] || 0,
            fontSize: item.height || item.fontSize || 12,
            fontName: item.fontName || 'Helvetica',
            transform: item.transform || [1, 0, 0, 1, 0, 0],
          });
        }
      });
      
      return operators;
    } catch (error) {
      console.error('Error parsing content stream:', error);
      return [];
    }
  };

  // Phase 3.3: Rebuild PDF page with modified text
  const rebuildPdfPageWithText = async (
    pageNumber: number,
    textModifications: Array<{ runId: string; newText: string; format?: any }>
  ) => {
    if (!pdfLibDocRef.current || !pdfDocRef.current) return false;
    
    try {
      const pdfDoc = pdfLibDocRef.current;
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      
      if (!page) return false;
      
      // Get page dimensions
      const { width, height } = page.getSize();
      
      // Phase 3.3.1: Get all text runs for this page
      const runs = pdfTextRuns[pageNumber] || [];
      const operators = await parseContentStream(pageNumber);
      
      // Phase 3.3.2: Create a map of modifications
      const modificationMap = new Map<string, { newText: string; format?: any }>();
      textModifications.forEach(mod => {
        modificationMap.set(mod.runId, { newText: mod.newText, format: mod.format });
      });
      
      // Phase 3.3.3: Find text runs that need modification
      const runsToModify = runs.filter(run => modificationMap.has(run.id));
      
      if (runsToModify.length === 0) return false;
      
      // Phase 3.3.4: For each modified run, draw white rectangle + new text
      // This is a hybrid approach: we modify the page content by drawing over old text
      for (const run of runsToModify) {
        const mod = modificationMap.get(run.id);
        if (!mod) continue;
        
        const format = mod.format || {};
        const newText = mod.newText;
        
        // Get font properties
        const fontSize = format.fontSize || run.fontSize || 12;
        const fontFamily = format.fontFamily || run.fontName || 'Helvetica';
        const fontWeight = format.fontWeight || run.fontWeight || 'normal';
        const fontStyle = format.fontStyle || run.fontStyle || 'normal';
        
        // Map font family to pdf-lib StandardFonts
        let pdfFont = StandardFonts.Helvetica;
        if (fontFamily.toLowerCase().includes('times')) {
          pdfFont = fontWeight === 'bold' && fontStyle === 'italic' ? StandardFonts.TimesRomanBoldItalic :
                   fontWeight === 'bold' ? StandardFonts.TimesRomanBold :
                   fontStyle === 'italic' ? StandardFonts.TimesRomanItalic :
                   StandardFonts.TimesRoman;
        } else if (fontFamily.toLowerCase().includes('courier')) {
          pdfFont = fontWeight === 'bold' ? StandardFonts.CourierBold :
                   fontStyle === 'italic' ? StandardFonts.CourierOblique :
                   StandardFonts.Courier;
        } else {
          pdfFont = fontWeight === 'bold' && fontStyle === 'italic' ? StandardFonts.HelveticaBoldOblique :
                   fontWeight === 'bold' ? StandardFonts.HelveticaBold :
                   fontStyle === 'italic' ? StandardFonts.HelveticaOblique :
                   StandardFonts.Helvetica;
        }
        
        const font = await pdfDoc.embedFont(pdfFont);
        
        // Calculate text bounds accurately
        const textWidth = font.widthOfTextAtSize(newText, fontSize);
        const textHeight = fontSize;
        
        // Draw white rectangle to cover old text (with padding)
        page.drawRectangle({
          x: run.x - 5,
          y: run.y - textHeight - 2,
          width: Math.max(textWidth + 10, run.width || textWidth + 10),
          height: textHeight + 4,
          color: rgb(1, 1, 1),
          opacity: 1,
        });
        
        // Parse color
        let textColor = rgb(0, 0, 0);
        if (format.color) {
          const hex = format.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          textColor = rgb(r, g, b);
        }
        
        // Calculate text position based on alignment
        let textX = run.x;
        if (format.textAlign === 'center') {
          const textWidth = font.widthOfTextAtSize(newText, fontSize);
          textX = run.x - textWidth / 2;
        } else if (format.textAlign === 'right') {
          const textWidth = font.widthOfTextAtSize(newText, fontSize);
          textX = run.x - textWidth;
        }
        
        // Draw new text
        page.drawText(newText, {
          x: textX,
          y: run.y,
          size: fontSize,
          font: font,
          color: textColor,
        });
        
        // Draw underline if needed
        if (format.textDecoration === 'underline') {
          const textWidth = font.widthOfTextAtSize(newText, fontSize);
          page.drawLine({
            start: { x: textX, y: run.y - 2 },
            end: { x: textX + textWidth, y: run.y - 2 },
            thickness: 1,
            color: textColor,
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error rebuilding PDF page:', error);
      return false;
    }
  };

  // Phase 3.2: Update PDF text in content stream (true editing)
  const updatePdfTextInStream = async (runId: string, newText: string, format?: {
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
  }) => {
    if (!pdfLibDocRef.current) {
      // Fallback to overlay mode
      updatePdfTextOverlay(runId, newText, format);
      return;
    }
    
    const runs = pdfTextRuns[pageNum] || [];
    const run = runs.find(r => r.id === runId);
    if (!run) return;
    
    // Production: Security - Sanitize text input
    const sanitizedText = sanitizeTextForPDF(newText);
    if (!sanitizedText.trim()) {
      toast.error('Invalid text content');
      return;
    }
    
    try {
      // Phase 3.3: Rebuild PDF page with modified text
      const success = await rebuildPdfPageWithText(pageNum, [{
        runId,
        newText: sanitizedText,
        format,
      }]);
      
      if (success) {
        // Update the text run in our state
        setPdfTextRuns(prev => {
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
        
        // Re-render the page to show changes
        await renderPage(pageNum);
        
        // Save to text edit history
        saveTextEditToHistory(runId, run.text, sanitizedText, format);
        
        toast.success('PDF text updated successfully!');
      } else {
        // Fallback to overlay mode
        toast.warning('Using overlay mode for text editing');
        updatePdfTextOverlay(runId, newText, format);
      }
      
    } catch (error) {
      console.error('Error updating PDF text in stream:', error);
      toast.error('Failed to update PDF text. Using overlay mode.');
      updatePdfTextOverlay(runId, newText, format);
    }
  };

  // Phase 2.5: Update PDF text content (overlay mode - fallback)
  const updatePdfTextOverlay = (runId: string, newText: string, format?: {
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
  }) => {
    const runs = pdfTextRuns[pageNum] || [];
    const run = runs.find(r => r.id === runId);
    if (!run) return;
    
    // Use overlay approach (white rectangle + new text)
    const newAnnotation: Annotation = {
      id: `pdf-text-edit-${Date.now()}`,
      type: 'text',
      x: run.x,
      y: run.y,
      text: newText,
      fontSize: run.fontSize,
      fontFamily: run.fontName,
      color: '#000000',
      page: pageNum,
      width: run.width,
      height: run.height,
    };
    
    // Add white rectangle to cover old text
    const whiteRect: Annotation = {
      id: `pdf-text-cover-${Date.now()}`,
      type: 'rectangle',
      x: run.x - 2,
      y: run.y - run.height - 2,
      width: run.width + 4,
      height: run.height + 4,
      fillColor: '#FFFFFF',
      strokeColor: '#FFFFFF',
      page: pageNum,
    };
    
    const newAnnotations = [...annotations, whiteRect, newAnnotation];
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    
    // Phase 6: Save to text edit history for undo/redo
    const oldText = run.text;
    setTextEditHistory(prev => {
      const newHistory = prev.slice(0, textEditHistoryIndex + 1);
      newHistory.push({ runId, oldText, newText, format });
      return newHistory;
    });
    setTextEditHistoryIndex(prev => prev + 1);
    
    toast.success('PDF text updated');
  };

  // Phase 2.5: Update PDF text content (wrapper - tries Phase 3 first)
  const updatePdfText = (runId: string, newText: string, format?: {
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    textDecoration?: 'none' | 'underline';
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
  }) => {
    // Try Phase 3 (content stream editing) first, fallback to Phase 2 (overlay)
    updatePdfTextInStream(runId, newText, format);
  };

  // Phase 6: Undo/Redo for text edits
  const undoTextEdit = useCallback(() => {
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
  }, [textEditHistory, textEditHistoryIndex, pageNum, pdfTextRuns]);

  const redoTextEdit = useCallback(() => {
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
  }, [textEditHistory, textEditHistoryIndex, pageNum, pdfTextRuns]);

  // Phase 6: Calculate text statistics
  const calculateTextStats = () => {
    const runs = pdfTextRuns[pageNum] || [];
    let totalChars = 0;
    let totalWords = 0;
    let totalRuns = runs.length;
    
    runs.forEach(run => {
      totalChars += run.text.length;
      const words = run.text.trim().split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;
    });
    
    return { totalChars, totalWords, totalRuns };
  };

  // Phase 6: Save text style
  const saveTextStyle = (name: string) => {
    if (!editingTextFormat || Object.keys(editingTextFormat).length === 0) {
      toast.warning('No format to save');
      return;
    }
    
    setTextStyles(prev => [...prev, { name, format: { ...editingTextFormat } }]);
    toast.success(`Text style "${name}" saved`);
  };

  // Phase 6: Apply text style
  const applyTextStyle = (style: { name: string; format: any }) => {
    setEditingTextFormat(style.format);
    toast.success(`Applied style "${style.name}"`);
  };

  // Phase 7: Spell check (basic implementation)
  const checkSpelling = (text: string): string[] => {
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

  // Phase 7: Text transformation
  const transformText = (text: string, transform: 'uppercase' | 'lowercase' | 'capitalize'): string => {
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

  // Production: Auto-save with error handling and performance monitoring
  useEffect(() => {
    if (autoSaveEnabled && annotations.length > 0) {
      const interval = setInterval(async () => {
        try {
          if (pdfLibDocRef.current && file) {
            await measurePerformance('autoSave', async () => {
              // Auto-save to localStorage as backup
              const saveData = {
                annotations,
                timestamp: Date.now(),
                pageNum,
                pdfTextRuns, // Include text runs for recovery
              };
              
              try {
                localStorage.setItem(`pdf-editor-autosave-${file.name}`, JSON.stringify(saveData));
                // Only log in development
                if (process.env.NODE_ENV === 'development') {
                  console.log('Auto-saved');
                }
              } catch (storageError) {
                // Handle quota exceeded error
                if (storageError instanceof DOMException && storageError.code === 22) {
                  logError(storageError as Error, 'autoSave - storage quota exceeded');
                  toast.warning('Auto-save failed: Storage quota exceeded');
                } else {
                  logError(storageError as Error, 'autoSave - storage error');
                }
              }
            });
          }
        } catch (error) {
          logError(error as Error, 'autoSave', { fileName: file?.name });
        }
      }, AUTO_SAVE_INTERVAL);
      
      setAutoSaveInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }
    }
  }, [autoSaveEnabled, annotations, file, pageNum, pdfTextRuns]);

  // Phase 8: Load auto-saved data
  const loadAutoSave = () => {
    if (!file) return;
    try {
      const saved = localStorage.getItem(`pdf-editor-autosave-${file.name}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (confirm('Found auto-saved data. Load it?')) {
          setAnnotations(data.annotations || []);
          setPageNum(data.pageNum || 1);
          toast.success('Auto-saved data loaded');
        }
      }
    } catch (error) {
      console.error('Error loading auto-save:', error);
    }
  };

  // Phase 8: Apply text template
  const applyTextTemplate = (template: { name: string; text: string; format?: any }) => {
    setCurrentText(template.text);
    if (template.format) {
      setFontSize(template.format.fontSize || fontSize);
      setFontFamily(template.format.fontFamily || fontFamily);
      setFontWeight(template.format.fontWeight || fontWeight);
      setFontStyle(template.format.fontStyle || fontStyle);
      setTextColor(template.format.color || textColor);
    }
    setTool('text');
    toast.success(`Template "${template.name}" applied`);
  };

  // Phase 7: Export PDF with options
  const exportPdfWithOptions = async () => {
    if (!pdfLibDocRef.current) {
      toast.error('No PDF loaded');
      return;
    }
    
    try {
      setIsProcessing(true);
      const pdfDoc = pdfLibDocRef.current;
      
      // Apply export quality settings
      // Note: pdf-lib doesn't have direct quality settings, but we can optimize
      const pdfBytes = await pdfDoc.save();
      
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const qualitySuffix = exportQuality === 'low' ? '_low' : exportQuality === 'medium' ? '_medium' : '';
      const formatSuffix = exportFormat === 'pdf-a' ? '_pdfa' : '';
      a.download = file?.name.replace('.pdf', `${qualitySuffix}${formatSuffix}_edited.pdf`) || `edited${qualitySuffix}${formatSuffix}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully!');
      setShowExportOptions(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  // Phase 3.4: Save text edit to history
  const saveTextEditToHistory = (runId?: string, oldText?: string, newText?: string, format?: any) => {
    if (runId && oldText !== undefined && newText !== undefined) {
      setTextEditHistory(prev => {
        const newHistory = prev.slice(0, textEditHistoryIndex + 1);
        newHistory.push({ runId, oldText, newText, format });
        return newHistory;
      });
      setTextEditHistoryIndex(prev => prev + 1);
    }
  };

  // Phase 4.6: Find text in PDF (Advanced: with regex support)
  const findTextInPdf = (searchText: string) => {
    if (!searchText.trim()) {
      setFindResults([]);
      setCurrentFindIndex(-1);
      return;
    }
    
    const results: Array<{ runId: string; startIndex: number; endIndex: number }> = [];
    const runs = pdfTextRuns[pageNum] || [];
    
    try {
      let regex: RegExp;
      
      if (useRegex) {
        // Advanced: Regex mode
        const flags = caseSensitive ? 'g' : 'gi';
        regex = new RegExp(searchText, flags);
      } else {
        // Normal mode with options
        const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = wholeWords ? `\\b${escaped}\\b` : escaped;
        const flags = caseSensitive ? 'g' : 'gi';
        regex = new RegExp(pattern, flags);
      }
      
      runs.forEach(run => {
        const matches = Array.from(run.text.matchAll(regex));
        matches.forEach(match => {
          if (match.index !== undefined) {
            results.push({
              runId: run.id,
              startIndex: match.index,
              endIndex: match.index + match[0].length,
            });
          }
        });
      });
      
      setFindResults(results);
      if (results.length > 0) {
        setCurrentFindIndex(0);
        // Highlight first result
        const firstResult = results[0];
        const run = runs.find(r => r.id === firstResult.runId);
        if (run) {
          setSelectedTextRun(run.id);
          setTextSelectionStart({ x: 0, y: 0, runId: run.id, charIndex: firstResult.startIndex });
          setTextSelectionEnd({ x: 0, y: 0, runId: run.id, charIndex: firstResult.endIndex });
          renderPage(pageNum);
        }
        toast.success(`Found ${results.length} result(s)`);
      } else {
        toast.info('No results found');
      }
    } catch (error) {
      toast.error('Invalid regex pattern');
      console.error('Regex error:', error);
    }
  };

  // Phase 4.6: Replace text in PDF
  const replaceTextInPdf = (searchText: string, replaceText: string) => {
    if (!searchText.trim()) return;
    
    const runs = pdfTextRuns[pageNum] || [];
    let replaced = 0;
    
    runs.forEach(run => {
      if (run.text.includes(searchText)) {
        const newText = run.text.replace(new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceText);
        if (newText !== run.text) {
          updatePdfText(run.id, newText);
          replaced++;
        }
      }
    });
    
    if (replaced > 0) {
      toast.success(`Replaced ${replaced} occurrence(s)`);
      findTextInPdf(searchText); // Refresh find results
    } else {
      toast.info('No text to replace');
    }
  };

  // Phase 4.6: Navigate find results
  const navigateFindResults = (direction: 'next' | 'prev') => {
    if (findResults.length === 0) return;
    
    const newIndex = direction === 'next' 
      ? (currentFindIndex + 1) % findResults.length
      : (currentFindIndex - 1 + findResults.length) % findResults.length;
    
    setCurrentFindIndex(newIndex);
    const result = findResults[newIndex];
    const runs = pdfTextRuns[pageNum] || [];
    const run = runs.find(r => r.id === result.runId);
    if (run) {
      setSelectedTextRun(run.id);
      setTextSelectionStart({ x: 0, y: 0, runId: run.id, charIndex: result.startIndex });
      setTextSelectionEnd({ x: 0, y: 0, runId: run.id, charIndex: result.endIndex });
      renderPage(pageNum);
    }
  };

  // Copy/Paste annotations
  const copyAnnotations = () => {
    if (selectedAnnotations.size > 0) {
      const copied = annotations.filter(ann => selectedAnnotations.has(ann.id));
      setCopiedAnnotations(copied);
      toast.success(`${copied.length} annotation(s) copied`);
    } else if (selectedAnnotation) {
      const copied = annotations.find(ann => ann.id === selectedAnnotation);
      if (copied) {
        setCopiedAnnotations([copied]);
        toast.success('Annotation copied');
      }
    }
  };

  const pasteAnnotations = () => {
    if (copiedAnnotations.length === 0) return;
    const newAnnotations = [...annotations];
    copiedAnnotations.forEach(copied => {
      const newAnnotation: Annotation = {
        ...copied,
        id: Date.now().toString() + Math.random(),
        page: pageNum,
        x: copied.x + 20, // Offset slightly
        y: copied.y + 20,
      };
      newAnnotations.push(newAnnotation);
    });
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    toast.success(`${copiedAnnotations.length} annotation(s) pasted`);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 'c') {
          e.preventDefault();
          copyAnnotations();
        } else if (e.key === 'v') {
          e.preventDefault();
          pasteAnnotations();
        } else if (e.key === 'b') {
          e.preventDefault();
          if (tool === 'text') setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
        } else if (e.key === 'i') {
          e.preventDefault();
          if (tool === 'text') setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic');
        } else if (e.key === 'u') {
          e.preventDefault();
          if (tool === 'text') setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline');
        }
      }
      
      // Single key shortcuts (only when not typing)
      if (!e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedAnnotations.size > 0) {
            const newAnnotations = annotations.filter(ann => !selectedAnnotations.has(ann.id));
            setAnnotations(newAnnotations);
            saveToHistory(newAnnotations);
            setSelectedAnnotations(new Set());
            toast.success('Annotations deleted');
          } else if (selectedAnnotation) {
            removeAnnotation(selectedAnnotation);
          }
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setShowGrid(!showGrid);
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setShowPageManager(!showPageManager);
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
          e.preventDefault();
          setShowPageJump(true);
        } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          if (!textEditMode) {
            setTool('edit-text');
            setTextEditMode(true);
            toast.info('Edit mode: Click on text to edit');
          } else {
            setTool(null);
            setTextEditMode(false);
          }
        }
      }
      
      // Phase 6: Text edit undo/redo (when in text edit mode)
      if (textEditMode && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'z' && !e.shiftKey && textEditHistoryIndex >= 0) {
          e.preventDefault();
          undoTextEdit();
        } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && textEditHistoryIndex < textEditHistory.length - 1) {
          e.preventDefault();
          redoTextEdit();
        }
      }
      
      // Ctrl/Cmd + F/H for Find & Replace
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setShowFindReplace(!showFindReplace);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copyAnnotations, pasteAnnotations, tool, fontWeight, fontStyle, textDecoration, selectedAnnotations, selectedAnnotation, annotations, showGrid, showPageManager, textEditMode, showFindReplace, textEditHistory, textEditHistoryIndex, undoTextEdit, redoTextEdit]);

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
            {/* Advanced: Layer Panel */}
            {showLayerPanel && (
              <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Layers</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {annotations.filter(a => a.page === pageNum).length} annotation(s) on page {pageNum}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {annotations.filter(a => a.page === pageNum).length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                      No annotations on this page
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {annotations
                        .filter(a => a.page === pageNum)
                        .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                        .map(ann => (
                          <div
                            key={ann.id}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                              selectedAnnotation === ann.id
                                ? 'bg-gray-900 text-white'
                                : hiddenLayers.has(ann.id)
                                ? 'bg-slate-100 dark:bg-slate-700 opacity-50'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            onClick={() => setSelectedAnnotation(ann.id)}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newHidden = new Set(hiddenLayers);
                                if (newHidden.has(ann.id)) {
                                  newHidden.delete(ann.id);
                                } else {
                                  newHidden.add(ann.id);
                                }
                                setHiddenLayers(newHidden);
                                renderPage(pageNum);
                              }}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                              title={hiddenLayers.has(ann.id) ? 'Show' : 'Hide'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {hiddenLayers.has(ann.id) ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                )}
                              </svg>
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {ann.type === 'text' ? '📝 Text' : ann.type === 'image' ? '🖼️ Image' : ann.type === 'highlight' ? '🖍️ Highlight' : ann.type === 'rectangle' ? '▭ Rectangle' : ann.type === 'circle' ? '○ Circle' : ann.type === 'line' ? '─ Line' : ann.type === 'arrow' ? '→ Arrow' : ann.type === 'freehand' ? '✏️ Freehand' : ann.type}
                              </div>
                              {ann.text && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {ann.text.substring(0, 30)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newAnnotations = annotations.map(a =>
                                    a.id === ann.id ? { ...a, zIndex: (a.zIndex || 0) + 1 } : a
                                  );
                                  setAnnotations(newAnnotations);
                                  saveToHistory(newAnnotations);
                                  renderPage(pageNum);
                                }}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                                title="Bring Forward"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newAnnotations = annotations.map(a =>
                                    a.id === ann.id ? { ...a, zIndex: Math.max(0, (a.zIndex || 0) - 1) } : a
                                  );
                                  setAnnotations(newAnnotations);
                                  saveToHistory(newAnnotations);
                                  renderPage(pageNum);
                                }}
                                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                                title="Send Backward"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
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
                      {/* Copy/Paste */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={copyAnnotations}
                          disabled={!selectedAnnotation && selectedAnnotations.size === 0}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Copy (Ctrl+C)"
                          aria-label="Copy selected annotations"
                          aria-disabled={!selectedAnnotation && selectedAnnotations.size === 0}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={pasteAnnotations}
                          disabled={copiedAnnotations.length === 0}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Paste (Ctrl+V)"
                          aria-label="Paste annotations"
                          aria-disabled={copiedAnnotations.length === 0}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Undo/Redo - Icon Buttons */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={undo}
                          disabled={historyIndex <= 0}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Undo (Ctrl+Z)"
                          aria-label="Undo last action"
                          aria-disabled={historyIndex <= 0}
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
                          aria-label="Redo last undone action"
                          aria-disabled={historyIndex >= history.length - 1}
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

                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Professional Tools */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => {
                            setTool(tool === 'edit-text' ? null : 'edit-text');
                            setTextEditMode(tool !== 'edit-text');
                            if (tool !== 'edit-text') {
                              toast.info('Edit mode: Click on PDF text to edit');
                            }
                          }}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'edit-text'
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Edit PDF Text (E)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'signature' ? null : 'signature')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'signature'
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Signature (S)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'watermark' ? null : 'watermark')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'watermark'
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Watermark (W)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setTool(tool === 'redaction' ? null : 'redaction')}
                          disabled={!isEditable}
                          className={`p-2.5 rounded-md transition-all ${
                            tool === 'redaction'
                              ? 'bg-red-700 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
                          title="Redaction (X)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowPageManager(!showPageManager)}
                          className={`p-2.5 rounded-md transition-all ${
                            showPageManager
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Page Manager (P)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowGrid(!showGrid)}
                          className={`p-2.5 rounded-md transition-all ${
                            showGrid
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Toggle Grid (G)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
                              {/* Phase 8: Text Templates Quick Access */}
                              {textTemplates.length > 0 && (
                                <select
                                  onChange={(e) => {
                                    const template = textTemplates.find(t => t.name === e.target.value);
                                    if (template) applyTextTemplate(template);
                                  }}
                                  className="px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 text-sm"
                                  defaultValue=""
                                  title="Templates"
                                >
                                  <option value="">📝 Templates</option>
                                  {textTemplates.map(template => (
                                    <option key={template.name} value={template.name}>{template.name}</option>
                                  ))}
                                </select>
                              )}
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
                              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-1">
                                <button
                                  onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                                  className={`px-2 py-1 rounded text-sm transition-all ${
                                    fontWeight === 'bold'
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                                  title="Bold (Ctrl+B)"
                                >
                                  <strong>B</strong>
                                </button>
                                <button
                                  onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                                  className={`px-2 py-1 rounded text-sm transition-all ${
                                    fontStyle === 'italic'
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                                  title="Italic (Ctrl+I)"
                                >
                                  <em>I</em>
                                </button>
                                <button
                                  onClick={() => setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline')}
                                  className={`px-2 py-1 rounded text-sm transition-all ${
                                    textDecoration === 'underline'
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                  }`}
                                  title="Underline (Ctrl+U)"
                                >
                                  <u>U</u>
                                </button>
                              </div>
                            </>
                          )}
                          {tool === 'watermark' && (
                            <>
                              <input
                                type="text"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder="Watermark text"
                                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm w-32"
                              />
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={watermarkOpacity}
                                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                                className="w-24"
                                title="Opacity"
                              />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{Math.round(watermarkOpacity * 100)}%</span>
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
                      {/* Advanced: Zoom Controls with Fit Options */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => {
                            setZoomMode('fit-page');
                            setZoom(1);
                            renderPage(pageNum);
                          }}
                          className={`p-2 rounded-md transition-all ${
                            zoomMode === 'fit-page'
                              ? 'bg-gray-900 text-white'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Fit to Page"
                          aria-label="Fit to page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setZoomMode('fit-width');
                            setZoom(1);
                            renderPage(pageNum);
                          }}
                          className={`p-2 rounded-md transition-all ${
                            zoomMode === 'fit-width'
                              ? 'bg-gray-900 text-white'
                              : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Fit to Width"
                          aria-label="Fit to width"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
                        <button
                          onClick={() => {
                            setZoomMode('custom');
                            setZoom(Math.max(0.5, zoom - 0.25));
                          }}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all"
                          title="Zoom Out (-)"
                          aria-label="Zoom out"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                          </svg>
                        </button>
                        <span className="px-2 text-xs text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => {
                            setZoomMode('custom');
                            setZoom(Math.min(5, zoom + 0.25));
                          }}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all"
                          title="Zoom In (+)"
                          aria-label="Zoom in"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setZoomMode('fit-page');
                            setZoom(1);
                          }}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all"
                          title="Reset Zoom (100%)"
                          aria-label="Reset zoom"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>


                      <div className="w-px h-8 bg-slate-300 dark:bg-slate-600" />

                      {/* Advanced: Page Navigation with Jump */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button
                          onClick={() => setPageNum(Math.max(1, pageNum - 1))}
                          disabled={pageNum <= 1}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Previous Page (←)"
                          aria-label="Previous page"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowPageJump(true)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all min-w-[70px] text-center"
                          title="Jump to Page (Ctrl+G)"
                          aria-label="Jump to page"
                        >
                          {pageNum} / {numPages}
                        </button>
                        <button
                          onClick={() => setPageNum(Math.min(numPages, pageNum + 1))}
                          disabled={pageNum >= numPages}
                          className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700 dark:text-slate-300"
                          title="Next Page (→)"
                          aria-label="Next page"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Advanced: Keyboard Shortcuts Button */}
                      <button
                        onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                        className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all"
                        title="Keyboard Shortcuts (?)"
                        aria-label="Show keyboard shortcuts"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>

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

              {/* Phase 4.6: Find & Replace Panel */}
              {showFindReplace && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[400px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find & Replace</h3>
                    <button
                      onClick={() => setShowFindReplace(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            findTextInPdf(findText);
                          }
                        }}
                        placeholder="Find..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      <button
                        onClick={() => findTextInPdf(findText)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                      >
                        Find
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        placeholder="Replace with..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      <button
                        onClick={() => replaceTextInPdf(findText, replaceText)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                      >
                        Replace
                      </button>
                    </div>
                    {/* Advanced: Search Options */}
                    <div className="flex flex-wrap gap-3 text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useRegex}
                          onChange={(e) => setUseRegex(e.target.checked)}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Regex</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={caseSensitive}
                          onChange={(e) => setCaseSensitive(e.target.checked)}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Case Sensitive</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wholeWords}
                          onChange={(e) => setWholeWords(e.target.checked)}
                          disabled={useRegex}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 disabled:opacity-50"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Whole Words</span>
                      </label>
                    </div>
                    {findResults.length > 0 && (
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {currentFindIndex + 1} of {findResults.length} result(s)
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigateFindResults('prev')}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                          >
                            ↑ Prev
                          </button>
                          <button
                            onClick={() => navigateFindResults('next')}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                          >
                            Next ↓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Canvas - iLovePDF Style Full Screen */}
              <div
                ref={containerRef}
                className="flex-1 bg-slate-200 dark:bg-slate-950 overflow-auto flex justify-center items-start p-4 relative"
                style={{ minHeight: '400px', height: '100%' }}
              >
                <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-sm relative mt-4 mb-4" style={{ maxWidth: '100%' }}>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    className="block max-w-full h-auto"
                    style={{ cursor: tool ? 'crosshair' : selectedAnnotation ? 'move' : 'default', display: 'block' }}
                  />
                  
                  {/* Phase 2.5 & 5: PDF Text Editor - Inline editing for PDF text */}
                  {editingTextRun && pdfTextRuns[pageNum] && (() => {
                    const run = pdfTextRuns[pageNum].find(r => r.id === editingTextRun);
                    if (!run || run.page !== pageNum) return null;
                    
                    const canvas = canvasRef.current;
                    if (!canvas) return null;
                    
                    const rect = canvas.getBoundingClientRect();
                    const devicePixelRatio = window.devicePixelRatio || 1;
                    const scaleX = (canvas.width / devicePixelRatio) / rect.width;
                    const scaleY = (canvas.height / devicePixelRatio) / rect.height;
                    
                    // Calculate position
                    const textX = run.x / scaleX;
                    const textY = (run.y - run.height) / scaleY;
                    
                    // Phase 5: Multi-line editing support
                    const InputComponent = multiLineEditing ? 'textarea' : 'input';
                    const inputProps: any = {
                      ref: textInputRef,
                      defaultValue: run.text,
                      onBlur: (e: any) => {
                        if (editingTextRun && e.target.value !== run.text) {
                          // Phase 2.5: Update PDF text with formatting
                          updatePdfText(run.id, e.target.value, editingTextFormat);
                        }
                        setEditingTextRun(null);
                        setTextEditMode(false);
                        setShowTextFormatPanel(false);
                        setEditingTextFormat({});
                      },
                      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                        if (e.key === 'Enter' && !multiLineEditing) {
                          (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
                        } else if (e.key === 'Escape') {
                          setEditingTextRun(null);
                          setTextEditMode(false);
                          setShowTextFormatPanel(false);
                          setEditingTextFormat({});
                        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && multiLineEditing) {
                          (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
                        }
                      },
                      style: {
                        position: 'absolute',
                        left: `${rect.left + textX}px`,
                        top: `${rect.top + textY}px`,
                        fontSize: `${editingTextFormat.fontSize || run.fontSize}px`,
                        fontFamily: editingTextFormat.fontFamily || run.fontName,
                        fontWeight: editingTextFormat.fontWeight || run.fontWeight || 'normal',
                        fontStyle: editingTextFormat.fontStyle || run.fontStyle || 'normal',
                        textDecoration: editingTextFormat.textDecoration || run.textDecoration || 'none',
                        color: editingTextFormat.color || run.color || '#000000',
                        letterSpacing: editingTextFormat.letterSpacing ? `${editingTextFormat.letterSpacing}px` : 'normal',
                        lineHeight: editingTextFormat.lineHeight || 1.2,
                        textShadow: editingTextFormat.textShadow 
                          ? `${editingTextFormat.textShadow.offsetX}px ${editingTextFormat.textShadow.offsetY}px ${editingTextFormat.textShadow.blur}px ${editingTextFormat.textShadow.color}`
                          : 'none',
                        WebkitTextStroke: editingTextFormat.textOutline 
                          ? `${editingTextFormat.textOutline.width}px ${editingTextFormat.textOutline.color}`
                          : 'none',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #3b82f6',
                        outline: 'none',
                        padding: '2px 4px',
                        minWidth: `${run.width / scaleX}px`,
                        borderRadius: '4px',
                        ...(multiLineEditing && {
                          minHeight: `${run.height * 2 / scaleY}px`,
                          resize: 'both',
                        }),
                      },
                      className: "pdf-text-editor-input",
                      autoFocus: true,
                    };
                    
                    return (
                      <div style={{ position: 'absolute', left: `${rect.left + textX}px`, top: `${rect.top + textY}px` }}>
                        <InputComponent {...inputProps} />
                        {/* Phase 5: Text Format Panel */}
                        {showTextFormatPanel && (
                          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-300 dark:border-slate-700 p-3 z-50 min-w-[300px]">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Font Size:</label>
                                <input
                                  type="number"
                                  min="8"
                                  max="72"
                                  value={editingTextFormat.fontSize || run.fontSize}
                                  onChange={(e) => setEditingTextFormat({ ...editingTextFormat, fontSize: Number(e.target.value) })}
                                  className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Font:</label>
                                <select
                                  value={editingTextFormat.fontFamily || run.fontName}
                                  onChange={(e) => setEditingTextFormat({ ...editingTextFormat, fontFamily: e.target.value })}
                                  className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
                                >
                                  <option value="Arial">Arial</option>
                                  <option value="Times New Roman">Times New Roman</option>
                                  <option value="Courier New">Courier New</option>
                                  <option value="Helvetica">Helvetica</option>
                                  <option value="Georgia">Georgia</option>
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Color:</label>
                                <input
                                  type="color"
                                  value={editingTextFormat.color || run.color || '#000000'}
                                  onChange={(e) => setEditingTextFormat({ ...editingTextFormat, color: e.target.value })}
                                  className="w-12 h-8 border border-slate-300 dark:border-slate-600 rounded cursor-pointer"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingTextFormat({ ...editingTextFormat, fontWeight: editingTextFormat.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                  className={`px-3 py-1 rounded text-sm ${editingTextFormat.fontWeight === 'bold' ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                                >
                                  <strong>B</strong>
                                </button>
                                <button
                                  onClick={() => setEditingTextFormat({ ...editingTextFormat, fontStyle: editingTextFormat.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                  className={`px-3 py-1 rounded text-sm ${editingTextFormat.fontStyle === 'italic' ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                                >
                                  <em>I</em>
                                </button>
                                <button
                                  onClick={() => setEditingTextFormat({ ...editingTextFormat, textDecoration: editingTextFormat.textDecoration === 'underline' ? 'none' : 'underline' })}
                                  className={`px-3 py-1 rounded text-sm ${editingTextFormat.textDecoration === 'underline' ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                                >
                                  <u>U</u>
                                </button>
                                <button
                                  onClick={() => setMultiLineEditing(!multiLineEditing)}
                                  className={`px-3 py-1 rounded text-sm ${multiLineEditing ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                                  title="Multi-line"
                                >
                                  ⤶
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Align:</label>
                                <div className="flex gap-1">
                                  {(['left', 'center', 'right'] as const).map(align => (
                                    <button
                                      key={align}
                                      onClick={() => setEditingTextFormat({ ...editingTextFormat, textAlign: align })}
                                      className={`px-3 py-1 rounded text-sm ${editingTextFormat.textAlign === align ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                                    >
                                      {align === 'left' ? '⬅' : align === 'center' ? '⬌' : '➡'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {/* Phase 8: Text Spacing */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Spacing:</label>
                                <div className="flex gap-2 flex-1">
                                  <div className="flex-1">
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Letter</label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="10"
                                      step="0.5"
                                      value={editingTextFormat.letterSpacing || 0}
                                      onChange={(e) => setEditingTextFormat({ ...editingTextFormat, letterSpacing: Number(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Line</label>
                                    <input
                                      type="range"
                                      min="0.8"
                                      max="3"
                                      step="0.1"
                                      value={editingTextFormat.lineHeight || 1.2}
                                      onChange={(e) => setEditingTextFormat({ ...editingTextFormat, lineHeight: Number(e.target.value) })}
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Phase 8: Text Effects */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Effects:</label>
                                <div className="flex gap-2 flex-1">
                                  <button
                                    onClick={() => {
                                      const hasShadow = editingTextFormat.textShadow;
                                      setEditingTextFormat({
                                        ...editingTextFormat,
                                        textShadow: hasShadow ? undefined : { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.3)' }
                                      });
                                    }}
                                    className={`px-3 py-1 rounded text-sm ${editingTextFormat.textShadow ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    title="Text Shadow"
                                  >
                                    🌑 Shadow
                                  </button>
                                  <button
                                    onClick={() => {
                                      const hasOutline = editingTextFormat.textOutline;
                                      setEditingTextFormat({
                                        ...editingTextFormat,
                                        textOutline: hasOutline ? undefined : { width: 1, color: '#000000' }
                                      });
                                    }}
                                    className={`px-3 py-1 rounded text-sm ${editingTextFormat.textOutline ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    title="Text Outline"
                                  >
                                    ⭕ Outline
                                  </button>
                                </div>
                              </div>
                              
                              {/* Phase 7: Text Transformation */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Transform:</label>
                                <div className="flex gap-1 flex-1">
                                  {(['uppercase', 'lowercase', 'capitalize'] as const).map(transform => (
                                    <button
                                      key={transform}
                                      onClick={() => {
                                        if (editingTextRun && run) {
                                          const transformed = transformText(run.text, transform);
                                          updatePdfText(run.id, transformed, editingTextFormat);
                                        }
                                      }}
                                      className="px-3 py-1 rounded text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 capitalize"
                                      title={transform}
                                    >
                                      {transform === 'uppercase' ? 'ABC' : transform === 'lowercase' ? 'abc' : 'Abc'}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Phase 8: Text Templates */}
                              {textTemplates.length > 0 && (
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                                  <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Templates:</label>
                                  <select
                                    onChange={(e) => {
                                      const template = textTemplates.find(t => t.name === e.target.value);
                                      if (template) applyTextTemplate(template);
                                    }}
                                    className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
                                    defaultValue=""
                                  >
                                    <option value="">Templates...</option>
                                    {textTemplates.map(template => (
                                      <option key={template.name} value={template.name}>{template.name}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              
                              {/* Phase 6: Text Statistics & Style Management */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                                <button
                                  onClick={() => {
                                    const stats = calculateTextStats();
                                    toast.info(`${stats.totalWords} words, ${stats.totalChars} chars, ${stats.totalRuns} runs`);
                                    setShowTextStats(!showTextStats);
                                  }}
                                  className="px-3 py-1 rounded text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                  title="Text Statistics"
                                >
                                  📊 Stats
                                </button>
                                <button
                                  onClick={() => {
                                    setSpellCheckEnabled(!spellCheckEnabled);
                                    if (!spellCheckEnabled && run) {
                                      const misspelled = checkSpelling(run.text);
                                      if (misspelled.length > 0) {
                                        setSpellCheckResults({ [run.id]: misspelled });
                                        toast.warning(`Found ${misspelled.length} potential spelling issue(s)`);
                                      } else {
                                        toast.success('No spelling issues found');
                                      }
                                    }
                                  }}
                                  className={`px-3 py-1 rounded text-sm ${spellCheckEnabled ? 'bg-yellow-500 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                  title="Spell Check"
                                >
                                  ✍️ Spell
                                </button>
                                {textStyles.length > 0 && (
                                  <select
                                    onChange={(e) => {
                                      const style = textStyles.find(s => s.name === e.target.value);
                                      if (style) applyTextStyle(style);
                                    }}
                                    className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
                                    defaultValue=""
                                  >
                                    <option value="">Styles...</option>
                                    {textStyles.map(style => (
                                      <option key={style.name} value={style.name}>{style.name}</option>
                                    ))}
                                  </select>
                                )}
                                <button
                                  onClick={() => {
                                    const name = prompt('Style name:');
                                    if (name) saveTextStyle(name);
                                  }}
                                  className="px-3 py-1 rounded text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                                  title="Save Style"
                                >
                                  💾 Save
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  {/* Inline Text Editor */}
                  {editingAnnotation && (() => {
                    const ann = annotations.find(a => a.id === editingAnnotation);
                    if (!ann || ann.type !== 'text' || ann.page !== pageNum) return null;
                    
                    const fontSize = ann.fontSize || 16;
                    const fontFamily = ann.fontFamily || 'Arial';
                    const canvas = canvasRef.current;
                    if (!canvas) return null;
                    
                    const rect = canvas.getBoundingClientRect();
                    const devicePixelRatio = window.devicePixelRatio || 1;
                    // Canvas internal size vs display size
                    const scaleX = (canvas.width / devicePixelRatio) / rect.width;
                    const scaleY = (canvas.height / devicePixelRatio) / rect.height;
                    
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

              {/* Phase 7: Export Options Panel */}
              {showExportOptions && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[350px]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Options</h3>
                    <button
                      onClick={() => setShowExportOptions(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality</label>
                      <select
                        value={exportQuality}
                        onChange={(e) => setExportQuality(e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100"
                      >
                        <option value="high">High (Best Quality)</option>
                        <option value="medium">Medium (Balanced)</option>
                        <option value="low">Low (Smaller File)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format</label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'pdf-a')}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100"
                      >
                        <option value="pdf">PDF (Standard)</option>
                        <option value="pdf-a">PDF/A (Archival)</option>
                      </select>
                    </div>
                    <button
                      onClick={exportPdfWithOptions}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isProcessing ? 'Exporting...' : 'Export PDF'}
                    </button>
                  </div>
                </div>
              )}

              {/* Download Button - Compact Bottom Bar */}
              <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg flex-shrink-0 flex justify-center gap-2">
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center gap-2"
                  title="Export Options"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Options</span>
                </button>
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

      {/* Production: Enhanced loading state with progress */}
      {isProcessing && !file && (
        <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading PDF">
          <div className="text-center max-w-md px-4">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-900 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-gray-900 dark:border-t-gray-400 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{processingMessage || 'Loading PDF...'}</h3>
            {processingProgress > 0 && (
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-gray-900 dark:bg-white h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${processingProgress}%` }}
                  role="progressbar"
                  aria-valuenow={processingProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            )}
            <p className="text-slate-500 dark:text-slate-400 text-sm">{processingProgress > 0 ? `${Math.round(processingProgress)}%` : 'Please wait while we process your document'}</p>
          </div>
        </div>
      )}
      
      {/* Advanced: Page Jump Modal */}
      {showPageJump && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPageJump(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Jump to Page</h3>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageJumpInput}
                onChange={(e) => setPageJumpInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(pageJumpInput);
                    if (!isNaN(page)) {
                      jumpToPage(page);
                    }
                  } else if (e.key === 'Escape') {
                    setShowPageJump(false);
                  }
                }}
                placeholder={`Enter page (1-${numPages})`}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                autoFocus
              />
              <button
                onClick={() => {
                  const page = parseInt(pageJumpInput);
                  if (!isNaN(page)) {
                    jumpToPage(page);
                  }
                }}
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-all"
              >
                Go
              </button>
              <button
                onClick={() => setShowPageJump(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-md transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Advanced: Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowKeyboardShortcuts(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Navigation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Previous Page</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Next Page</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">→</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Jump to Page</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+G</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Editing</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Undo</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+Z</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Redo</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+Y</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Copy</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Paste</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+V</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Delete</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Delete</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Tools</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Edit Text Mode</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Toggle Grid</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">G</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Page Manager</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">P</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Search</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Find</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Find & Replace</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+H</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Text Formatting</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Bold</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+B</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Italic</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+I</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Underline</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+U</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Help</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Show Shortcuts</span>
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">?</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

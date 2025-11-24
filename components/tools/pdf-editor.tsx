'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from '@/components/Toast';
import { PdfEngine } from './pdf-engine';

// Import modular components
import type { PdfEditorProps, ToolType, Annotation, PdfTextItem, PdfTextRun } from './pdf-editor/types';
import { PDF_MAX_SIZE, AUTO_SAVE_INTERVAL, DEBOUNCE_DELAY, RENDER_CACHE_SIZE, PDF_SUPPORTED_TYPES, PDF_EXTENSIONS, THUMBNAIL_MAX_PAGES, THUMBNAIL_SCALE } from './pdf-editor/constants';
import { validatePDFFile, logError, measurePerformance, sanitizeTextForPDF, sanitizeFileName, sanitizeInput, hexToRgb, PDFValidationError, PDFProcessingError } from './pdf-editor/utils';
import { exportPdfWithAnnotations } from './pdf-editor/utils/pdfExport';
import { mapTextItemsToRuns, findTextRunAtPosition as findTextRunAtPositionUtil } from './pdf-editor/utils/textExtraction';
import { findCharIndexAtPosition, getSelectedText, getTextSelectionRect } from './pdf-editor/utils/textSelection';
import { handleImageSelect as handleImageSelectUtil } from './pdf-editor/utils/imageHandling';
import { parseContentStream as parseContentStreamUtil } from './pdf-editor/utils/pdfParsing';
import { renderAnnotations as renderAnnotationsUtil } from './pdf-editor/utils/annotationRendering';
import { drawSearchHighlights, drawTextSelection, drawBatchSelection } from './pdf-editor/utils/textHighlighting';
import { findTextInPdf as findTextInPdfUtil, navigateToFindResult as navigateToFindResultUtil, navigateFindResult as navigateFindResultUtil, replaceTextInPdf as replaceTextInPdfUtil } from './pdf-editor/utils/textSearch';
import { updatePdfTextOverlay as updatePdfTextOverlayUtil, updatePdfTextInStream as updatePdfTextInStreamUtil } from './pdf-editor/utils/pdfTextUpdate';
import { getCanvasCoordinates as getCanvasCoordinatesUtil } from './pdf-editor/utils/coordinates';
import { createAnnotationFromTool, getAnnotationSuccessMessage } from './pdf-editor/utils/annotationCreation';
import { rebuildPdfPageWithText as rebuildPdfPageWithTextUtil } from './pdf-editor/utils/pdfRebuild';
import { calculateViewportScale, setupCanvas, renderPageOverlays, manageRenderCache } from './pdf-editor/utils/pageRendering';
import { applyFormatToBatchTextRuns as applyFormatToBatchTextRunsUtil, deleteBatchTextRuns as deleteBatchTextRunsUtil, copyBatchTextRuns as copyBatchTextRunsUtil } from './pdf-editor/utils/batchTextOperations';
import { exportToImage as exportToImageUtil, exportToHTML as exportToHTMLUtil, exportToText as exportToTextUtil, exportPdfWithOptions as exportPdfWithOptionsUtil } from './pdf-editor/utils/pdfExport';
import { calculateTextStats as calculateTextStatsUtil, saveTextStyle as saveTextStyleUtil, applyTextStyle as applyTextStyleUtil, checkSpelling as checkSpellingUtil, transformText as transformTextUtil } from './pdf-editor/utils/textStatistics';
import { usePdfLoader, useTextEditing, useZoom, useCanvas, useAnnotations, useDrawing, usePanning, usePageManagement, useContextMenu, useAnnotationOperations, useBatchAnnotations, useFileHandlers, useKeyboardShortcuts, useAutoSave, useTextEditHistory, useCanvasHandlers, useUIState, useTextFormattingState, useAdvancedFeaturesState } from './pdf-editor/hooks';
import { loadAutoSave as loadAutoSaveUtil, applyTextTemplate as applyTextTemplateUtil } from './pdf-editor/utils/textTemplates';
import { handleUploadAreaClick, handleUploadAreaKeyDown } from './pdf-editor/utils/fileUpload';
import { Toolbar, AIPanel, ComparisonPanel, SocialSharePanel, PerformancePanel, FindReplacePanel, BatchOperationsPanel, ExportOptionsPanel, PageJumpModal, PerformanceDashboard, BinaryAnalysisPanel, RepairPanel, CompressionPanel, OCRPanel, CollaborationPanel, WASMPanel, WorkerPanel, EncryptionPanel, FontPanel, SignaturePanel, OptimizationPanel, CachePanel, TextStatisticsPanel, TextStylesPanel, CloudSyncPanel, PageFeaturesPanel, PageManagerPanel, TemplatesPanel, SettingsPanel, HelpPanel, KeyboardShortcutsPanel, ContextMenu, InlineTextEditor, LayerPanel, HistoryBranchesPanel, StreamProcessingPanel, PdfACompliancePanel, ThumbnailsPanel, TextFormatPanel, TextFormatPanelNew, AnnotationTextEditor, AnnotationsPanel, DownloadBar, FloatingToolbar, LoadingOverlay, FileUploadArea, ErrorStateComponent, StatusNotification, CanvasContainer, PdfTextEditor } from './pdf-editor/components';
import { RichTextEditor } from './pdf-editor/enhancements/richTextEditor';
import { useAITextSuggestions } from './pdf-editor/enhancements/aiTextSuggestions';
import { useMultiCursorEditing } from './pdf-editor/enhancements/multiCursorEditing';

export default function PdfEditor({ toolId }: PdfEditorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  // Use annotations hook
  const {
    annotations,
    selectedAnnotation: selectedAnnotationFromHook,
    selectedAnnotations: selectedAnnotationsFromHook,
    editingAnnotation: editingAnnotationFromHook,
    history,
    historyIndex,
    setAnnotations,
    setSelectedAnnotation: setSelectedAnnotationFromHook,
    setSelectedAnnotations: setSelectedAnnotationsFromHook,
    setEditingAnnotation: setEditingAnnotationFromHook,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    deleteAnnotations,
    clearAnnotations,
    getPageAnnotations,
    selectAnnotation,
    undo,
    redo,
    saveToHistory,
  } = useAnnotations({
    pageNum,
    onAnnotationChange: (newAnnotations) => {
      // Additional logic if needed
    },
  });

  // Keep backward compatibility aliases
  const selectedAnnotation = selectedAnnotationFromHook;
  const selectedAnnotations = selectedAnnotationsFromHook;
  const editingAnnotation = editingAnnotationFromHook;
  const setSelectedAnnotation = setSelectedAnnotationFromHook;
  const setSelectedAnnotations = setSelectedAnnotationsFromHook;
  const setEditingAnnotation = setEditingAnnotationFromHook;
  const [currentText, setCurrentText] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [strokeColor, setStrokeColor] = useState('#FF0000');
  const [fillColor, setFillColor] = useState('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [tool, setTool] = useState<ToolType>(null);
  const [isEditable, setIsEditable] = useState(true);
  // Zoom state (useZoom will be initialized after renderPage is defined)
  const [zoom, setZoom] = useState(1);
  const [zoomMode, setZoomMode] = useState<'custom' | 'fit-width' | 'fit-page' | 'fit-height'>('fit-page');
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  // selectedAnnotation and selectedAnnotations come from useAnnotations hook above
  const [editingText, setEditingText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  
  // Mouse Pan Feature
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [freehandPath, setFreehandPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  
  const [batchMode, setBatchMode] = useState(false);
  const [copiedAnnotations, setCopiedAnnotations] = useState<Annotation[]>([]);
  
  // Define getCanvasCoordinates before useContextMenu hook
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    return getCanvasCoordinatesUtil(e, canvasRef, viewportRef);
  };
  
  // Advanced: Context menu for annotations - using useContextMenu hook (must be before useBatchAnnotations)
  const {
    contextMenu,
    setContextMenu,
    lockedAnnotations,
    annotationGroups,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
    ungroupAnnotations,
    alignAnnotations,
    distributeAnnotations,
    handleCanvasContextMenu,
  } = useContextMenu({
    annotations,
    selectedAnnotations,
    pageNum,
    onAnnotationChange: setAnnotations,
    onHistorySave: saveToHistory,
    onSelectionChange: (ids) => setSelectedAnnotations(new Set(ids)),
    tool,
    isDrawingPolygon,
    polygonPoints,
    strokeColor,
    fillColor,
    setPolygonPoints,
    setIsDrawingPolygon,
    setTool,
    setSelectedAnnotation,
    getCanvasCoordinates,
  });
  
  // Batch annotation operations - using hook
  const {
    batchSelectAnnotations,
    batchDeleteAnnotations,
    batchApplyFormat,
  } = useBatchAnnotations({
    annotations,
    selectedAnnotation,
    selectedAnnotations,
    copiedAnnotations,
    pageNum,
    setAnnotations,
    setCopiedAnnotations,
    setSelectedAnnotation,
    setSelectedAnnotations,
    saveToHistory,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
  });
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [watermarkText, setWatermarkText] = useState('DRAFT');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  
  // Store current viewport for coordinate conversion
  const viewportRef = useRef<{ width: number; height: number; scale: number } | null>(null);
  const [textSelection, setTextSelection] = useState<{ start: number; end: number; runId: string } | null>(null);
  
  // Use text editing hook
  const {
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
    findTextRunAtPosition: findTextRunAtPositionFromHook,
  } = useTextEditing({
    pdfDocRef,
    canvasRef,
    pageNum,
  });

  // Use PDF loader hook
  const { loadPDF: loadPDFFromHook } = usePdfLoader({
    setFile,
    setPdfUrl,
    setIsProcessing,
    setProcessingProgress,
    setProcessingMessage,
    setNumPages,
    setPageNum,
    setIsEditable,
    setPageThumbnails,
    setErrorState,
    setOperationStatus,
    pdfDocRef,
    pdfLibDocRef,
    pdfEngineRef,
    renderPage,
    extractTextLayer,
    autoSaveEnabled,
    loadAutoSave,
  });
  
  // Advanced Text Editing - Phase 4
  const [isSelectingText, setIsSelectingText] = useState(false);
  const [textSelectionStart, setTextSelectionStart] = useState<{ x: number; y: number; runId: string; charIndex: number } | null>(null);
  const [textSelectionEnd, setTextSelectionEnd] = useState<{ x: number; y: number; runId: string; charIndex: number } | null>(null);
  const [editingCharIndex, setEditingCharIndex] = useState<number | null>(null);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [findResults, setFindResults] = useState<Array<{ runId: string; startIndex: number; endIndex: number; page: number; text: string }>>([]);
  const [searchAllPages, setSearchAllPages] = useState(false);
  const [currentFindIndex, setCurrentFindIndex] = useState(-1);
  
  // Advanced Text Editor features
  const [showTextStatistics, setShowTextStatistics] = useState(false);
  const [textStatistics, setTextStatistics] = useState<any>(null);
  const [realTimePreview, setRealTimePreview] = useState(true);
  const [useRichTextEditor, setUseRichTextEditor] = useState(false); // Toggle for rich text editor
  const [highlightedSearchResults, setHighlightedSearchResults] = useState<Array<{ runId: string; startIndex: number; endIndex: number; page: number }>>([]);
  const [selectedTextRuns, setSelectedTextRuns] = useState<Set<string>>(new Set());
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
  const renderCacheRef = useRef<Map<number, { imageData: string; timestamp: number }>>(new Map());
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  const [textEditHistory, setTextEditHistory] = useState<Array<{ runId: string; oldText: string; newText: string; format?: any }>>([]);
  const [textEditHistoryIndex, setTextEditHistoryIndex] = useState(-1);
  
  const [pageJumpInput, setPageJumpInput] = useState('');
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

  useEffect(() => {
    if (selectedAnnotation || selectedAnnotations.size > 0) {
      const selected = selectedAnnotation 
        ? annotations.find(a => a.id === selectedAnnotation)
        : annotations.find(a => selectedAnnotations.has(a.id));
      
      if (selected && selected.type === 'text' && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        setFloatingToolbarPosition({
          x: rect.left + (selected.x || 0),
          y: rect.top + (selected.y || 0) - 50
        });
        setShowFloatingToolbar(true);
        setSelectedTextForFormatting(selected.id);
      } else {
        setShowFloatingToolbar(false);
        setSelectedTextForFormatting(null);
      }
    } else {
      setShowFloatingToolbar(false);
      setSelectedTextForFormatting(null);
    }
  }, [selectedAnnotation, selectedAnnotations, annotations]);

  const applyFormatToSelectedText = useCallback((format: Partial<Annotation>) => {
    applyFormatToSelectedTextFromHook(format, selectedTextForFormatting, selectedAnnotations);
  }, [applyFormatToSelectedTextFromHook, selectedTextForFormatting, selectedAnnotations]);

  
  // Use page management hook
  const {
    pageRotations,
    deletedPages,
    insertedPages,
    pageHeaders,
    pageFooters,
    pageBackgroundColors,
    showPageNumbering,
    pageNumberFormat,
    pageNumberPosition,
    setShowPageNumbering,
    setPageNumberFormat,
    setPageNumberPosition,
    rotatePage,
    deletePage,
    insertBlankPage,
    addPageHeader,
    addPageFooter,
    applyPageNumbering,
    setPageBackground,
  } = usePageManagement({
    numPages,
    pageNum,
    setPageNum,
    annotations,
    setAnnotations,
    onHistorySave: saveToHistory,
  });
  
  const [selectedStamp, setSelectedStamp] = useState<string>('approved');
  const [stampSize, setStampSize] = useState(100);
  const stamps = [
    { id: 'approved', text: 'APPROVED', color: '#10b981' },
    { id: 'rejected', text: 'REJECTED', color: '#ef4444' },
    { id: 'confidential', text: 'CONFIDENTIAL', color: '#f59e0b' },
    { id: 'draft', text: 'DRAFT', color: '#6b7280' },
    { id: 'final', text: 'FINAL', color: '#3b82f6' },
    { id: 'void', text: 'VOID', color: '#ef4444' },
    { id: 'copy', text: 'COPY', color: '#8b5cf6' },
    { id: 'original', text: 'ORIGINAL', color: '#10b981' },
  ];
  
  const [measurementUnit, setMeasurementUnit] = useState<'px' | 'mm' | 'cm' | 'in'>('px');
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);
  const [rulerLength, setRulerLength] = useState(200); // Default ruler length in pixels
  
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  
  // Advanced: Performance - Virtual scrolling
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]));
  const [pageRenderQueue, setPageRenderQueue] = useState<number[]>([]);
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set([1]));
  
  // Advanced: Form filling
  const [formFieldType, setFormFieldType] = useState<'text' | 'checkbox' | 'radio' | 'dropdown' | 'date' | 'number'>('text');
  const [formFieldName, setFormFieldName] = useState('');
  const [formFieldRequired, setFormFieldRequired] = useState(false);
  const [formFieldOptions, setFormFieldOptions] = useState<string[]>([]);
  const [showFormFieldPanel, setShowFormFieldPanel] = useState(false);
  
  // Advanced: Comments system
  const [commentThreads, setCommentThreads] = useState<Map<string, Array<{ id: string; text: string; author?: string; timestamp: number }>>>(new Map());
  const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  
  // Advanced: Annotation templates
  const [annotationTemplates, setAnnotationTemplates] = useState<Array<{ name: string; annotation: Partial<Annotation> }>>([
    { name: 'Signature Box', annotation: { type: 'signature', width: 200, height: 80, strokeColor: '#000000' } },
    { name: 'Date Field', annotation: { type: 'form-field', formFieldType: 'date', width: 150, height: 30 } },
    { name: 'Checkbox', annotation: { type: 'form-field', formFieldType: 'checkbox', width: 20, height: 20 } },
    { name: 'Text Field', annotation: { type: 'form-field', formFieldType: 'text', width: 200, height: 30 } },
    { name: 'Approved Stamp', annotation: { type: 'stamp', text: 'APPROVED', color: '#10b981', width: 120, height: 120 } },
    { name: 'Confidential Watermark', annotation: { type: 'watermark', watermarkText: 'CONFIDENTIAL', watermarkOpacity: 0.3 } },
  ]);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  
  // Advanced: Batch operations
  const [batchOperationMode, setBatchOperationMode] = useState<'select' | 'move' | 'delete' | 'format' | null>(null);
  const [batchSelectionBox, setBatchSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  
  // Advanced: Mobile optimizations
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Advanced: Performance - Intersection Observer for lazy loading
  const pageObserverRef = useRef<IntersectionObserver | null>(null);
  
  // Advanced: Settings and preferences
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoSave: false,
    autoSaveInterval: 30, // seconds
    defaultZoom: 'fit-page' as 'custom' | 'fit-width' | 'fit-page' | 'fit-height',
    defaultFontSize: 16,
    defaultFontFamily: 'Arial',
    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
    showRulers: false,
    showTooltips: true,
    enableAnimations: true,
    exportQuality: 'high' as 'low' | 'medium' | 'high',
    exportFormat: 'pdf' as 'pdf' | 'pdf-a',
  });
  
  // Advanced: Help and tutorial
  const [showHelp, setShowHelp] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  
  // Advanced: Better error states
  const [errorState, setErrorState] = useState<{ message: string; code?: string; retry?: () => void } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Advanced: Operation status
  const [operationStatus, setOperationStatus] = useState<{ type: string; message: string; progress?: number } | null>(null);

  // Page management functions are now provided by usePageManagement hook above

  // Advanced: Context menu for annotations - using useContextMenu hook
  const {
    contextMenu,
    setContextMenu,
    lockedAnnotations,
    annotationGroups,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
    ungroupAnnotations,
    alignAnnotations,
    distributeAnnotations,
    handleCanvasContextMenu,
  } = useContextMenu({
    annotations,
    selectedAnnotations,
    pageNum,
    onAnnotationChange: setAnnotations,
    onHistorySave: saveToHistory,
    onSelectionChange: (ids) => setSelectedAnnotations(new Set(ids)),
    tool,
    isDrawingPolygon,
    polygonPoints,
    strokeColor,
    fillColor,
    setPolygonPoints,
    setIsDrawingPolygon,
    setTool,
    setSelectedAnnotation,
    getCanvasCoordinates,
  });

  // Context menu functions are now provided by useContextMenu hook above
  
  // Refs (must be defined before hooks that use them)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const pdfLibDocRef = useRef<PDFDocument | null>(null);
  const pdfEngineRef = useRef<import('./pdf-engine').PdfEngine | null>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  // Mobile detection is handled by useUIState hook

  const lastClickTimeRef = useRef<number>(0);
  const lastClickCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const CLICK_DELAY = 300; // ms between clicks to be considered double-click
  const DOUBLE_CLICK_DISTANCE = 10; // pixels - max distance for double-click

  const applyAnnotationTemplate = useCallback((template: { name: string; annotation: Partial<Annotation> }) => {
    applyAnnotationTemplateFromHook(template, pageNum);
  }, [applyAnnotationTemplateFromHook, pageNum]);

  const handleBatchSelection = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    handleBatchSelectionFromHook(startX, startY, endX, endY, pageNum, setSelectedAnnotations);
  }, [handleBatchSelectionFromHook, pageNum, setSelectedAnnotations]);

  const loadPDF = useCallback(async (fileToLoad?: File) => {
    await loadPDFFromHook(fileToLoad);
  }, [loadPDFFromHook]);

  // Use file handlers hook
  const { handleFileSelect, handleDragOver, handleDrop } = useFileHandlers({
    fileInputRef,
    pdfUrl,
    setFile,
    setPdfUrl,
    setAnnotations,
    setHistory,
    setHistoryIndex,
    setPageNum,
    setIsEditable,
    setZoom,
    setPdfTextRuns,
    setPdfTextItems,
    setTextRunsCache,
    setNumPages,
    setErrorState,
    loadPDF,
  });
  

  useEffect(() => {
    if (!file) {
      // Cleanup when file is removed
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      pdfDocRef.current = null;
      pdfLibDocRef.current = null;
      // Cleanup engine
      if (pdfEngineRef.current) {
        pdfEngineRef.current.clear();
        pdfEngineRef.current = null;
      }
      setNumPages(0);
      setPageThumbnails([]);
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
      // Cleanup engine
      if (pdfEngineRef.current) {
        pdfEngineRef.current.clear();
        pdfEngineRef.current = null;
      }
    };
  }, [file, pdfUrl]);

  // Phase 2.1: Extract text layer - now using hook (extractTextLayer from useTextEditing)


  // Text utilities - using hook and imported functions directly
  const findTextRunAtPosition = findTextRunAtPositionFromHook;
  
  const findCharIndexAtPositionLocal = (x: number, run: PdfTextRun, pageNumber: number): number => {
    if (!canvasRef.current) return 0;
    return findCharIndexAtPosition(x, run, canvasRef.current);
  };

  const getSelectedTextLocal = getSelectedText;

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
      
      // Calculate scale using utility function
      const scale = calculateViewportScale(containerWidth, containerHeight, pdfWidth, pdfHeight, zoom, zoomMode);
      
      // Get viewport at calculated scale
      const viewport = page.getViewport({ scale });
      
      // Store viewport for coordinate conversion
      viewportRef.current = {
        width: viewport.width,
        height: viewport.height,
        scale: scale
      };
      
      // Setup canvas using utility function
      const devicePixelRatio = window.devicePixelRatio || 1;
      setupCanvas(canvas, context, viewport, devicePixelRatio);

      // Engine Integration: Use advanced rendering pipeline if available
      if (pdfEngineRef.current && progressiveRendering) {
        try {
          const pipeline = pdfEngineRef.current.getRenderingPipeline();
          await pipeline.renderPage(page, canvas, viewport, {
            useCache: useCache,
            progressive: progressiveRendering,
            quality: renderingQuality,
          });
        } catch (error) {
          console.warn('Progressive rendering failed, falling back to standard:', error);
          // Fallback to standard rendering
      await page.render({ 
        canvasContext: context, 
        viewport,
      } as any).promise;
        }
      } else {
        // Standard rendering
        await page.render({ 
          canvasContext: context, 
          viewport,
        } as any).promise;
      }
      
      // Phase 2.1: Extract text layer after rendering (with correct viewport)
      await extractTextLayer(pageNumber, viewport);
      
      // Draw annotations (Advanced: Filter hidden layers)
      const pageAnnotations = annotations.filter(ann => ann.page === pageNumber && !hiddenLayers.has(ann.id));
      
      // Render all overlays using utility function
      renderPageOverlays({
        context,
        pageNumber,
        pageNum,
        annotations,
        pageAnnotations,
        hiddenLayers,
        selectedAnnotation,
        selectedAnnotations,
        lockedAnnotations,
        pdfTextRuns,
        textEditMode,
        tool,
        selectedTextRun,
        editingTextRun,
        textSelectionStart,
        textSelectionEnd,
        highlightedSearchResults,
        findResults,
        currentFindIndex,
        selectedTextRuns,
        spellCheckEnabled,
        spellCheckResults,
        strokeColor,
        fillColor,
        highlightColor,
        strokeWidth,
        hexToRgb,
        renderAnnotationsUtil,
        drawSearchHighlights,
        drawTextSelection,
        drawBatchSelection,
        viewport,
      });
      
      // Manage render cache using utility function
      manageRenderCache(renderCacheRef, pageNumber, canvas, annotations, CACHE_EXPIRY, RENDER_CACHE_SIZE);
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  // Use zoom hook (after renderPage is defined)
  const {
    zoom: zoomFromHook,
    zoomMode: zoomModeFromHook,
    setZoom: setZoomFromHook,
    setZoomMode: setZoomModeFromHook,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useZoom({
    containerRef,
    pdfWidth: viewportRef.current?.width ? viewportRef.current.width / (viewportRef.current.scale || 1) : undefined,
    pdfHeight: viewportRef.current?.height ? viewportRef.current.height / (viewportRef.current.scale || 1) : undefined,
    renderPage,
    pageNum,
  });

  // Sync zoom state with hook
  useEffect(() => {
    if (zoomFromHook !== zoom) setZoom(zoomFromHook);
    if (zoomModeFromHook !== zoomMode) setZoomMode(zoomModeFromHook);
  }, [zoomFromHook, zoomModeFromHook, zoom, zoomMode]);

  useEffect(() => {
    if (pdfDocRef.current && pageNum > 0) {
      measurePerformance(`renderPage-${pageNum}`, () => renderPage(pageNum));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, annotations, zoom, selectedAnnotation, selectedAnnotations]);

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

  // CRITICAL: Re-render page when zoom or zoomMode changes (use requestAnimationFrame for smooth zoom)
  useEffect(() => {
    if (pdfDocRef.current && pageNum > 0 && file) {
      const rafId = requestAnimationFrame(() => {
        renderPage(pageNum, false); // Don't use cache when zooming for immediate feedback
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [zoom, zoomMode, pageNum, file]);

  // Use utility function for coordinate conversion
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    return getCanvasCoordinatesUtil(e, canvasRef, viewportRef);
  };

  // Canvas mouse handlers are now provided by useCanvasHandlers hook (see below)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageSelectUtil(e, {
      file: e.target.files?.[0]!,
      canvasRef,
      pageNum,
      annotations,
      setAnnotations,
      saveToHistory,
    });
  };

  const handleDownload = async () => {
    await exportPdfWithAnnotations(
      pdfLibDocRef,
      annotations,
      file,
      highlightColor,
      strokeColor,
      fillColor,
      strokeWidth,
      setIsProcessing
    );
  };

  // hexToRgb is imported from utils.ts

  // removeAnnotation is now provided by useAnnotationOperations hook
  const removeAnnotation = removeAnnotationFromHook;

  const clearAllAnnotations = () => {
    if (confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([]);
      saveToHistory([]);
      toast.success('All annotations cleared');
    }
  };

  // Text update functions - using utility functions directly
  // Wrapper functions removed - using utility functions with inline parameters
  const rebuildPdfPageWithText = async (
    pageNumber: number,
    textModifications: Array<{ runId: string; newText: string; format?: any }>
  ) => {
    return rebuildPdfPageWithTextUtil(
      pageNumber,
      textModifications,
      pdfLibDocRef,
      pdfDocRef,
      pdfTextRuns,
      pdfEngineRef,
      file,
      pdfUrl,
      setPdfUrl,
      (doc: PDFDocument | null) => { pdfLibDocRef.current = doc; },
      renderPage
    );
  };

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
    
    updatePdfTextOverlayUtil(
      runId,
      newText,
      run,
      pageNum,
      annotations,
      canvasRef,
      format,
      setAnnotations,
      saveToHistory,
      setTextEditHistory,
      textEditHistoryIndex,
      setTextEditHistoryIndex
    );
  };

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
    const runs = pdfTextRuns[pageNum] || [];
    const run = runs.find(r => r.id === runId);
    if (!run) return;
    
    await updatePdfTextInStreamUtil(
      runId,
      newText,
      run,
      pageNum,
      pdfTextRuns,
      pdfEngineRef,
      pdfLibDocRef,
      format,
      rebuildPdfPageWithText,
      renderPage,
      setPdfTextRuns,
      saveTextEditToHistory,
      updatePdfTextOverlay
    );
  };

  // updatePdfText is now just an alias for updatePdfTextInStream
  // updatePdfText wrapper removed - using updatePdfTextInStream directly

  // Batch Text Operations - using utility functions (already defined above)

  // Text edit history - using hook
  const {
    undoTextEdit,
    redoTextEdit,
    saveTextEditToHistory,
  } = useTextEditHistory({
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
  });

  // Text statistics and style functions - using utility functions directly (wrappers removed)
  const calculateTextStats = calculateTextStatsUtil.bind(null, pdfTextRuns, pageNum);
  const checkSpelling = checkSpellingUtil;
  const transformText = transformTextUtil;
  
  // Wrapper functions that need toast notifications
  const saveTextStyle = (name: string) => {
    if (!editingTextFormat || Object.keys(editingTextFormat).length === 0) {
      toast.warning('No format to save');
      return;
    }
    saveTextStyleUtil(name, editingTextFormat, setTextStyles);
    toast.success(`Text style "${name}" saved`);
  };

  const applyTextStyle = (style: { name: string; format: any }) => {
    applyTextStyleUtil(style, setEditingTextFormat);
    toast.success(`Applied style "${style.name}"`);
  };

  // Auto-save - using hook
  useAutoSave({
    autoSaveEnabled,
    annotations,
    pageNum,
    pdfTextRuns,
    pdfLibDocRef,
    file,
  });

  // Load auto-save and apply template - using utility functions directly (wrappers removed)

  // Export functions - using utility functions directly (wrappers removed)

  // saveTextEditToHistory is now from useTextEditHistory hook

  // Phase 4.6: Find text in PDF (Advanced: with regex support)
  // Enhanced: Search across all pages
  // Use utility function for text search
  const findTextInPdf = (searchText: string, searchAllPages: boolean = false) => {
    if (!searchText.trim()) {
      setFindResults([]);
      setCurrentFindIndex(-1);
      setHighlightedSearchResults([]);
      return;
    }
    
    const results = findTextInPdfUtil(searchText, pdfTextRuns, {
      useRegex,
      caseSensitive,
      wholeWords,
      searchAllPages,
      currentPage: pageNum,
    });
    
    // Convert to format expected by component
    const formattedResults = results.map(r => ({
      ...r,
      text: r.text || '', // Ensure text property exists
    }));
    
    const highlighted = results.map(r => ({
      runId: r.runId,
      startIndex: r.startIndex,
      endIndex: r.endIndex,
      page: r.page,
    }));
    
    setFindResults(formattedResults);
    setHighlightedSearchResults(highlighted);
    
    if (results.length > 0) {
      setCurrentFindIndex(0);
      navigateToFindResultLocal(0);
      toast.success(`Found ${results.length} result(s)${searchAllPages ? ' across all pages' : ' on this page'}`);
    } else {
      toast.info('No results found');
    }
  };

  // Navigate to find results - using utility functions
  const navigateToFindResultLocal = (index: number) => {
    navigateToFindResultUtil(
      index,
      findResults,
      pdfTextRuns,
      pageNum,
      setPageNum,
      setSelectedTextRun,
      setTextSelectionStart,
      setTextSelectionEnd,
      setCurrentFindIndex,
      renderPage
    );
  };

  const navigateFindResultLocal = (direction: 'next' | 'prev') => {
    if (findResults.length === 0) {
      toast.warning('No search results');
      return;
    }
    navigateFindResultUtil(direction, findResults, currentFindIndex, navigateToFindResultLocal);
  };

  // Replace text in PDF - using utility function
  const replaceTextInPdf = async (searchText: string, replaceText: string) => {
    if (!searchText.trim()) return;
    
    await replaceTextInPdfUtil(
      searchText,
      replaceText,
      pdfEngineRef,
      pdfTextRuns,
      pageNum,
      numPages,
      file,
      pdfUrl,
      setPdfUrl,
      pdfLibDocRef,
      extractTextLayer,
      renderPage,
      updatePdfTextInStream,
      findTextInPdf,
      caseSensitive,
      wholeWords,
      useRegex
    );
    
    // Show toast messages based on result
    if (pdfEngineRef.current) {
      const result = await pdfEngineRef.current.searchAndReplace(searchText, replaceText, {
        caseSensitive,
        wholeWords,
        regex: useRegex,
      });
      if (result.success) {
        if (result.replacements > 0) {
          toast.success(`Replaced ${result.replacements} occurrence(s) across all pages`);
        } else {
          toast.info('No text to replace');
        }
      } else {
        toast.error(result.error || 'Failed to replace text');
      }
    } else {
      // Legacy method - check if any replacements were made
      const runs = pdfTextRuns[pageNum] || [];
      let replaced = 0;
      runs.forEach(run => {
        if (run.text.includes(searchText)) {
          replaced++;
        }
      });
      if (replaced > 0) {
        toast.success(`Replaced ${replaced} occurrence(s)`);
      } else {
        toast.info('No text to replace');
      }
    }
  };

  const navigateFindResults = (direction: 'next' | 'prev') => {
    navigateFindResultLocal(direction);
  };

  // Use annotation operations hook
  const {
    copyAnnotations,
    pasteAnnotations,
    removeAnnotation: removeAnnotationFromHook,
    removeSelectedAnnotations,
    applyFormatToSelectedText: applyFormatToSelectedTextFromHook,
    applyAnnotationTemplate: applyAnnotationTemplateFromHook,
    handleBatchSelection: handleBatchSelectionFromHook,
  } = useAnnotationOperations({
    annotations,
    selectedAnnotation,
    selectedAnnotations,
    copiedAnnotations,
    pageNum,
    setAnnotations,
    setCopiedAnnotations,
    setSelectedAnnotation,
    setSelectedAnnotations,
    saveToHistory,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
  });

  // Canvas handlers - using hook
  const {
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
  } = useCanvasHandlers({
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
    findCharIndexAtPosition: findCharIndexAtPositionLocal,
    getSelectedText: getSelectedTextLocal,
    viewportRef,
  });

  // Keyboard shortcuts - using hook
  useKeyboardShortcuts({
    tool,
    textEditMode,
    showGrid,
    showPageManager,
    showPageJump,
    showKeyboardShortcuts,
    showHelp,
    showSettings,
    showFindReplace,
    selectedAnnotation,
    selectedAnnotations,
    annotations,
    textEditHistory,
    textEditHistoryIndex,
    setTool,
    setTextEditMode,
    setShowGrid,
    setShowPageManager,
    setShowPageJump,
    setShowKeyboardShortcuts,
    setShowHelp,
    setShowSettings,
    setShowFindReplace,
    undo,
    redo,
    copyAnnotations,
    pasteAnnotations,
    removeAnnotation: removeAnnotationFromHook,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
    setAnnotations,
    saveToHistory,
    setSelectedAnnotations,
    setSelectedAnnotation,
    undoTextEdit,
    redoTextEdit,
    fontWeight,
    fontStyle,
    textDecoration,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
  });

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-slate-900 overflow-hidden" style={{ height: '100%', minHeight: '800px' }}>
      {/* File Upload - Premium Design - Using extracted component */}
      {!file && (
        <FileUploadArea
          fileInputRef={fileInputRef}
          onFileSelect={handleFileSelect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onUploadAreaClick={handleUploadAreaClick}
          onUploadAreaKeyDown={handleUploadAreaKeyDown}
        />
      )}

      {file && (
        <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-100 dark:bg-slate-900" style={{ height: '100%', minHeight: '800px' }}>
          {/* Error State - Using extracted component */}
          <ErrorStateComponent
            errorState={errorState}
            isRetrying={isRetrying}
            setIsRetrying={setIsRetrying}
            onDismiss={() => setErrorState(null)}
          />

          {/* Operation Status & View-Only Warning - Using extracted component */}
          <StatusNotification
            operationStatus={operationStatus}
            isEditable={isEditable}
          />

          {/* Main Editor Layout - iLovePDF Style */}
          <div className="flex-1 flex relative overflow-hidden" style={{ height: '100%', minHeight: '600px' }}>
            {/* Sidebar - Overlay Style (iLovePDF) */}
            {/* Advanced: Layer Panel */}
            <LayerPanel
              show={showLayerPanel}
              annotations={annotations}
              pageNum={pageNum}
              selectedAnnotation={selectedAnnotation}
              setSelectedAnnotation={setSelectedAnnotation}
              hiddenLayers={hiddenLayers}
              setHiddenLayers={setHiddenLayers}
              setAnnotations={setAnnotations}
              saveToHistory={saveToHistory}
              renderPage={renderPage}
            />
            
            <ThumbnailsPanel
              show={showThumbnails}
              numPages={numPages}
              pageNum={pageNum}
              setPageNum={setPageNum}
              pageThumbnails={pageThumbnails}
            />

            {/* Main Editor Area - iLovePDF Style Full Screen */}
            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900 w-full" style={{ height: '100%', minHeight: '600px' }}>
              {/* Compact Toolbar - Now Modular */}
              <Toolbar
                tool={tool}
                setTool={setTool}
                isEditable={isEditable}
                showPageManager={showPageManager}
                setShowPageManager={setShowPageManager}
                showTemplatesPanel={showTemplatesPanel}
                setShowTemplatesPanel={setShowTemplatesPanel}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showHelp={showHelp}
                setShowHelp={setShowHelp}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                showPageFeatures={showPageFeatures}
                setShowPageFeatures={setShowPageFeatures}
                showAIPanel={showAIPanel}
                setShowAIPanel={setShowAIPanel}
                showPerformancePanel={showPerformancePanel}
                setShowPerformancePanel={setShowPerformancePanel}
                textEditMode={textEditMode}
                setTextEditMode={setTextEditMode}
                imageInputRef={imageInputRef}
                currentText={currentText}
                setCurrentText={setCurrentText}
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
                fontSize={fontSize}
                setFontSize={setFontSize}
                textAlign={textAlign}
                setTextAlign={setTextAlign}
                textColor={textColor}
                setTextColor={setTextColor}
                fontWeight={fontWeight}
                setFontWeight={setFontWeight}
                fontStyle={fontStyle}
                setFontStyle={setFontStyle}
                textDecoration={textDecoration}
                setTextDecoration={setTextDecoration}
                highlightColor={highlightColor}
                setHighlightColor={setHighlightColor}
                strokeColor={strokeColor}
                setStrokeColor={setStrokeColor}
                strokeWidth={strokeWidth}
                setStrokeWidth={setStrokeWidth}
                watermarkText={watermarkText}
                setWatermarkText={setWatermarkText}
                watermarkOpacity={watermarkOpacity}
                setWatermarkOpacity={setWatermarkOpacity}
                selectedStamp={selectedStamp}
                setSelectedStamp={setSelectedStamp}
                stampSize={stampSize}
                setStampSize={setStampSize}
                measurementUnit={measurementUnit}
                setMeasurementUnit={setMeasurementUnit}
                formFieldType={formFieldType}
                setFormFieldType={setFormFieldType}
                formFieldName={formFieldName}
                setFormFieldName={setFormFieldName}
                formFieldRequired={formFieldRequired}
                setFormFieldRequired={setFormFieldRequired}
                formFieldOptions={formFieldOptions}
                setFormFieldOptions={setFormFieldOptions}
                polygonPoints={polygonPoints}
                setPolygonPoints={setPolygonPoints}
                setIsDrawingPolygon={setIsDrawingPolygon}
                textTemplates={textTemplates}
                applyTextTemplate={applyTextTemplate}
                handleImageSelect={handleImageSelect}
                renderPage={renderPage}
                pageNum={pageNum}
                zoom={zoom}
                setZoom={setZoom}
                zoomMode={zoomMode}
                setZoomMode={setZoomMode}
                toast={toast}
              />
              
              {/* Legacy Toolbar Content - REMOVED (Now using Toolbar component) - All functionality moved to Toolbar component */}
              <TextStatisticsPanel
                show={showTextStatistics}
                onClose={() => {
                  setShowTextStatistics(false);
                  setTextStatistics(null);
                }}
                textStatistics={textStatistics}
              />

              <TextStylesPanel
                show={showTextStyles}
                onClose={() => setShowTextStyles(false)}
                pdfEngineRef={pdfEngineRef}
                editingTextRun={editingTextRun}
                applyTextStyle={applyTextStyle}
              />

              {/* God Level: AI Panel */}

              {/* God Level: Collaboration Panel */}
              <CollaborationPanel
                show={showCollaboration}
                onClose={() => setShowCollaboration(false)}
                pdfEngineRef={pdfEngineRef}
                collaborationSession={collaborationSession}
                setCollaborationSession={setCollaborationSession}
              />

              <OCRPanel
                show={showOCRPanel}
                onClose={() => setShowOCRPanel(false)}
                pdfEngineRef={pdfEngineRef}
              />

              <CloudSyncPanel
                show={showCloudSync}
                onClose={() => setShowCloudSync(false)}
                pdfEngineRef={pdfEngineRef}
                file={file}
              />

              {/* AI-Powered Features Panel - Now Modular */}
              <AIPanel
                showAIPanel={showAIPanel}
                setShowAIPanel={setShowAIPanel}
                editingTextRun={editingTextRun}
                editingTextValue={editingTextValue}
                setEditingTextValue={setEditingTextValue}
                cursorPosition={cursorPosition}
                aiSuggestions={aiSuggestions}
                setAiSuggestions={setAiSuggestions}
                pdfEngineRef={pdfEngineRef}
                file={file}
                pageNum={pageNum}
                renderPage={renderPage}
                setShowSocialShare={setShowSocialShare}
                setShowPdfComparison={setShowPdfComparison}
                toast={toast}
              />

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
                          if (e.key === 'Enter' && !e.shiftKey) {
                            findTextInPdf(findText, searchAllPages);
                          } else if (e.key === 'Enter' && e.shiftKey) {
                            navigateFindResultLocal('prev');
                          } else if (e.key === 'Escape') {
                            setShowFindReplace(false);
                          }
                        }}
                        placeholder="Find..."
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                      <button
                        onClick={() => findTextInPdf(findText, searchAllPages)}
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
                          checked={searchAllPages}
                          onChange={(e) => setSearchAllPages(e.target.checked)}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">All Pages</span>
                      </label>
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
                    {/* Search Results List */}
                    {findResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-md">
                        <div className="p-2 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                          Results ({findResults.length})
                        </div>
                        {findResults.map((result, index) => (
                          <button
                            key={`${result.runId}-${result.startIndex}-${index}`}
                            onClick={() => navigateToFindResultLocal(index)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700 ${
                              index === currentFindIndex ? 'bg-blue-100 dark:bg-blue-900' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Page {result.page + 1}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-500">
                                {index + 1}/{findResults.length}
                              </span>
                            </div>
                            <div className="text-slate-800 dark:text-slate-200 mt-1 truncate">
                              ...{result.text}...
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {findResults.length > 0 && (
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          {currentFindIndex + 1} of {findResults.length} result(s)
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (findResults.length === 0) {
                                toast.warning('No search results');
                                return;
                              }
                              navigateFindResultUtil('prev', findResults, currentFindIndex, navigateToFindResultLocal);
                            }}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            title="Previous (Shift+Enter)"
                          >
                            ↑ Prev
                          </button>
                          <button
                            onClick={() => {
                              if (findResults.length === 0) {
                                toast.warning('No search results');
                                return;
                              }
                              navigateFindResultUtil('next', findResults, currentFindIndex, navigateToFindResultLocal);
                            }}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
                            title="Next (Enter)"
                          >
                            Next ↓
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Canvas - iLovePDF Style Full Screen - Using extracted component */}
              <CanvasContainer
                containerRef={containerRef}
                canvasRef={canvasRef}
                tool={tool}
                selectedAnnotation={selectedAnnotation}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onContextMenu={handleCanvasContextMenu}
                isPanning={isPanning}
                spacePressed={spacePressed}
              >
                  
                  {/* Advanced: Floating Text Formatting Toolbar - Using extracted component */}
                  {showFloatingToolbar && floatingToolbarPosition && selectedTextForFormatting && (() => {
                    const selected = annotations.find(a => a.id === selectedTextForFormatting);
                    if (!selected || selected.type !== 'text') return null;
                    
                    return (
                      <FloatingToolbar
                        annotation={selected}
                        position={floatingToolbarPosition}
                        onFormatChange={applyFormatToSelectedText}
                        onApplyFormat={applyFormatToSelectedText}
                      />
                    );
                  })()}

                  {/* Phase 2.5 & 5: PDF Text Editor - Inline editing for PDF text */}
                  {/* Enhanced: Rich Text Editor option */}
                  {editingTextRun && pdfTextRuns[pageNum] && (() => {
                    const run = pdfTextRuns[pageNum].find(r => r.id === editingTextRun);
                    if (!run || run.page !== pageNum) return null;
                    
                    return (
                      <PdfTextEditor
                        editingTextRun={editingTextRun}
                        pdfTextRuns={pdfTextRuns}
                        pageNum={pageNum}
                        run={run}
                        useRichTextEditor={useRichTextEditor}
                        editingTextValue={editingTextValue}
                        setEditingTextValue={setEditingTextValue}
                        updatePdfTextInStream={updatePdfTextInStream}
                        setEditingTextRun={setEditingTextRun}
                        setTextEditMode={setTextEditMode}
                        canvasRef={canvasRef}
                        viewportRef={viewportRef}
                        multiLineEditing={multiLineEditing}
                        textInputRef={textInputRef}
                        showAISuggestions={showAISuggestions}
                        aiSuggestions={aiSuggestions}
                        realTimePreview={realTimePreview}
                        previewTimeoutRef={previewTimeoutRef}
                        setPdfTextRuns={setPdfTextRuns}
                        renderPage={renderPage}
                        editingTextFormat={editingTextFormat}
                        setEditingTextFormat={setEditingTextFormat}
                        setShowTextFormatPanel={setShowTextFormatPanel}
                        showTextFormatPanel={showTextFormatPanel}
                        setMultiLineEditing={setMultiLineEditing}
                        setUseRichTextEditor={setUseRichTextEditor}
                        setShowAISuggestions={setShowAISuggestions}
                        enableMultiCursor={enableMultiCursor}
                        setEnableMultiCursor={setEnableMultiCursor}
                        multiCursor={multiCursor}
                        textRotation={textRotation}
                        textScaleX={textScaleX}
                        textScaleY={textScaleY}
                        setTextRotation={setTextRotation}
                        setTextScaleX={setTextScaleX}
                        setTextScaleY={setTextScaleY}
                        pdfEngineRef={pdfEngineRef}
                        transformText={transformText}
                        textTemplates={textTemplates}
                        setTextTemplates={setTextTemplates}
                      />
                    );
                  })()}
                  
                  {/* Inline Text Editor - Using extracted component */}
                  {editingAnnotation && (() => {
                    const ann = annotations.find(a => a.id === editingAnnotation);
                    if (!ann || ann.type !== 'text' || ann.page !== pageNum) return null;
                    
                    const fontSize = ann.fontSize || 16;
                    const fontFamily = ann.fontFamily || 'Arial';
                    const canvas = canvasRef.current;
                    if (!canvas) return null;
                    
                    const rect = canvas.getBoundingClientRect();
                    const devicePixelRatio = window.devicePixelRatio || 1;
                    const scaleX = (canvas.width / devicePixelRatio) / rect.width;
                    const scaleY = (canvas.height / devicePixelRatio) / rect.height;
                    
                    const textX = ann.x / scaleX;
                    const textY = ann.y / scaleY;
                    
                    return (
                      <AnnotationTextEditor
                        annotation={ann}
                        editingText={editingText}
                        onTextChange={setEditingText}
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
                            (e.currentTarget as HTMLInputElement).blur();
                          } else if (e.key === 'Escape') {
                            setEditingAnnotation(null);
                            setEditingText('');
                          }
                        }}
                        position={{
                          x: rect.left + textX,
                          y: rect.top + textY - fontSize,
                        }}
                        fontSize={fontSize}
                        fontFamily={fontFamily}
                        color={ann.color || '#000000'}
                        textAlign={ann.textAlign || 'left'}
                        fontWeight={ann.fontWeight || 'normal'}
                        fontStyle={ann.fontStyle || 'normal'}
                        textDecoration={ann.textDecoration || 'none'}
                      />
                    );
                  })()}
              </CanvasContainer>

              {/* Annotations Panel - Using extracted component */}
              <AnnotationsPanel
                annotations={annotations}
                pageNum={pageNum}
                selectedAnnotation={selectedAnnotation}
                onSelectAnnotation={(id) => setSelectedAnnotation(id)}
                onRemoveAnnotation={removeAnnotation}
                onClearAll={clearAllAnnotations}
              />

              {/* Phase 7: Export Options Panel */}
              <ExportOptionsPanel
                show={showExportOptions}
                onClose={() => setShowExportOptions(false)}
                exportQuality={exportQuality}
                exportFormat={exportFormat}
                exportToFormat={exportToFormat}
                isProcessing={isProcessing}
                onQualityChange={(quality) => setExportQuality(quality)}
                onFormatChange={(format) => setExportFormat(format)}
                onExportToFormatChange={(format) => setExportToFormat(format)}
                onExport={async () => {
                        if (exportToFormat === 'pdf') {
                          await exportPdfWithOptionsUtil(pdfLibDocRef, file, exportQuality, exportFormat, setIsProcessing, setShowExportOptions);
                        } else if (exportToFormat === 'png' || exportToFormat === 'jpg') {
                          await exportToImageUtil(canvasRef, pageNum, file, exportQuality, exportToFormat);
                        } else if (exportToFormat === 'html') {
                          await exportToHTMLUtil(pdfTextRuns, pageNum, file);
                        } else if (exportToFormat === 'txt') {
                          await exportToTextUtil(pdfTextRuns, pageNum, file);
                        }
                        setShowExportOptions(false);
                      }}
              />

              {/* Download Bar - Using extracted component */}
              <DownloadBar
                showExportOptions={showExportOptions}
                onToggleExportOptions={() => setShowExportOptions(!showExportOptions)}
                onDownload={handleDownload}
                isProcessing={isProcessing}
                hasAnnotations={annotations.length > 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* Production: Enhanced loading state with progress - Using extracted component */}
      {isProcessing && !file && (
        <LoadingOverlay
          isProcessing={isProcessing}
          processingMessage={processingMessage}
          processingProgress={processingProgress}
        />
      )}
      
      <PageJumpModal
        show={showPageJump}
        onClose={() => setShowPageJump(false)}
        numPages={numPages}
        onJump={jumpToPage}
      />
      
      {pdfEngineRef.current && (
        <PerformanceDashboard
          show={showPerformanceDashboard}
          onClose={() => setShowPerformanceDashboard(false)}
          performanceMetrics={performanceMetrics}
          progressiveRendering={progressiveRendering}
          renderingQuality={renderingQuality}
          onProgressiveRenderingChange={(value) => setProgressiveRendering(value)}
          onRenderingQualityChange={(value) => setRenderingQuality(value)}
        />
      )}

      <BinaryAnalysisPanel
        show={showBinaryAnalysis}
        onClose={() => setShowBinaryAnalysis(false)}
        binaryAnalysisData={binaryAnalysisData}
      />

      {/* Engine Integration: History Branches */}
      <HistoryBranchesPanel
        show={showHistoryBranches}
        onClose={() => setShowHistoryBranches(false)}
        pdfEngineRef={pdfEngineRef}
        historyBranches={historyBranches}
        setHistoryBranches={setHistoryBranches}
        currentHistoryBranch={currentHistoryBranch}
        setCurrentHistoryBranch={setCurrentHistoryBranch}
      />

      {/* Engine Integration: Stream Processing Panel */}
      <StreamProcessingPanel
        show={showStreamProcessing}
        onClose={() => setShowStreamProcessing(false)}
        file={file}
        pdfEngineRef={pdfEngineRef}
        streamProgress={streamProgress}
        setStreamProgress={setStreamProgress}
      />

      {/* Engine Integration: PDF Repair Panel */}
      <RepairPanel
        show={showRepairPanel}
        onClose={() => setShowRepairPanel(false)}
        repairResults={repairResults}
        pdfEngineRef={pdfEngineRef}
        file={file}
      />

      <CompressionPanel
        show={showCompressionPanel}
        onClose={() => setShowCompressionPanel(false)}
        compressionOptions={compressionOptions}
        onCompressionOptionsChange={(options) => setCompressionOptions(options)}
        pdfEngineRef={pdfEngineRef}
        file={file}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      {/* Engine Integration: PDF/A Compliance Panel */}
      <PdfACompliancePanel
        show={showPdfACompliance}
        onClose={() => setShowPdfACompliance(false)}
        pdfAComplianceResults={pdfAComplianceResults}
      />

      <WASMPanel
        show={showWasmPanel}
        onClose={() => setShowWasmPanel(false)}
        wasmMetrics={wasmMetrics}
        pdfEngineRef={pdfEngineRef}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      <WorkerPanel
        show={showWorkerPanel}
        onClose={() => setShowWorkerPanel(false)}
        workerStats={workerStats}
        pdfEngineRef={pdfEngineRef}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      <EncryptionPanel
        show={showEncryptionPanel}
        onClose={() => setShowEncryptionPanel(false)}
        pdfEngineRef={pdfEngineRef}
        encryptionPassword={encryptionPassword}
        setEncryptionPassword={setEncryptionPassword}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
      />

      <FontPanel
        show={showFontPanel}
        onClose={() => setShowFontPanel(false)}
        fontStats={fontStats}
        pdfEngineRef={pdfEngineRef}
      />

      <SignaturePanel
        show={showSignaturePanel}
        onClose={() => setShowSignaturePanel(false)}
        pdfEngineRef={pdfEngineRef}
        signatureFields={signatureFields}
        setSignatureFields={setSignatureFields}
        pageNum={pageNum}
      />

      <OptimizationPanel
        show={showOptimizationPanel}
        onClose={() => setShowOptimizationPanel(false)}
        optimizationResults={optimizationResults}
      />

      <CachePanel
        show={showCachePanel}
        onClose={() => setShowCachePanel(false)}
        cacheStats={cacheStats}
        pdfEngineRef={pdfEngineRef}
      />
      
      {/* Advanced: Page Features Panel */}
      <PageFeaturesPanel
        show={showPageFeatures}
        onClose={() => setShowPageFeatures(false)}
        pageNum={pageNum}
        pageNumberFormat={pageNumberFormat}
        pageNumberPosition={pageNumberPosition}
        showPageNumbering={showPageNumbering}
        pageHeaders={pageHeaders}
        pageFooters={pageFooters}
        pageBackgroundColors={pageBackgroundColors}
        setPageNumberFormat={setPageNumberFormat}
        setPageNumberPosition={setPageNumberPosition}
        applyPageNumbering={applyPageNumbering}
        addPageHeader={addPageHeader}
        addPageFooter={addPageFooter}
        setPageBackground={setPageBackground}
      />

      {/* Advanced: Page Manager Panel */}
      <PageManagerPanel
        show={showPageManager}
        onClose={() => setShowPageManager(false)}
        pageNum={pageNum}
        numPages={numPages}
        setPageNum={setPageNum}
        pageRotations={pageRotations}
        deletedPages={deletedPages}
        rotatePage={rotatePage}
        deletePage={deletePage}
        insertBlankPage={insertBlankPage}
      />

      {/* Advanced: Templates Panel */}
      <TemplatesPanel
        show={showTemplatesPanel}
        onClose={() => setShowTemplatesPanel(false)}
        annotationTemplates={annotationTemplates}
        textTemplates={textTemplates}
        applyAnnotationTemplate={applyAnnotationTemplate}
        applyTextTemplate={applyTextTemplate}
      />

      <SettingsPanel
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Advanced: Help Panel */}
      <HelpPanel
        show={showHelp}
        onClose={() => setShowHelp(false)}
        onShowKeyboardShortcuts={() => {
          setShowHelp(false);
          setShowKeyboardShortcuts(true);
        }}
        onStartTutorial={() => {
          setShowHelp(false);
          setShowTutorial(true);
          setTutorialStep(0);
        }}
      />

      <KeyboardShortcutsPanel
        show={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
        onShowTextStatistics={() => {
          const stats = calculateTextStatsUtil(pdfTextRuns, pageNum, true);
          setTextStatistics({
            characterCount: stats.totalChars,
            wordCount: stats.totalWords,
            lineCount: stats.totalLines,
            paragraphCount: stats.totalParagraphs,
            sentenceCount: stats.totalSentences,
            averageWordsPerSentence: stats.totalSentences > 0 ? stats.totalWords / stats.totalSentences : 0,
            averageCharactersPerWord: stats.totalWords > 0 ? stats.totalChars / stats.totalWords : 0,
            pagesAnalyzed: stats.pagesAnalyzed,
            averageWordsPerPage: stats.averageWordsPerPage,
            averageCharsPerPage: stats.averageCharsPerPage,
            pageStats: stats.pageStats,
          });
          setShowTextStatistics(true);
        }}
        onShowTextStyles={() => setShowTextStyles(!showTextStyles)}
        onShowAIPanel={() => setShowAIPanel(!showAIPanel)}
        onShowCollaboration={() => setShowCollaboration(!showCollaboration)}
        onShowOCRPanel={() => setShowOCRPanel(!showOCRPanel)}
        onShowCloudSync={() => setShowCloudSync(!showCloudSync)}
      />

      <BatchOperationsPanel
        show={showBatchOperations && selectedTextRuns.size > 0}
        onClose={() => setShowBatchOperations(false)}
        selectedCount={selectedTextRuns.size}
        onApplyFormat={applyFormatToBatchTextRuns}
        onCopy={copyBatchTextRuns}
        onDelete={deleteBatchTextRuns}
        onClearSelection={() => setSelectedTextRuns(new Set())}
      />

      {/* PDF Comparison Panel - Now Modular */}
      <ComparisonPanel
        showPdfComparison={showPdfComparison}
        setShowPdfComparison={setShowPdfComparison}
        file={file}
        comparisonFile={comparisonFile}
        setComparisonFile={setComparisonFile}
        pdfEngineRef={pdfEngineRef}
        toast={toast}
      />

      {/* Social Share Panel - Now Modular */}
      <SocialSharePanel
        showSocialShare={showSocialShare}
        setShowSocialShare={setShowSocialShare}
        shareUrl={shareUrl}
        setShareUrl={setShareUrl}
        file={file}
        pdfEngineRef={pdfEngineRef}
        toast={toast}
      />

      {/* Performance Panel - Now Modular */}
      <PerformancePanel
        showPerformancePanel={showPerformancePanel}
        setShowPerformancePanel={setShowPerformancePanel}
        webglEnabled={webglEnabled}
        setWebglEnabled={setWebglEnabled}
        pdfEngineRef={pdfEngineRef}
        toast={toast}
      />

      <ContextMenu
        contextMenu={contextMenu}
        selectedAnnotations={selectedAnnotations}
        lockedAnnotations={lockedAnnotations}
        onClose={() => setContextMenu(null)}
        onDuplicate={duplicateAnnotation}
        onToggleLock={toggleLockAnnotation}
        onDelete={(id) => {
          removeAnnotation(id);
          setContextMenu(null);
        }}
        onAlign={alignAnnotations}
        onDistribute={distributeAnnotations}
        onGroup={groupAnnotations}
      />
    </div>
  );
}

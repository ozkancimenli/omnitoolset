import { useCallback } from 'react';
import { toast } from '@/components/Toast';
import { validatePDFFile, logError } from '../utils';

export interface UseFileHandlersOptions {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  pdfUrl: string | null;
  setFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setAnnotations: (annotations: any[]) => void;
  setHistory: (history: any[][]) => void;
  setHistoryIndex: (index: number) => void;
  setPageNum: (page: number) => void;
  setIsEditable: (editable: boolean) => void;
  setZoom: (zoom: number) => void;
  setPdfTextRuns: (runs: Record<number, any[]>) => void;
  setPdfTextItems: (items: Record<number, any[]>) => void;
  setTextRunsCache: (cache: Record<number, any>) => void;
  setNumPages: (pages: number) => void;
  setErrorState: (error: any) => void;
  loadPDF: (file: File) => Promise<void>;
}

export function useFileHandlers(options: UseFileHandlersOptions) {
  const {
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
  } = options;

  const resetEditorState = useCallback(() => {
    setAnnotations([]);
    setHistory([]);
    setHistoryIndex(-1);
    setPageNum(1);
    setIsEditable(true);
    setZoom(1);
    setPdfTextRuns({});
    setPdfTextItems({});
    setTextRunsCache({});
    setPdfUrl(null);
    setNumPages(0);
    setErrorState(null);
  }, [
    setAnnotations,
    setHistory,
    setHistoryIndex,
    setPageNum,
    setIsEditable,
    setZoom,
    setPdfTextRuns,
    setPdfTextItems,
    setTextRunsCache,
    setPdfUrl,
    setNumPages,
    setErrorState,
  ]);

  const cleanupPreviousUrl = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  }, [pdfUrl]);

  const loadFileDirect = useCallback(async (file: File): Promise<boolean> => {
    const validation = validatePDFFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return false;
    }

    cleanupPreviousUrl();
    resetEditorState();

    setFile(file);
    toast.info('Loading PDF...');

    try {
      await loadPDF(file);
      return true;
    } catch (error) {
      logError(error as Error, 'loadFileDirect loadPDF', { fileName: file.name });
      toast.error('Failed to load PDF. Please try again.');
      setFile(null);
      return false;
    }
  }, [cleanupPreviousUrl, resetEditorState, setFile, loadPDF]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || fileInputRef.current?.files?.[0];
    if (!selectedFile) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    await loadFileDirect(selectedFile);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [fileInputRef, loadFileDirect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) {
      toast.warning('No file dropped');
      return;
    }

    await loadFileDirect(droppedFile);
  }, [loadFileDirect]);

  return {
    handleFileSelect,
    handleDragOver,
    handleDrop,
    loadFileDirect,
  };
}

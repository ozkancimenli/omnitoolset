import { useCallback } from 'react';
import { toast } from '@/components/Toast';
import { validatePDFFile, logError } from '../utils';

export interface UseFileHandlersOptions {
  fileInputRef: React.RefObject<HTMLInputElement>;
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

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      if (fileInputRef.current?.files?.[0]) {
        const directFile = fileInputRef.current.files[0];
        const syntheticEvent = {
          target: { files: fileInputRef.current.files },
        } as React.ChangeEvent<HTMLInputElement>;
        return handleFileSelect(syntheticEvent);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    try {
      const validation = validatePDFFile(selectedFile);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Cleanup previous resources
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      
      // Reset state
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
      
      setFile(selectedFile);
      toast.info('Loading PDF...');
      
      try {
        await loadPDF(selectedFile);
      } catch (error) {
        logError(error as Error, 'handleFileSelect loadPDF', { fileName: selectedFile.name });
        toast.error('Failed to load PDF. Please try again.');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      logError(error as Error, 'handleFileSelect', { fileName: selectedFile.name });
      toast.error('Error processing file. Please try again.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    }
  }, [
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
  ]);

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
    
    try {
      const validation = validatePDFFile(droppedFile);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid file');
        return;
      }
      
      // Cleanup previous resources
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      
      // Reset state
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
      
      setFile(droppedFile);
      toast.info('Loading PDF...');
      
      try {
        await loadPDF(droppedFile);
      } catch (error) {
        logError(error as Error, 'handleDrop loadPDF', { fileName: droppedFile.name });
        toast.error('Failed to load PDF. Please try again.');
        setFile(null);
      }
    } catch (error) {
      logError(error as Error, 'handleDrop', { fileName: droppedFile.name });
      toast.error('Error processing dropped file. Please try again.');
      setFile(null);
    }
  }, [
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
  ]);

  return {
    handleFileSelect,
    handleDragOver,
    handleDrop,
  };
}



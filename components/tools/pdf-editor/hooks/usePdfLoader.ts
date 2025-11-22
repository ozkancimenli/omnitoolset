// PDF Loader Hook
import { useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from '@/components/Toast';
import { PdfEngine } from '../../pdf-engine';
import { logError, measurePerformance, PDFProcessingError } from '../utils';
import { PDF_MAX_SIZE, AUTO_SAVE_INTERVAL, RENDER_CACHE_SIZE } from '../constants';

interface UsePdfLoaderProps {
  setFile: (file: File | null) => void;
  setPdfUrl: (url: string | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setProcessingProgress: (progress: number) => void;
  setProcessingMessage: (message: string) => void;
  setNumPages: (pages: number) => void;
  setPageNum: (page: number) => void;
  setIsEditable: (editable: boolean) => void;
  pdfDocRef: React.MutableRefObject<any>;
  pdfLibDocRef: React.MutableRefObject<PDFDocument | null>;
  pdfEngineRef: React.MutableRefObject<PdfEngine | null>;
  renderPage: (pageNumber: number) => Promise<void>;
  autoSaveEnabled: boolean;
}

export const usePdfLoader = ({
  setFile,
  setPdfUrl,
  setIsProcessing,
  setProcessingProgress,
  setProcessingMessage,
  setNumPages,
  setPageNum,
  setIsEditable,
  pdfDocRef,
  pdfLibDocRef,
  pdfEngineRef,
  renderPage,
  autoSaveEnabled,
}: UsePdfLoaderProps) => {
  const loadPDF = useCallback(async (fileToLoad?: File, targetFile?: File) => {
    const finalFile = fileToLoad || targetFile;
    if (!finalFile) {
      console.warn('[PDF Editor] loadPDF called but no file provided');
      return;
    }
    
    console.log('[PDF Editor] loadPDF started with file:', finalFile.name, finalFile.size);
    
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
        const arrayBufferForViewing = await finalFile.arrayBuffer();
        
        setProcessingProgress(30);
        setProcessingMessage('Parsing PDF structure...');
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBufferForViewing,
          useSystemFonts: true,
          verbosity: 0,
          maxImageSize: 1024 * 1024 * 10, // 10MB max image size
        }).promise;
        
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        
        if (pdf.numPages === 0) {
          throw new PDFProcessingError('PDF has no pages', 'NO_PAGES');
        }

        // Generate thumbnails
        setProcessingProgress(40);
        setProcessingMessage('Generating thumbnails...');
        const maxThumbnails = Math.min(pdf.numPages, 10);
        const thumbnails: string[] = [];
        
        for (let i = 1; i <= maxThumbnails; i++) {
          try {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: context, viewport }).promise;
              thumbnails.push(canvas.toDataURL());
            }
            const progress = 40 + (i / maxThumbnails) * 20;
            setProcessingProgress(progress);
          } catch (thumbError) {
            logError(thumbError as Error, 'generateThumbnail', { pageNumber: i });
            thumbnails.push('');
          }
        }
        
        // Initialize OmniPDF Engine
        setProcessingProgress(70);
        setProcessingMessage('Initializing OmniPDF Engine...');
        
        const engine = new PdfEngine({
          maxFileSize: PDF_MAX_SIZE,
          enableCaching: true,
          cacheSize: RENDER_CACHE_SIZE,
          enableAutoSave: autoSaveEnabled,
          autoSaveInterval: AUTO_SAVE_INTERVAL,
        });
        
        const loadResult = await engine.loadPdf(finalFile);
        if (!loadResult.success) {
          throw new PDFProcessingError(
            loadResult.error || 'Failed to load PDF with engine',
            'ENGINE_LOAD_ERROR'
          );
        }
        
        pdfEngineRef.current = engine;
        toast.info('OmniPDF Engine initialized successfully');
        
        // Load with pdf-lib for backward compatibility
        setProcessingProgress(75);
        setProcessingMessage('Loading PDF for editing...');
        const arrayBufferForEditing = await finalFile.arrayBuffer();
        const fileBytes = new Uint8Array(arrayBufferForEditing);
        
        try {
          const pdfLibDoc = await PDFDocument.load(fileBytes, {
            ignoreEncryption: false,
            updateMetadata: false,
            parseSpeed: 1,
          });
          pdfLibDocRef.current = pdfLibDoc;
        } catch (pdfLibError) {
          logError(pdfLibError as Error, 'pdf-lib load (first attempt)');
          try {
            setProcessingMessage('Retrying with encryption ignored...');
            const retryBuffer = await finalFile.arrayBuffer();
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
        tempUrl = URL.createObjectURL(finalFile);
        setPdfUrl(tempUrl);
        
        // Load first page
        setProcessingProgress(95);
        await renderPage(1);
        
        setProcessingProgress(100);
        setProcessingMessage('PDF loaded successfully!');
        toast.success(`PDF loaded: ${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`);
      });
    } catch (error) {
      logError(error as Error, 'loadPDF', { fileName: finalFile.name });
      toast.error('Failed to load PDF. Please try again.');
      setFile(null);
      throw error;
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingMessage('');
    }
  }, [
    setIsProcessing,
    setProcessingProgress,
    setProcessingMessage,
    setNumPages,
    setPdfUrl,
    setIsEditable,
    pdfDocRef,
    pdfLibDocRef,
    pdfEngineRef,
    renderPage,
    autoSaveEnabled,
  ]);

  return { loadPDF };
};


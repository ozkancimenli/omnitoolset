// Canvas Rendering Hook
import { useRef, useCallback, useEffect } from 'react';
import type { Annotation } from '../types';

interface UseCanvasProps {
  pdfDocRef: React.MutableRefObject<any>;
  annotations: Annotation[];
  pageNum: number;
  zoom: number;
  zoomMode: 'custom' | 'fit-width' | 'fit-page' | 'fit-height';
  hiddenLayers: Set<string>;
  renderAnnotations: (context: CanvasRenderingContext2D, annotations: Annotation[], viewport: any) => void;
}

export const useCanvas = ({
  pdfDocRef,
  annotations,
  pageNum,
  zoom,
  zoomMode,
  hiddenLayers,
  renderAnnotations,
}: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderCacheRef = useRef<Map<number, { imageData: string; timestamp: number }>>(new Map());
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Render PDF page to canvas
  const renderPage = useCallback(async (pageNumber: number, useCache: boolean = true) => {
    if (!pdfDocRef.current || !canvasRef.current || !containerRef.current) {
      return;
    }

    // Check cache
    if (useCache && renderCacheRef.current.has(pageNumber)) {
      const cached = renderCacheRef.current.get(pageNumber)!;
      if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
        const img = new Image();
        img.onload = () => {
          const context = canvasRef.current?.getContext('2d');
          if (context && canvasRef.current) {
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            context.drawImage(img, 0, 0);
            // Render annotations
            const pageAnnotations = annotations.filter(ann => ann.page === pageNumber && !hiddenLayers.has(ann.id));
            renderAnnotations(context, pageAnnotations, { width: img.width, height: img.height });
          }
        };
        img.src = cached.imageData;
        return;
      } else {
        renderCacheRef.current.delete(pageNumber);
      }
    }

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const container = containerRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      // Get container dimensions
      const containerWidth = container.clientWidth - 32;
      const containerHeight = container.clientHeight - 32;
      
      // Get PDF page dimensions at scale 1.0
      const viewportAtScale1 = page.getViewport({ scale: 1.0 });
      const pdfWidth = viewportAtScale1.width;
      const pdfHeight = viewportAtScale1.height;
      
      // Calculate scale based on zoom mode
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
        scale = Math.min(scaleX, scaleY, 5.0);
      }
      
      // Get viewport at calculated scale
      const viewport = page.getViewport({ scale });
      
      // Set canvas display size
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      
      // Set canvas internal size (device pixels)
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * devicePixelRatio;
      canvas.height = viewport.height * devicePixelRatio;
      
      // Scale context
      context.scale(devicePixelRatio, devicePixelRatio);

      // Render PDF page
      await page.render({ 
        canvasContext: context, 
        viewport,
      } as any).promise;
      
      // Cache the rendered page
      const imageData = canvas.toDataURL('image/png');
      renderCacheRef.current.set(pageNumber, {
        imageData,
        timestamp: Date.now(),
      });

      // Render annotations
      const pageAnnotations = annotations.filter(ann => ann.page === pageNumber && !hiddenLayers.has(ann.id));
      renderAnnotations(context, pageAnnotations, viewport);
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  }, [pdfDocRef, annotations, zoom, zoomMode, hiddenLayers, renderAnnotations]);

  // Clear cache
  const clearCache = useCallback(() => {
    renderCacheRef.current.clear();
  }, []);

  // Clear cache for specific page
  const clearPageCache = useCallback((pageNumber: number) => {
    renderCacheRef.current.delete(pageNumber);
  }, []);

  return {
    canvasRef,
    containerRef,
    renderPage,
    clearCache,
    clearPageCache,
  };
};





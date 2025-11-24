// Zoom Management Hook
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/Toast';

export type ZoomMode = 'custom' | 'fit-width' | 'fit-page' | 'fit-height';

interface UseZoomProps {
  containerRef: React.RefObject<HTMLDivElement>;
  pdfWidth?: number;
  pdfHeight?: number;
  renderPage: (pageNumber: number, useCache?: boolean) => Promise<void>;
  pageNum: number;
  onZoomChange?: (zoom: number, mode: ZoomMode) => void;
}

export const useZoom = ({
  containerRef,
  pdfWidth,
  pdfHeight,
  renderPage,
  pageNum,
  onZoomChange,
}: UseZoomProps) => {
  const [zoom, setZoom] = useState(1);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit-page');
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate zoom based on mode
  const calculateZoom = useCallback((mode: ZoomMode, containerWidth: number, containerHeight: number): number => {
    if (!pdfWidth || !pdfHeight) return 1;

    switch (mode) {
      case 'fit-width':
        return containerWidth / pdfWidth;
      case 'fit-height':
        return containerHeight / pdfHeight;
      case 'fit-page': {
        const scaleX = containerWidth / pdfWidth;
        const scaleY = containerHeight / pdfHeight;
        return Math.min(scaleX, scaleY);
      }
      case 'custom':
        return zoom; // Keep current zoom
      default:
        return 1;
    }
  }, [pdfWidth, pdfHeight, zoom]);

  // Apply zoom mode
  const applyZoomMode = useCallback((mode: ZoomMode) => {
    if (!containerRef.current || !pdfWidth || !pdfHeight) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32; // Account for padding
    const containerHeight = container.clientHeight - 32;

    if (mode === 'custom') {
      // Keep current zoom
      setZoomMode('custom');
      onZoomChange?.(zoom, 'custom');
      return;
    }

    const newZoom = calculateZoom(mode, containerWidth, containerHeight);
    setZoom(newZoom);
    setZoomMode(mode);
    onZoomChange?.(newZoom, mode);

    // Debounce render
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    zoomTimeoutRef.current = setTimeout(() => {
      renderPage(pageNum, false);
    }, 100);
  }, [containerRef, pdfWidth, pdfHeight, calculateZoom, renderPage, pageNum, zoom, onZoomChange]);

  // Set custom zoom
  const setCustomZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.25, Math.min(5, newZoom)); // Limit between 0.25x and 5x
    setZoom(clampedZoom);
    setZoomMode('custom');
    onZoomChange?.(clampedZoom, 'custom');

    // Debounce render
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    zoomTimeoutRef.current = setTimeout(() => {
      renderPage(pageNum, false);
    }, 100);
  }, [renderPage, pageNum, onZoomChange]);

  // Zoom in
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(5, zoom * 1.25);
    setCustomZoom(newZoom);
    toast.info(`Zoom: ${Math.round(newZoom * 100)}%`);
  }, [zoom, setCustomZoom]);

  // Zoom out
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(0.25, zoom * 0.8);
    setCustomZoom(newZoom);
    toast.info(`Zoom: ${Math.round(newZoom * 100)}%`);
  }, [zoom, setCustomZoom]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    applyZoomMode('fit-page');
    toast.info('Zoom reset to fit page');
  }, [applyZoomMode]);

  // Handle window resize
  useEffect(() => {
    if (zoomMode === 'fit-page' || zoomMode === 'fit-width' || zoomMode === 'fit-height') {
      const handleResize = () => {
        applyZoomMode(zoomMode);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [zoomMode, applyZoomMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
    };
  }, []);

  return {
    zoom,
    zoomMode,
    setZoom: setCustomZoom,
    setZoomMode: applyZoomMode,
    zoomIn,
    zoomOut,
    resetZoom,
    calculateZoom,
  };
};





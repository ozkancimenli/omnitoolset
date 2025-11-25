import { useState, useCallback, useEffect, useRef } from 'react';

export interface UsePanningOptions {
  containerRef: React.RefObject<HTMLDivElement>;
  enabled?: boolean;
}

export function usePanning({ containerRef, enabled = true }: UsePanningOptions) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  const startPanning = useCallback((clientX: number, clientY: number) => {
    if (!enabled || !containerRef.current) return false;
    
    setIsPanning(true);
    setPanStart({ x: clientX, y: clientY });
    return true;
  }, [enabled, containerRef]);

  const updatePanning = useCallback((clientX: number, clientY: number) => {
    if (!isPanning || !panStart || !containerRef.current) return;

    const deltaX = clientX - panStart.x;
    const deltaY = clientY - panStart.y;
    
    containerRef.current.scrollLeft -= deltaX;
    containerRef.current.scrollTop -= deltaY;
    
    setPanStart({ x: clientX, y: clientY });
    setPanOffset(prev => ({
      x: prev.x - deltaX,
      y: prev.y - deltaY,
    }));
  }, [isPanning, panStart, containerRef]);

  const stopPanning = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
  }, []);

  const resetPanOffset = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
  }, []);

  return {
    isPanning,
    panStart,
    panOffset,
    spacePressed,
    startPanning,
    updatePanning,
    stopPanning,
    resetPanOffset,
  };
}



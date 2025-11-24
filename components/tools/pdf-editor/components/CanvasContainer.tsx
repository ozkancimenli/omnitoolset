// Canvas Container Component
'use client';

import React, { memo } from 'react';

interface CanvasContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tool: string | null;
  selectedAnnotation: string | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  children?: React.ReactNode;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = memo(({
  containerRef,
  canvasRef,
  tool,
  selectedAnnotation,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onContextMenu,
  isPanning = false,
  spacePressed = false,
  onWheel,
  children,
}) => {
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (onWheel) {
      onWheel(e);
    } else {
      // Default: Shift + Wheel for horizontal scroll
      if (e.shiftKey) {
        e.preventDefault();
        if (containerRef.current) {
          containerRef.current.scrollLeft += e.deltaY;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gradient-to-br from-zinc-100 via-neutral-50 to-zinc-100 dark:from-zinc-950 dark:via-neutral-950 dark:to-zinc-950 overflow-auto flex justify-center items-start p-4 relative"
      style={{ 
        minHeight: '400px', 
        height: '100%',
        cursor: isPanning || spacePressed ? 'grabbing' : 'default'
      }}
      onWheel={handleWheel}
    >
      <div className="bg-white dark:bg-zinc-900 shadow-2xl shadow-zinc-500/20 dark:shadow-zinc-900/50 rounded-lg relative mt-4 mb-4 border border-zinc-200/50 dark:border-zinc-800/50" style={{ maxWidth: '100%' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onContextMenu={onContextMenu}
          className="block max-w-full h-auto"
          style={{ 
            cursor: isPanning || spacePressed ? 'grabbing' : tool ? 'crosshair' : selectedAnnotation ? 'move' : 'default', 
            display: 'block' 
          }}
        />
        {children}
      </div>
    </div>
  );
});

CanvasContainer.displayName = 'CanvasContainer';


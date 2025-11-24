// Coordinate conversion utilities for PDF editor

export interface Viewport {
  width: number;
  height: number;
  scale: number;
}

/**
 * Convert mouse event coordinates to PDF coordinates
 * Handles coordinate system conversion (canvas Y=0 at top, PDF Y=0 at bottom)
 */
export const getCanvasCoordinates = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  viewportRef: React.MutableRefObject<Viewport | null>
): { x: number; y: number } => {
  if (!canvasRef.current) return { x: 0, y: 0 };
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  
  // Get click position relative to canvas (in CSS pixels)
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Convert to PDF coordinates using viewport
  if (viewportRef.current) {
    const viewport = viewportRef.current;
    // Canvas display size (rect.width/height) matches viewport size
    const pdfX = (clickX / rect.width) * viewport.width;
    // PDF Y=0 is at bottom, Canvas Y=0 is at top - flip Y coordinate
    const pdfY = viewport.height - ((clickY / rect.height) * viewport.height);
    return { x: pdfX, y: pdfY };
  }
  
  // Fallback: use device pixel ratio (should not happen if viewportRef is set)
  const devicePixelRatio = window.devicePixelRatio || 1;
  const scaleX = (canvas.width / devicePixelRatio) / rect.width;
  const scaleY = (canvas.height / devicePixelRatio) / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};



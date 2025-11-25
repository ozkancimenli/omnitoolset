// Coordinate conversion utilities for PDF editor

export interface Viewport {
  width: number;
  height: number;
  scale: number;
}

/**
 * Convert mouse event coordinates to canvas-space coordinates (origin at top-left)
 * The returned values match how annotations/text runs are stored/rendered.
 */
export const getCanvasCoordinates = (
  e: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  viewportRef: React.MutableRefObject<Viewport | null>
): { x: number; y: number } => {
  if (!canvasRef.current) return { x: 0, y: 0 };
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  
  // Get click position relative to canvas (in CSS pixels)
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  // Convert to canvas coordinates scaled by viewport size (no Y flip)
  if (viewportRef.current) {
    const viewport = viewportRef.current;
    const canvasX = (clickX / rect.width) * viewport.width;
    const canvasY = (clickY / rect.height) * viewport.height;
    return { x: canvasX, y: canvasY };
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

/**
 * PDF Editor Enhancements
 * 
 * Advanced editing features for PDF Editor:
 * - Text editing (double-click to edit)
 * - Annotation movement (drag to move)
 * - Annotation resize (with handles)
 * - Font selection
 * - Text alignment
 * - Copy/paste annotations
 */

export const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Courier New', label: 'Courier' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
];

export const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left', icon: '⬅' },
  { value: 'center', label: 'Center', icon: '⬌' },
  { value: 'right', label: 'Right', icon: '➡' },
];

/**
 * Check if point is inside annotation bounds
 */
export function isPointInAnnotation(
  x: number,
  y: number,
  annotation: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    type: string;
    text?: string;
    fontSize?: number;
  }
): boolean {
  if (annotation.type === 'text') {
    // For text, estimate bounds based on text length and font size
    const fontSize = annotation.fontSize || 16;
    const textWidth = (annotation.text?.length || 0) * (fontSize * 0.6);
    const textHeight = fontSize;
    return (
      x >= annotation.x &&
      x <= annotation.x + textWidth &&
      y >= annotation.y - textHeight &&
      y <= annotation.y
    );
  } else if (annotation.width && annotation.height) {
    return (
      x >= annotation.x &&
      x <= annotation.x + annotation.width &&
      y >= annotation.y &&
      y <= annotation.y + annotation.height
    );
  } else if (annotation.type === 'line' || annotation.type === 'arrow') {
    // For lines, check if point is near the line (within 5px)
    // This is simplified - full implementation would check distance to line segment
    return false;
  }
  return false;
}

/**
 * Get resize handle position
 */
export function getResizeHandle(
  x: number,
  y: number,
  annotation: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  }
): string | null {
  if (!annotation.width || !annotation.height) return null;
  
  const handleSize = 8;
  const handles = [
    { name: 'nw', x: annotation.x, y: annotation.y },
    { name: 'ne', x: annotation.x + annotation.width, y: annotation.y },
    { name: 'sw', x: annotation.x, y: annotation.y + annotation.height },
    { name: 'se', x: annotation.x + annotation.width, y: annotation.y + annotation.height },
    { name: 'n', x: annotation.x + annotation.width / 2, y: annotation.y },
    { name: 's', x: annotation.x + annotation.width / 2, y: annotation.y + annotation.height },
    { name: 'w', x: annotation.x, y: annotation.y + annotation.height / 2 },
    { name: 'e', x: annotation.x + annotation.width, y: annotation.y + annotation.height / 2 },
  ];
  
  for (const handle of handles) {
    if (
      x >= handle.x - handleSize &&
      x <= handle.x + handleSize &&
      y >= handle.y - handleSize &&
      y <= handle.y + handleSize
    ) {
      return handle.name;
    }
  }
  
  return null;
}

/**
 * Calculate text bounds for rendering
 */
export function getTextBounds(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  fontFamily: string,
  textAlign: 'left' | 'center' | 'right',
  context: CanvasRenderingContext2D
): { x: number; y: number; width: number; height: number } {
  context.font = `${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(text);
  const width = metrics.width;
  const height = fontSize;
  
  let adjustedX = x;
  if (textAlign === 'center') {
    adjustedX = x - width / 2;
  } else if (textAlign === 'right') {
    adjustedX = x - width;
  }
  
  return {
    x: adjustedX,
    y: y - height,
    width,
    height,
  };
}


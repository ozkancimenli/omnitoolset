// Annotation Creation Utilities
import { toast } from '@/components/Toast';
import type { Annotation, ToolType, PdfTextRun } from '../types';

interface CreateAnnotationParams {
  tool: ToolType;
  coords: { x: number; y: number };
  drawStart: { x: number; y: number } | null;
  pageNum: number;
  highlightColor: string;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  currentText: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textColor: string;
  freehandPath: { x: number; y: number }[];
  polygonPoints: { x: number; y: number }[];
  measureStart: { x: number; y: number } | null;
  measurementUnit: 'px' | 'mm' | 'cm' | 'in';
  watermarkText: string;
  watermarkOpacity: number;
  stamps: Array<{ id: string; text: string; color: string }>;
  selectedStamp: string;
  stampSize: number;
  formFieldType: string;
  formFieldName: string;
  formFieldRequired: boolean;
  formFieldOptions: string[];
}

export const createAnnotationFromTool = (
  params: CreateAnnotationParams
): Annotation | null => {
  const {
    tool,
    coords,
    drawStart,
    pageNum,
    highlightColor,
    strokeColor,
    fillColor,
    strokeWidth,
    currentText,
    fontSize,
    fontFamily,
    fontWeight,
    fontStyle,
    textColor,
    freehandPath,
    polygonPoints,
    measureStart,
    measurementUnit,
    watermarkText,
    watermarkOpacity,
    stamps,
    selectedStamp,
    stampSize,
    formFieldType,
    formFieldName,
    formFieldRequired,
    formFieldOptions,
  } = params;

  if (!tool || !drawStart) return null;

  if (tool === 'text' && currentText.trim()) {
    return {
      id: Date.now().toString(),
      type: 'text',
      x: coords.x,
      y: coords.y,
      text: currentText,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      color: textColor,
      page: pageNum,
    };
  } else if (tool === 'highlight') {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 5 && height > 5) {
      return {
        id: Date.now().toString(),
        type: 'highlight',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height,
        color: highlightColor,
        page: pageNum,
      };
    }
  } else if (tool === 'rectangle') {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 5 && height > 5) {
      return {
        id: Date.now().toString(),
        type: 'rectangle',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height,
        strokeColor,
        fillColor,
        page: pageNum,
      };
    }
  } else if (tool === 'circle') {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 5 && height > 5) {
      return {
        id: Date.now().toString(),
        type: 'circle',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height,
        strokeColor,
        fillColor,
        page: pageNum,
      };
    }
  } else if (tool === 'line' || tool === 'arrow') {
    return {
      id: Date.now().toString(),
      type: tool,
      x: drawStart.x,
      y: drawStart.y,
      endX: coords.x,
      endY: coords.y,
      strokeColor,
      page: pageNum,
    };
  } else if (tool === 'link') {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 10 && height > 10) {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        return {
          id: Date.now().toString(),
          type: 'link',
          x: Math.min(drawStart.x, coords.x),
          y: Math.min(drawStart.y, coords.y),
          width,
          height,
          url,
          strokeColor: '#0066cc',
          page: pageNum,
        };
      }
    }
  } else if (tool === 'note') {
    const comment = prompt('Enter comment:', '');
    if (comment) {
      return {
        id: Date.now().toString(),
        type: 'note',
        x: coords.x,
        y: coords.y,
        width: 150,
        height: 100,
        comment,
        fillColor: '#FFFF99',
        strokeColor: '#FFD700',
        page: pageNum,
      };
    }
  } else if (tool === 'freehand' && freehandPath.length > 0) {
    return {
      id: Date.now().toString(),
      type: 'freehand',
      x: Math.min(...freehandPath.map(p => p.x)),
      y: Math.min(...freehandPath.map(p => p.y)),
      width: Math.max(...freehandPath.map(p => p.x)) - Math.min(...freehandPath.map(p => p.x)),
      height: Math.max(...freehandPath.map(p => p.y)) - Math.min(...freehandPath.map(p => p.y)),
      freehandPath: [...freehandPath],
      strokeColor,
      page: pageNum,
    };
  } else if (tool === 'signature') {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 10 && height > 10) {
      return {
        id: Date.now().toString(),
        type: 'signature',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height,
        strokeColor: '#000000',
        page: pageNum,
      };
    }
  } else if (tool === 'watermark') {
    return {
      id: Date.now().toString(),
      type: 'watermark',
      x: coords.x,
      y: coords.y,
      watermarkText,
      watermarkOpacity,
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#CCCCCC',
      page: pageNum,
    };
  } else if (tool === 'redaction') {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 5 && height > 5) {
      return {
        id: Date.now().toString(),
        type: 'redaction',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height,
        fillColor: '#000000',
        strokeColor: '#000000',
        page: pageNum,
      };
    }
  } else if (tool === 'stamp') {
    const stamp = stamps.find(s => s.id === selectedStamp);
    if (stamp) {
      return {
        id: Date.now().toString(),
        type: 'stamp',
        x: coords.x - stampSize / 2,
        y: coords.y - stampSize / 2,
        width: stampSize,
        height: stampSize,
        text: stamp.text,
        color: stamp.color,
        fontSize: stampSize * 0.3,
        fontWeight: 'bold',
        page: pageNum,
      };
    }
  } else if (tool === 'ruler' && measureStart) {
    return {
      id: Date.now().toString(),
      type: 'ruler',
      x: measureStart.x,
      y: measureStart.y,
      endX: coords.x,
      endY: measureStart.y,
      width: Math.abs(coords.x - measureStart.x),
      height: 2,
      strokeColor: '#000000',
      page: pageNum,
      distance: Math.abs(coords.x - measureStart.x),
      measurementUnit,
    };
  } else if (tool === 'measure' && measureStart) {
    const distance = Math.sqrt(
      Math.pow(coords.x - measureStart.x, 2) + Math.pow(coords.y - measureStart.y, 2)
    );
    return {
      id: Date.now().toString(),
      type: 'measure',
      x: measureStart.x,
      y: measureStart.y,
      endX: coords.x,
      endY: coords.y,
      strokeColor: '#3b82f6',
      page: pageNum,
      distance,
      measurementUnit,
    };
  } else if (tool === 'polygon' && polygonPoints.length > 2) {
    return {
      id: Date.now().toString(),
      type: 'polygon',
      x: Math.min(...polygonPoints.map(p => p.x)),
      y: Math.min(...polygonPoints.map(p => p.y)),
      width: Math.max(...polygonPoints.map(p => p.x)) - Math.min(...polygonPoints.map(p => p.x)),
      height: Math.max(...polygonPoints.map(p => p.y)) - Math.min(...polygonPoints.map(p => p.y)),
      points: [...polygonPoints],
      strokeColor,
      fillColor,
      page: pageNum,
    };
  } else if (tool === 'callout' && polygonPoints.length >= 3) {
    return {
      id: Date.now().toString(),
      type: 'callout',
      x: Math.min(...polygonPoints.map(p => p.x)),
      y: Math.min(...polygonPoints.map(p => p.y)),
      width: Math.max(...polygonPoints.map(p => p.x)) - Math.min(...polygonPoints.map(p => p.x)),
      height: Math.max(...polygonPoints.map(p => p.y)) - Math.min(...polygonPoints.map(p => p.y)),
      calloutPoints: [...polygonPoints],
      strokeColor,
      fillColor,
      page: pageNum,
    };
  } else if (tool === 'form-field' && drawStart) {
    const width = Math.abs(coords.x - drawStart.x);
    const height = Math.abs(coords.y - drawStart.y);
    if (width > 50 && height > 20) {
      const fieldId = `field_${Date.now()}`;
      return {
        id: fieldId,
        type: 'form-field',
        x: Math.min(drawStart.x, coords.x),
        y: Math.min(drawStart.y, coords.y),
        width,
        height,
        formFieldType: formFieldType as any,
        formFieldName: formFieldName || `field_${fieldId}`,
        formFieldValue: '',
        formFieldRequired,
        formFieldOptions,
        strokeColor: '#3b82f6',
        fillColor: '#f0f9ff',
        page: pageNum,
      };
    }
  }

  return null;
};

export const getAnnotationSuccessMessage = (tool: ToolType, annotation?: Annotation): string => {
  if (!tool) return '';
  
  const messages: Record<string, string> = {
    text: 'Text added',
    highlight: 'Highlight added',
    rectangle: 'Rectangle added',
    circle: 'Circle added',
    line: 'Line added',
    arrow: 'Arrow added',
    link: 'Link added',
    note: 'Sticky note added',
    freehand: 'Freehand drawing added',
    signature: 'Signature area added - Draw your signature',
    watermark: 'Watermark added',
    redaction: 'Redaction added',
    stamp: annotation?.text ? `${annotation.text} stamp added` : 'Stamp added',
    ruler: annotation?.distance ? `Ruler added: ${annotation.distance}${annotation.measurementUnit || 'px'}` : 'Ruler added',
    measure: annotation?.distance ? `Distance: ${annotation.distance.toFixed(2)}${annotation.measurementUnit || 'px'}` : 'Distance measured',
    polygon: 'Polygon added',
    callout: 'Callout added',
    'form-field': annotation?.formFieldType ? `${annotation.formFieldType} field added` : 'Form field added',
  };
  
  return messages[tool] || 'Annotation added';
};



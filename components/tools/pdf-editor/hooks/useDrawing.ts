import { useState, useCallback } from 'react';
import type { ToolType, Annotation } from '../types';

export interface UseDrawingOptions {
  tool: ToolType;
  isEditable: boolean;
  pageNum: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  annotations: Annotation[];
  onAnnotationChange: (annotations: Annotation[]) => void;
  onHistorySave: (annotations: Annotation[]) => void;
}

export function useDrawing({
  tool,
  isEditable,
  pageNum,
  strokeColor,
  fillColor,
  strokeWidth,
  annotations,
  onAnnotationChange,
  onHistorySave,
}: UseDrawingOptions) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [freehandPath, setFreehandPath] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);
  const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
  const [measureStart, setMeasureStart] = useState<{ x: number; y: number } | null>(null);

  const startDrawing = useCallback((coords: { x: number; y: number }) => {
    if (!isEditable) return;
    
    if (tool === 'freehand') {
      setFreehandPath([coords]);
      setIsDrawingFreehand(true);
      setIsDrawing(true);
    } else if (tool === 'polygon' || tool === 'callout') {
      if (!isDrawingPolygon) {
        setPolygonPoints([coords]);
        setIsDrawingPolygon(true);
      } else {
        setPolygonPoints(prev => [...prev, coords]);
      }
      setIsDrawing(true);
    } else if (tool === 'ruler' || tool === 'measure') {
      setMeasureStart(coords);
      setDrawStart(coords);
      setIsDrawing(true);
    } else {
      setDrawStart(coords);
      setIsDrawing(true);
    }
  }, [tool, isEditable, isDrawingPolygon]);

  const updateFreehandPath = useCallback((coords: { x: number; y: number }) => {
    if (tool === 'freehand' && isDrawingFreehand) {
      setFreehandPath(prev => [...prev, coords]);
    }
  }, [tool, isDrawingFreehand]);

  const finishFreehand = useCallback(() => {
    if (freehandPath.length > 1) {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'freehand',
        x: Math.min(...freehandPath.map(p => p.x)),
        y: Math.min(...freehandPath.map(p => p.y)),
        width: Math.max(...freehandPath.map(p => p.x)) - Math.min(...freehandPath.map(p => p.x)),
        height: Math.max(...freehandPath.map(p => p.y)) - Math.min(...freehandPath.map(p => p.y)),
        freehandPath: [...freehandPath],
        strokeColor,
        strokeWidth,
        page: pageNum,
      };
      const newAnnotations = [...annotations, newAnnotation];
      onAnnotationChange(newAnnotations);
      onHistorySave(newAnnotations);
    }
    setFreehandPath([]);
    setIsDrawingFreehand(false);
    setIsDrawing(false);
  }, [freehandPath, strokeColor, strokeWidth, pageNum, annotations, onAnnotationChange, onHistorySave]);

  const finishPolygon = useCallback((toolType: 'polygon' | 'callout', coords: { x: number; y: number }) => {
    if (polygonPoints.length > 2) {
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: toolType,
        x: Math.min(...polygonPoints.map(p => p.x)),
        y: Math.min(...polygonPoints.map(p => p.y)),
        width: Math.max(...polygonPoints.map(p => p.x)) - Math.min(...polygonPoints.map(p => p.x)),
        height: Math.max(...polygonPoints.map(p => p.y)) - Math.min(...polygonPoints.map(p => p.y)),
        ...(toolType === 'polygon' ? { points: [...polygonPoints] } : { calloutPoints: [...polygonPoints] }),
        strokeColor,
        fillColor,
        page: pageNum,
      };
      const newAnnotations = [...annotations, newAnnotation];
      onAnnotationChange(newAnnotations);
      onHistorySave(newAnnotations);
    }
    setPolygonPoints([]);
    setIsDrawingPolygon(false);
    setIsDrawing(false);
  }, [polygonPoints, strokeColor, fillColor, pageNum, annotations, onAnnotationChange, onHistorySave]);

  const finishMeasurement = useCallback((coords: { x: number; y: number }) => {
    if (measureStart) {
      const distance = tool === 'ruler'
        ? Math.abs(coords.x - measureStart.x)
        : Math.sqrt(Math.pow(coords.x - measureStart.x, 2) + Math.pow(coords.y - measureStart.y, 2));
      
      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: tool === 'ruler' ? 'ruler' : 'measure',
        x: measureStart.x,
        y: measureStart.y,
        width: coords.x - measureStart.x,
        height: coords.y - measureStart.y,
        distance,
        strokeColor: tool === 'ruler' ? '#000000' : '#3b82f6',
        page: pageNum,
      };
      const newAnnotations = [...annotations, newAnnotation];
      onAnnotationChange(newAnnotations);
      onHistorySave(newAnnotations);
    }
    setMeasureStart(null);
    setIsDrawing(false);
  }, [tool, measureStart, strokeColor, pageNum, annotations, onAnnotationChange, onHistorySave]);

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false);
    setDrawStart(null);
    setFreehandPath([]);
    setIsDrawingFreehand(false);
    setPolygonPoints([]);
    setIsDrawingPolygon(false);
    setMeasureStart(null);
  }, []);

  return {
    isDrawing,
    drawStart,
    freehandPath,
    isDrawingFreehand,
    polygonPoints,
    isDrawingPolygon,
    measureStart,
    startDrawing,
    updateFreehandPath,
    finishFreehand,
    finishPolygon,
    finishMeasurement,
    cancelDrawing,
  };
}


import { useState, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react';
import { toast } from '@/components/Toast';
import type { Annotation, ToolType } from '../types';

export interface UseContextMenuOptions {
  annotations: Annotation[];
  selectedAnnotations: Set<string>;
  pageNum: number;
  onAnnotationChange: (annotations: Annotation[]) => void;
  onHistorySave: (annotations: Annotation[]) => void;
  onSelectionChange: (ids: string[]) => void;
  tool: ToolType;
  isDrawingPolygon: boolean;
  polygonPoints: { x: number; y: number }[];
  strokeColor: string;
  fillColor: string;
  setPolygonPoints: (points: { x: number; y: number }[]) => void;
  setIsDrawingPolygon: (isDrawing: boolean) => void;
  setTool: Dispatch<SetStateAction<ToolType>>;
  setSelectedAnnotation: (id: string | null) => void;
  getCanvasCoordinates: (e: React.MouseEvent<HTMLCanvasElement>) => { x: number; y: number };
}

export function useContextMenu({
  annotations,
  selectedAnnotations,
  pageNum,
  onAnnotationChange,
  onHistorySave,
  onSelectionChange,
  tool,
  isDrawingPolygon,
  polygonPoints,
  strokeColor,
  fillColor,
  setPolygonPoints,
  setIsDrawingPolygon,
  setTool,
  setSelectedAnnotation,
  getCanvasCoordinates,
}: UseContextMenuOptions) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; annotationId: string | null } | null>(null);
  const [lockedAnnotations, setLockedAnnotations] = useState<Set<string>>(new Set());
  const [annotationGroups, setAnnotationGroups] = useState<Map<string, Set<string>>>(new Map());
  const [groupCounter, setGroupCounter] = useState(0);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const duplicateAnnotation = useCallback((id: string) => {
    const annotation = annotations.find(ann => ann.id === id);
    if (!annotation) return;
    
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: annotation.x + 20,
      y: annotation.y + 20,
    };
    
    const newAnnotations = [...annotations, newAnnotation];
    onAnnotationChange(newAnnotations);
    onHistorySave(newAnnotations);
    setContextMenu(null);
    toast.success('Annotation duplicated');
  }, [annotations, onAnnotationChange, onHistorySave]);

  const toggleLockAnnotation = useCallback((id: string) => {
    setLockedAnnotations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast.success('Annotation unlocked');
      } else {
        newSet.add(id);
        toast.success('Annotation locked');
      }
      return newSet;
    });
    setContextMenu(null);
  }, []);

  const groupAnnotations = useCallback((ids: string[]) => {
    if (ids.length < 2) {
      toast.warning('Select at least 2 annotations to group');
      return;
    }
    
    const groupId = `group-${groupCounter}`;
    setGroupCounter(prev => prev + 1);
    setAnnotationGroups(prev => {
      const newMap = new Map(prev);
      newMap.set(groupId, new Set(ids));
      return newMap;
    });
    setContextMenu(null);
    toast.success(`${ids.length} annotations grouped`);
  }, [groupCounter]);

  const ungroupAnnotations = useCallback((groupId: string) => {
    setAnnotationGroups(prev => {
      const newMap = new Map(prev);
      newMap.delete(groupId);
      return newMap;
    });
    toast.success('Annotations ungrouped');
  }, []);

  const alignAnnotations = useCallback((align: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedAnnotations.size < 2) {
      toast.warning('Select at least 2 annotations to align');
      return;
    }
    
    const selected = Array.from(selectedAnnotations);
    const selectedAnnos = annotations.filter(ann => selected.includes(ann.id) && ann.page === pageNum);
    
    if (selectedAnnos.length < 2) return;
    
    let newAnnotations = [...annotations];
    
    if (align === 'left') {
      const minX = Math.min(...selectedAnnos.map(a => a.x));
      selectedAnnos.forEach(ann => {
        const index = newAnnotations.findIndex(a => a.id === ann.id);
        if (index !== -1) {
          newAnnotations[index] = { ...newAnnotations[index], x: minX };
        }
      });
    } else if (align === 'right') {
      const maxX = Math.max(...selectedAnnos.map(a => (a.x + (a.width || 0))));
      selectedAnnos.forEach(ann => {
        const index = newAnnotations.findIndex(a => a.id === ann.id);
        if (index !== -1) {
          const width = ann.width || 0;
          newAnnotations[index] = { ...newAnnotations[index], x: maxX - width };
        }
      });
    } else if (align === 'center') {
      const minX = Math.min(...selectedAnnos.map(a => a.x));
      const maxX = Math.max(...selectedAnnos.map(a => (a.x + (a.width || 0))));
      const centerX = (minX + maxX) / 2;
      selectedAnnos.forEach(ann => {
        const index = newAnnotations.findIndex(a => a.id === ann.id);
        if (index !== -1) {
          const width = ann.width || 0;
          newAnnotations[index] = { ...newAnnotations[index], x: centerX - width / 2 };
        }
      });
    } else if (align === 'top') {
      const minY = Math.min(...selectedAnnos.map(a => a.y));
      selectedAnnos.forEach(ann => {
        const index = newAnnotations.findIndex(a => a.id === ann.id);
        if (index !== -1) {
          newAnnotations[index] = { ...newAnnotations[index], y: minY };
        }
      });
    } else if (align === 'bottom') {
      const maxY = Math.max(...selectedAnnos.map(a => (a.y + (a.height || 0))));
      selectedAnnos.forEach(ann => {
        const index = newAnnotations.findIndex(a => a.id === ann.id);
        if (index !== -1) {
          const height = ann.height || 0;
          newAnnotations[index] = { ...newAnnotations[index], y: maxY - height };
        }
      });
    } else if (align === 'middle') {
      const minY = Math.min(...selectedAnnos.map(a => a.y));
      const maxY = Math.max(...selectedAnnos.map(a => (a.y + (a.height || 0))));
      const centerY = (minY + maxY) / 2;
      selectedAnnos.forEach(ann => {
        const index = newAnnotations.findIndex(a => a.id === ann.id);
        if (index !== -1) {
          const height = ann.height || 0;
          newAnnotations[index] = { ...newAnnotations[index], y: centerY - height / 2 };
        }
      });
    }
    
    onAnnotationChange(newAnnotations);
    onHistorySave(newAnnotations);
    setContextMenu(null);
    toast.success(`Annotations aligned ${align}`);
  }, [selectedAnnotations, annotations, pageNum, onAnnotationChange, onHistorySave]);

  const distributeAnnotations = useCallback((direction: 'horizontal' | 'vertical') => {
    if (selectedAnnotations.size < 3) {
      toast.warning('Select at least 3 annotations to distribute');
      return;
    }
    
    const selected = Array.from(selectedAnnotations);
    const selectedAnnos = annotations.filter(ann => selected.includes(ann.id) && ann.page === pageNum).sort((a, b) => {
      if (direction === 'horizontal') {
        return a.x - b.x;
      } else {
        return a.y - b.y;
      }
    });
    
    if (selectedAnnos.length < 3) return;
    
    let newAnnotations = [...annotations];
    
    if (direction === 'horizontal') {
      const firstX = selectedAnnos[0].x;
      const lastX = selectedAnnos[selectedAnnos.length - 1].x + (selectedAnnos[selectedAnnos.length - 1].width || 0);
      const totalWidth = lastX - firstX;
      const spacing = totalWidth / (selectedAnnos.length - 1);
      
      let currentX = firstX;
      selectedAnnos.forEach((ann, index) => {
        if (index > 0 && index < selectedAnnos.length - 1) {
          const index = newAnnotations.findIndex(a => a.id === ann.id);
          if (index !== -1) {
            newAnnotations[index] = { ...newAnnotations[index], x: currentX };
          }
        }
        currentX += spacing;
      });
    } else {
      const firstY = selectedAnnos[0].y;
      const lastY = selectedAnnos[selectedAnnos.length - 1].y + (selectedAnnos[selectedAnnos.length - 1].height || 0);
      const totalHeight = lastY - firstY;
      const spacing = totalHeight / (selectedAnnos.length - 1);
      
      let currentY = firstY;
      selectedAnnos.forEach((ann, index) => {
        if (index > 0 && index < selectedAnnos.length - 1) {
          const index = newAnnotations.findIndex(a => a.id === ann.id);
          if (index !== -1) {
            newAnnotations[index] = { ...newAnnotations[index], y: currentY };
          }
        }
        currentY += spacing;
      });
    }
    
    onAnnotationChange(newAnnotations);
    onHistorySave(newAnnotations);
    setContextMenu(null);
    toast.success(`Annotations distributed ${direction}`);
  }, [selectedAnnotations, annotations, pageNum, onAnnotationChange, onHistorySave]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCanvasCoordinates(e);
    
    // Close polygon/callout on right-click
    if ((tool === 'polygon' || tool === 'callout') && isDrawingPolygon && polygonPoints.length > 2) {
      // Finish polygon/callout
      const newAnnotations = [...annotations];
      if (tool === 'polygon') {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'polygon',
          x: Math.min(...polygonPoints.map(p => p.x)),
          y: Math.min(...polygonPoints.map(p => p.y)),
          width: Math.max(...polygonPoints.map(p => p.x)) - Math.min(...polygonPoints.map(p => p.x)),
          height: Math.max(...polygonPoints.map(p => p.y)) - Math.min(...polygonPoints.map(p => p.y)),
          points: [...polygonPoints],
          strokeColor: strokeColor,
          fillColor: fillColor,
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Polygon added');
      } else if (tool === 'callout') {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'callout',
          x: Math.min(...polygonPoints.map(p => p.x)),
          y: Math.min(...polygonPoints.map(p => p.y)),
          width: Math.max(...polygonPoints.map(p => p.x)) - Math.min(...polygonPoints.map(p => p.x)),
          height: Math.max(...polygonPoints.map(p => p.y)) - Math.min(...polygonPoints.map(p => p.y)),
          calloutPoints: [...polygonPoints],
          strokeColor: strokeColor,
          fillColor: fillColor,
          page: pageNum,
        };
        newAnnotations.push(newAnnotation);
        toast.success('Callout added');
      }
      onAnnotationChange(newAnnotations);
      onHistorySave(newAnnotations);
      setPolygonPoints([]);
      setIsDrawingPolygon(false);
      setTool(null);
      return;
    }
    
    const pageAnnotations = annotations.filter(ann => ann.page === pageNum && !lockedAnnotations.has(ann.id));
    
    // Find annotation at click position
    let clickedAnnotation: Annotation | null = null;
    for (const ann of pageAnnotations) {
      let isInside = false;
      if (ann.type === 'text' && ann.text) {
        const fontSize = ann.fontSize || 16;
        const textWidth = (ann.text.length * fontSize * 0.6);
        let textX = ann.x;
        if (ann.textAlign === 'center') {
          textX = ann.x - textWidth / 2;
        } else if (ann.textAlign === 'right') {
          textX = ann.x - textWidth;
        }
        isInside = (
          coords.x >= textX &&
          coords.x <= textX + textWidth &&
          coords.y >= ann.y - fontSize &&
          coords.y <= ann.y
        );
      } else if (ann.width && ann.height) {
        isInside = (
          coords.x >= ann.x &&
          coords.x <= ann.x + ann.width &&
          coords.y >= ann.y &&
          coords.y <= ann.y + ann.height
        );
      }
      if (isInside) {
        clickedAnnotation = ann;
        break;
      }
    }
    
    if (clickedAnnotation) {
      setContextMenu({ x: e.clientX, y: e.clientY, annotationId: clickedAnnotation.id });
      setSelectedAnnotation(clickedAnnotation.id);
    } else {
      setContextMenu(null);
    }
  }, [annotations, pageNum, lockedAnnotations, tool, isDrawingPolygon, polygonPoints, strokeColor, fillColor, getCanvasCoordinates, setPolygonPoints, setIsDrawingPolygon, setTool, setSelectedAnnotation, onAnnotationChange, onHistorySave, setContextMenu]);

  return {
    contextMenu,
    setContextMenu,
    lockedAnnotations,
    annotationGroups,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
    ungroupAnnotations,
    alignAnnotations,
    distributeAnnotations,
    handleCanvasContextMenu,
  };
}

import { useCallback } from 'react';
import { toast } from '@/components/Toast';
import type { Annotation } from '../types';

export interface UseAnnotationOperationsOptions {
  annotations: Annotation[];
  selectedAnnotation: string | null;
  selectedAnnotations: Set<string>;
  copiedAnnotations: Annotation[];
  pageNum: number;
  setAnnotations: (annotations: Annotation[]) => void;
  setCopiedAnnotations: (annotations: Annotation[]) => void;
  setSelectedAnnotation: (id: string | null) => void;
  setSelectedAnnotations: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  saveToHistory: (annotations: Annotation[]) => void;
  duplicateAnnotation: (id: string) => void;
  toggleLockAnnotation: (id: string) => void;
  groupAnnotations: (ids: string[]) => void;
}

export function useBatchAnnotations(options: UseAnnotationOperationsOptions) {
  const {
    annotations,
    selectedAnnotations,
    setAnnotations,
    setSelectedAnnotations,
    saveToHistory,
  } = options;

  const batchSelectAnnotations = useCallback((annotationIds: string[]) => {
    setSelectedAnnotations(new Set(annotationIds));
  }, [setSelectedAnnotations]);
  
  const batchDeleteAnnotations = useCallback(() => {
    if (selectedAnnotations.size === 0) {
      toast.info('No annotations selected');
      return;
    }
    if (confirm(`Delete ${selectedAnnotations.size} annotation(s)?`)) {
      const newAnnotations = annotations.filter(ann => !selectedAnnotations.has(ann.id));
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      setSelectedAnnotations(new Set());
      toast.success(`${selectedAnnotations.size} annotation(s) deleted`);
    }
  }, [selectedAnnotations, annotations, setAnnotations, setSelectedAnnotations, saveToHistory]);
  
  const batchApplyFormat = useCallback((format: Partial<Annotation>) => {
    if (selectedAnnotations.size === 0) {
      toast.info('No annotations selected');
      return;
    }
    const newAnnotations = annotations.map(ann => {
      if (selectedAnnotations.has(ann.id) && ann.type === 'text') {
        return { ...ann, ...format };
      }
      return ann;
    });
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    toast.success(`Format applied to ${selectedAnnotations.size} annotation(s)`);
  }, [selectedAnnotations, annotations, setAnnotations, saveToHistory]);

  return {
    batchSelectAnnotations,
    batchDeleteAnnotations,
    batchApplyFormat,
  };
}

export function useAnnotationOperations(options: UseAnnotationOperationsOptions) {
  const {
    annotations,
    selectedAnnotation,
    selectedAnnotations,
    copiedAnnotations,
    pageNum,
    setAnnotations,
    setCopiedAnnotations,
    setSelectedAnnotation,
    setSelectedAnnotations,
    saveToHistory,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
  } = options;

  const copyAnnotations = useCallback(() => {
    if (selectedAnnotations.size > 0) {
      const copied = annotations.filter(ann => selectedAnnotations.has(ann.id));
      setCopiedAnnotations(copied);
      toast.success(`${copied.length} annotation(s) copied`);
    } else if (selectedAnnotation) {
      const copied = annotations.find(ann => ann.id === selectedAnnotation);
      if (copied) {
        setCopiedAnnotations([copied]);
        toast.success('Annotation copied');
      }
    }
  }, [annotations, selectedAnnotation, selectedAnnotations, setCopiedAnnotations]);

  const pasteAnnotations = useCallback(() => {
    if (copiedAnnotations.length === 0) return;
    const newAnnotations = [...annotations];
    copiedAnnotations.forEach(copied => {
      const newAnnotation: Annotation = {
        ...copied,
        id: Date.now().toString() + Math.random(),
        page: pageNum,
        x: copied.x + 20, // Offset slightly
        y: copied.y + 20,
      };
      newAnnotations.push(newAnnotation);
    });
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    toast.success(`${copiedAnnotations.length} annotation(s) pasted`);
  }, [copiedAnnotations, annotations, pageNum, setAnnotations, saveToHistory]);

  const removeAnnotation = useCallback((id: string) => {
    const newAnnotations = annotations.filter(ann => ann.id !== id);
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    if (selectedAnnotation === id) {
      setSelectedAnnotation(null);
    }
    if (selectedAnnotations.has(id)) {
      setSelectedAnnotations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
    toast.success('Annotation deleted');
  }, [annotations, selectedAnnotation, selectedAnnotations, setAnnotations, setSelectedAnnotation, setSelectedAnnotations, saveToHistory]);

  const removeSelectedAnnotations = useCallback(() => {
    if (selectedAnnotations.size > 0) {
      const newAnnotations = annotations.filter(ann => !selectedAnnotations.has(ann.id));
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      setSelectedAnnotations(new Set());
      toast.success(`${selectedAnnotations.size} annotation(s) deleted`);
    } else if (selectedAnnotation) {
      removeAnnotation(selectedAnnotation);
    }
  }, [annotations, selectedAnnotation, selectedAnnotations, setAnnotations, setSelectedAnnotations, saveToHistory, removeAnnotation]);

  const applyFormatToSelectedText = useCallback((format: Partial<Annotation>, selectedTextForFormatting: string | null, selectedAnnotations: Set<string>) => {
    if (selectedTextForFormatting) {
      const newAnnotations = annotations.map(ann => {
        if (ann.id === selectedTextForFormatting) {
          return { ...ann, ...format };
        }
        return ann;
      });
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      toast.success('Format applied');
    } else if (selectedAnnotations.size > 0) {
      const newAnnotations = annotations.map(ann => {
        if (selectedAnnotations.has(ann.id) && ann.type === 'text') {
          return { ...ann, ...format };
        }
        return ann;
      });
      setAnnotations(newAnnotations);
      saveToHistory(newAnnotations);
      toast.success(`Format applied to ${selectedAnnotations.size} annotation(s)`);
    }
  }, [annotations, setAnnotations, saveToHistory]);

  const applyAnnotationTemplate = useCallback((template: { name: string; annotation: Partial<Annotation> }, pageNum: number) => {
    if (!template.annotation.type) return;
    
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type: template.annotation.type as any,
      x: 100,
      y: 100,
      page: pageNum,
      ...template.annotation,
    } as Annotation;
    
    const newAnnotations = [...annotations, newAnnotation];
    setAnnotations(newAnnotations);
    saveToHistory(newAnnotations);
    toast.success(`Template "${template.name}" applied`);
  }, [annotations, setAnnotations, saveToHistory]);

  const handleBatchSelection = useCallback((startX: number, startY: number, endX: number, endY: number, pageNum: number, setSelectedAnnotations: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void) => {
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    
    const pageAnnotations = annotations.filter(ann => ann.page === pageNum);
    const selected = pageAnnotations.filter(ann => {
      if (ann.width && ann.height) {
        return ann.x >= minX && ann.x + ann.width <= maxX &&
               ann.y >= minY && ann.y + ann.height <= maxY;
      }
      return ann.x >= minX && ann.x <= maxX && ann.y >= minY && ann.y <= maxY;
    });
    
    if (selected.length > 0) {
      setSelectedAnnotations(new Set(selected.map(a => a.id)));
      toast.info(`${selected.length} annotation(s) selected`);
    }
  }, [annotations]);

  return {
    copyAnnotations,
    pasteAnnotations,
    removeAnnotation,
    removeSelectedAnnotations,
    applyFormatToSelectedText,
    applyAnnotationTemplate,
    handleBatchSelection,
  };
}


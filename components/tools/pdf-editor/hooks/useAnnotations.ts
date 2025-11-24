// Annotations Management Hook
import { useState, useCallback, useRef } from 'react';
import { toast } from '@/components/Toast';
import type { Annotation, ToolType } from '../types';

interface UseAnnotationsProps {
  pageNum: number;
  onAnnotationChange?: (annotations: Annotation[]) => void;
}

export const useAnnotations = ({
  pageNum,
  onAnnotationChange,
}: UseAnnotationsProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyLimit = 50;

  // Save to history
  const saveToHistory = useCallback((newAnnotations: Annotation[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newAnnotations]);
      return newHistory.slice(-historyLimit);
    });
    setHistoryIndex(prev => Math.min(prev + 1, historyLimit - 1));
  }, [historyIndex, historyLimit]);

  // Add annotation
  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => {
      const newAnnotations = [...prev, annotation];
      saveToHistory(newAnnotations);
      onAnnotationChange?.(newAnnotations);
      return newAnnotations;
    });
    toast.success('Annotation added');
  }, [saveToHistory, onAnnotationChange]);

  // Update annotation
  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => {
      const newAnnotations = prev.map(ann => 
        ann.id === id ? { ...ann, ...updates } : ann
      );
      saveToHistory(newAnnotations);
      onAnnotationChange?.(newAnnotations);
      return newAnnotations;
    });
  }, [saveToHistory, onAnnotationChange]);

  // Delete annotation
  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => {
      const newAnnotations = prev.filter(ann => ann.id !== id);
      saveToHistory(newAnnotations);
      onAnnotationChange?.(newAnnotations);
      return newAnnotations;
    });
    setSelectedAnnotation(null);
    setSelectedAnnotations(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('Annotation deleted');
  }, [saveToHistory, onAnnotationChange]);

  // Delete multiple annotations
  const deleteAnnotations = useCallback((ids: string[]) => {
    setAnnotations(prev => {
      const newAnnotations = prev.filter(ann => !ids.includes(ann.id));
      saveToHistory(newAnnotations);
      onAnnotationChange?.(newAnnotations);
      return newAnnotations;
    });
    setSelectedAnnotations(new Set());
    toast.success(`${ids.length} annotation(s) deleted`);
  }, [saveToHistory, onAnnotationChange]);

  // Clear all annotations
  const clearAnnotations = useCallback(() => {
    setAnnotations([]);
    setSelectedAnnotation(null);
    setSelectedAnnotations(new Set());
    saveToHistory([]);
    onAnnotationChange?.([]);
    toast.info('All annotations cleared');
  }, [saveToHistory, onAnnotationChange]);

  // Get annotations for page
  const getPageAnnotations = useCallback((page: number) => {
    return annotations.filter(ann => ann.page === page);
  }, [annotations]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousAnnotations = history[newIndex];
      setAnnotations([...previousAnnotations]);
      onAnnotationChange?.(previousAnnotations);
      toast.info('Undone');
    } else {
      toast.info('Nothing to undo');
    }
  }, [historyIndex, history, onAnnotationChange]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextAnnotations = history[newIndex];
      setAnnotations([...nextAnnotations]);
      onAnnotationChange?.(nextAnnotations);
      toast.info('Redone');
    } else {
      toast.info('Nothing to redo');
    }
  }, [historyIndex, history, onAnnotationChange]);

  // Select annotation
  const selectAnnotation = useCallback((id: string | null, multiSelect: boolean = false) => {
    if (multiSelect && id) {
      setSelectedAnnotations(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } else {
      setSelectedAnnotation(id);
      setSelectedAnnotations(new Set(id ? [id] : []));
    }
  }, []);

  return {
    annotations,
    selectedAnnotation,
    selectedAnnotations,
    editingAnnotation,
    history,
    historyIndex,
    setAnnotations,
    setSelectedAnnotation,
    setSelectedAnnotations,
    setEditingAnnotation,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    deleteAnnotations,
    clearAnnotations,
    getPageAnnotations,
    selectAnnotation,
    undo,
    redo,
    saveToHistory,
  };
};





// Keyboard Shortcuts Hook
import { useEffect } from 'react';
import { toast } from '@/components/Toast';
import type { ToolType } from '../types';

interface UseKeyboardShortcutsProps {
  tool: ToolType;
  textEditMode: boolean;
  showGrid: boolean;
  showPageManager: boolean;
  showPageJump: boolean;
  showKeyboardShortcuts: boolean;
  showHelp: boolean;
  showSettings: boolean;
  showFindReplace: boolean;
  selectedAnnotation: string | null;
  selectedAnnotations: Set<string>;
  annotations: any[];
  textEditHistory: any[];
  textEditHistoryIndex: number;
  setTool: (tool: ToolType) => void;
  setTextEditMode: (mode: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowPageManager: (show: boolean) => void;
  setShowPageJump: (show: boolean) => void;
  setShowKeyboardShortcuts: (show: boolean) => void;
  setShowHelp: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowFindReplace: (show: boolean) => void;
  undo: () => void;
  redo: () => void;
  copyAnnotations: () => void;
  pasteAnnotations: () => void;
  removeAnnotation: (id: string) => void;
  duplicateAnnotation: (id: string) => void;
  toggleLockAnnotation: (id: string) => void;
  groupAnnotations: (ids: string[]) => void;
  setAnnotations: (annotations: any[]) => void;
  saveToHistory: (annotations: any[]) => void;
  setSelectedAnnotations: (annotations: Set<string>) => void;
  setSelectedAnnotation: (id: string | null) => void;
  undoTextEdit: () => void;
  redoTextEdit: () => void;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  setFontWeight: (weight: 'normal' | 'bold') => void;
  setFontStyle: (style: 'normal' | 'italic') => void;
  setTextDecoration: (decoration: 'none' | 'underline') => void;
}

export const useKeyboardShortcuts = (props: UseKeyboardShortcutsProps) => {
  const {
    tool,
    textEditMode,
    showGrid,
    showPageManager,
    showPageJump,
    showKeyboardShortcuts,
    showHelp,
    showSettings,
    showFindReplace,
    selectedAnnotation,
    selectedAnnotations,
    annotations,
    textEditHistory,
    textEditHistoryIndex,
    setTool,
    setTextEditMode,
    setShowGrid,
    setShowPageManager,
    setShowPageJump,
    setShowKeyboardShortcuts,
    setShowHelp,
    setShowSettings,
    setShowFindReplace,
    undo,
    redo,
    copyAnnotations,
    pasteAnnotations,
    removeAnnotation,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
    setAnnotations,
    saveToHistory,
    setSelectedAnnotations,
    setSelectedAnnotation,
    undoTextEdit,
    redoTextEdit,
    fontWeight,
    fontStyle,
    textDecoration,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
  } = props;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd combinations
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 'c') {
          e.preventDefault();
          copyAnnotations();
        } else if (e.key === 'v') {
          e.preventDefault();
          pasteAnnotations();
        } else if (e.key === 'b') {
          e.preventDefault();
          if (tool === 'text') setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
        } else if (e.key === 'i') {
          e.preventDefault();
          if (tool === 'text') setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic');
        } else if (e.key === 'u') {
          e.preventDefault();
          if (tool === 'text') setTextDecoration(textDecoration === 'underline' ? 'none' : 'underline');
        } else if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          if (selectedAnnotation) {
            duplicateAnnotation(selectedAnnotation);
          } else if (selectedAnnotations.size > 0) {
            // Duplicate all selected
            Array.from(selectedAnnotations).forEach(id => duplicateAnnotation(id));
          }
        } else if (e.key === 'l' || e.key === 'L') {
          e.preventDefault();
          if (selectedAnnotation) {
            toggleLockAnnotation(selectedAnnotation);
          } else if (selectedAnnotations.size > 0) {
            // Toggle lock for all selected
            Array.from(selectedAnnotations).forEach(id => toggleLockAnnotation(id));
          }
        } else if (e.shiftKey && (e.key === 'g' || e.key === 'G')) {
          e.preventDefault();
          if (selectedAnnotations.size >= 2) {
            groupAnnotations(Array.from(selectedAnnotations));
          } else {
            toast.warning('Select at least 2 annotations to group');
          }
        }
      }
      
      // Single key shortcuts (only when not typing)
      if (!e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedAnnotations.size > 0) {
            const newAnnotations = annotations.filter(ann => !selectedAnnotations.has(ann.id));
            setAnnotations(newAnnotations);
            saveToHistory(newAnnotations);
            setSelectedAnnotations(new Set());
            toast.success('Annotations deleted');
          } else if (selectedAnnotation) {
            removeAnnotation(selectedAnnotation);
          }
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setShowGrid(!showGrid);
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setShowPageManager(!showPageManager);
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'g' || e.key === 'G')) {
          e.preventDefault();
          setShowPageJump(true);
        } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          setShowHelp(!showHelp);
        } else if ((e.ctrlKey || e.metaKey) && (e.key === ',' || e.key === ',')) {
          e.preventDefault();
          setShowSettings(!showSettings);
        } else if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          if (!textEditMode) {
            setTool('edit-text');
            setTextEditMode(true);
            toast.info('Edit mode: Click on text to edit');
          } else {
            setTool(null);
            setTextEditMode(false);
          }
        }
      }
      
      // Phase 6: Text edit undo/redo (when in text edit mode)
      if (textEditMode && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'z' && !e.shiftKey && textEditHistoryIndex >= 0) {
          e.preventDefault();
          undoTextEdit();
        } else if ((e.key === 'y' || (e.key === 'z' && e.shiftKey)) && textEditHistoryIndex < textEditHistory.length - 1) {
          e.preventDefault();
          redoTextEdit();
        }
      }
      
      // Ctrl/Cmd + F/H for Find & Replace
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setShowFindReplace(!showFindReplace);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setShowFindReplace(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    tool,
    textEditMode,
    showGrid,
    showPageManager,
    showPageJump,
    showKeyboardShortcuts,
    showHelp,
    showSettings,
    showFindReplace,
    selectedAnnotation,
    selectedAnnotations,
    annotations,
    textEditHistory,
    textEditHistoryIndex,
    setTool,
    setTextEditMode,
    setShowGrid,
    setShowPageManager,
    setShowPageJump,
    setShowKeyboardShortcuts,
    setShowHelp,
    setShowSettings,
    setShowFindReplace,
    undo,
    redo,
    copyAnnotations,
    pasteAnnotations,
    removeAnnotation,
    duplicateAnnotation,
    toggleLockAnnotation,
    groupAnnotations,
    setAnnotations,
    saveToHistory,
    setSelectedAnnotations,
    setSelectedAnnotation,
    undoTextEdit,
    redoTextEdit,
    fontWeight,
    fontStyle,
    textDecoration,
    setFontWeight,
    setFontStyle,
    setTextDecoration,
  ]);
};



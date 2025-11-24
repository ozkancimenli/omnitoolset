// Multi-Cursor Editing for PDF Editor
'use client';

import { useState, useCallback, useRef } from 'react';
import type { PdfTextRun } from '../types';

export interface CursorPosition {
  runId: string;
  charIndex: number;
  x: number;
  y: number;
  id: string; // Unique cursor ID
}

export interface MultiCursorState {
  cursors: CursorPosition[];
  activeCursorId: string | null;
  selections: Array<{
    start: CursorPosition;
    end: CursorPosition;
  }>;
}

/**
 * Multi-cursor editing manager
 */
export class MultiCursorManager {
  private cursors: Map<string, CursorPosition> = new Map();
  private selections: Array<{ start: CursorPosition; end: CursorPosition }> = [];
  private activeCursorId: string | null = null;

  /**
   * Add a new cursor
   */
  addCursor(cursor: CursorPosition): void {
    this.cursors.set(cursor.id, cursor);
    if (!this.activeCursorId) {
      this.activeCursorId = cursor.id;
    }
  }

  /**
   * Remove a cursor
   */
  removeCursor(cursorId: string): void {
    this.cursors.delete(cursorId);
    if (this.activeCursorId === cursorId) {
      this.activeCursorId = Array.from(this.cursors.keys())[0] || null;
    }
  }

  /**
   * Update cursor position
   */
  updateCursor(cursorId: string, position: Partial<CursorPosition>): void {
    const cursor = this.cursors.get(cursorId);
    if (cursor) {
      this.cursors.set(cursorId, { ...cursor, ...position });
    }
  }

  /**
   * Set active cursor
   */
  setActiveCursor(cursorId: string): void {
    if (this.cursors.has(cursorId)) {
      this.activeCursorId = cursorId;
    }
  }

  /**
   * Add selection
   */
  addSelection(start: CursorPosition, end: CursorPosition): void {
    this.selections.push({ start, end });
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selections = [];
  }

  /**
   * Get all cursors
   */
  getCursors(): CursorPosition[] {
    return Array.from(this.cursors.values());
  }

  /**
   * Get active cursor
   */
  getActiveCursor(): CursorPosition | null {
    if (!this.activeCursorId) return null;
    return this.cursors.get(this.activeCursorId) || null;
  }

  /**
   * Get selections
   */
  getSelections(): Array<{ start: CursorPosition; end: CursorPosition }> {
    return this.selections;
  }

  /**
   * Clear all cursors
   */
  clear(): void {
    this.cursors.clear();
    this.selections = [];
    this.activeCursorId = null;
  }
}

/**
 * Hook for multi-cursor editing
 */
export const useMultiCursorEditing = () => {
  const managerRef = useRef(new MultiCursorManager());
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [activeCursorId, setActiveCursorId] = useState<string | null>(null);
  const [selections, setSelections] = useState<Array<{ start: CursorPosition; end: CursorPosition }>>([]);

  const addCursor = useCallback((cursor: CursorPosition) => {
    managerRef.current.addCursor(cursor);
    setCursors(managerRef.current.getCursors());
    setActiveCursorId(managerRef.current.getActiveCursor()?.id || null);
  }, []);

  const removeCursor = useCallback((cursorId: string) => {
    managerRef.current.removeCursor(cursorId);
    setCursors(managerRef.current.getCursors());
    setActiveCursorId(managerRef.current.getActiveCursor()?.id || null);
  }, []);

  const updateCursor = useCallback((cursorId: string, position: Partial<CursorPosition>) => {
    managerRef.current.updateCursor(cursorId, position);
    setCursors(managerRef.current.getCursors());
  }, []);

  const setActiveCursor = useCallback((cursorId: string) => {
    managerRef.current.setActiveCursor(cursorId);
    setActiveCursorId(cursorId);
  }, []);

  const addSelection = useCallback((start: CursorPosition, end: CursorPosition) => {
    managerRef.current.addSelection(start, end);
    setSelections(managerRef.current.getSelections());
  }, []);

  const clearSelections = useCallback(() => {
    managerRef.current.clearSelections();
    setSelections([]);
  }, []);

  const clearAll = useCallback(() => {
    managerRef.current.clear();
    setCursors([]);
    setActiveCursorId(null);
    setSelections([]);
  }, []);

  return {
    cursors,
    activeCursorId,
    selections,
    addCursor,
    removeCursor,
    updateCursor,
    setActiveCursor,
    addSelection,
    clearSelections,
    clearAll,
    getActiveCursor: () => managerRef.current.getActiveCursor(),
  };
};

/**
 * Column selection mode
 */
export const useColumnSelection = () => {
  const [isColumnMode, setIsColumnMode] = useState(false);
  const [startColumn, setStartColumn] = useState<{ x: number; y: number } | null>(null);
  const [endColumn, setEndColumn] = useState<{ x: number; y: number } | null>(null);

  const startColumnSelection = useCallback((x: number, y: number) => {
    setIsColumnMode(true);
    setStartColumn({ x, y });
    setEndColumn({ x, y });
  }, []);

  const updateColumnSelection = useCallback((x: number, y: number) => {
    if (isColumnMode) {
      setEndColumn({ x, y });
    }
  }, [isColumnMode]);

  const endColumnSelection = useCallback(() => {
    setIsColumnMode(false);
    const result = startColumn && endColumn ? { start: startColumn, end: endColumn } : null;
    setStartColumn(null);
    setEndColumn(null);
    return result;
  }, [startColumn, endColumn]);

  return {
    isColumnMode,
    startColumn,
    endColumn,
    startColumnSelection,
    updateColumnSelection,
    endColumnSelection,
  };
};



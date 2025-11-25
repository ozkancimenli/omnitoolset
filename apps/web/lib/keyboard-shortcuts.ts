'use client';

import { useEffect } from 'react';

export type ShortcutAction = 
  | 'search'
  | 'home'
  | 'categories'
  | 'clear'
  | 'escape';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: ShortcutAction;
  description: string;
}

export const shortcuts: Shortcut[] = [
  {
    key: 'k',
    meta: true,
    action: 'search',
    description: 'Focus search (Cmd/Ctrl + K)',
  },
  {
    key: 'h',
    meta: true,
    action: 'home',
    description: 'Go to home (Cmd/Ctrl + H)',
  },
  {
    key: 'c',
    meta: true,
    action: 'categories',
    description: 'Go to categories (Cmd/Ctrl + C)',
  },
  {
    key: 'Escape',
    action: 'clear',
    description: 'Clear search/filters (Esc)',
  },
];

export function useKeyboardShortcuts(
  onAction: (action: ShortcutAction) => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const shortcut = shortcuts.find(s => {
        if (s.key.toLowerCase() !== e.key.toLowerCase()) return false;
        if (s.ctrl && !e.ctrlKey && !e.metaKey) return false;
        if (s.meta && !e.ctrlKey && !e.metaKey) return false;
        if (s.shift && !e.shiftKey) return false;
        return true;
      });

      if (shortcut) {
        e.preventDefault();
        onAction(shortcut.action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAction]);
}


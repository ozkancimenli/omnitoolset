'use client';

import React from 'react';

interface KeyboardShortcutsPanelProps {
  show: boolean;
  onClose: () => void;
  onShowTextStatistics?: () => void;
  onShowTextStyles?: () => void;
  onShowAIPanel?: () => void;
  onShowCollaboration?: () => void;
  onShowOCRPanel?: () => void;
  onShowCloudSync?: () => void;
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({
  show,
  onClose,
  onShowTextStatistics,
  onShowTextStyles,
  onShowAIPanel,
  onShowCollaboration,
  onShowOCRPanel,
  onShowCloudSync,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Navigation</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Previous Page</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">←</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Next Page</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">→</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Jump to Page</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+G</kbd>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Editing</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Undo</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Redo</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+Y</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Copy</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Paste</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+V</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Delete</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Delete</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Duplicate</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Lock/Unlock</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+L</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Group</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+Shift+G</kbd>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Tools</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Edit Text Mode</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">E</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Toggle Grid</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">G</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Page Manager</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">P</kbd>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Search</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Find</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+F</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Find & Replace</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+H</kbd>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Text Formatting</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Bold</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Italic</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Underline</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">Ctrl+U</kbd>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Help</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">?</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


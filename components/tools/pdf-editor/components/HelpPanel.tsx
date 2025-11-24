'use client';

import React from 'react';

interface HelpPanelProps {
  show: boolean;
  onClose: () => void;
  onShowKeyboardShortcuts: () => void;
  onStartTutorial: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  show,
  onClose,
  onShowKeyboardShortcuts,
  onStartTutorial,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Help & Support</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Getting Started</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>1. Upload your PDF file by clicking the upload area or dragging and dropping</p>
              <p>2. Use the toolbar to select tools (Text, Shapes, Stamps, etc.)</p>
              <p>3. Click on the PDF to add annotations</p>
              <p>4. Use the download button to save your edited PDF</p>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Tips & Tricks</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
              <li>Double-click text annotations to edit them</li>
              <li>Right-click annotations for context menu options</li>
              <li>Use Ctrl+Z / Ctrl+Y for undo/redo</li>
              <li>Press '?' to see all keyboard shortcuts</li>
              <li>Use templates for quick annotation creation</li>
              <li>Select multiple annotations with Ctrl+Click</li>
            </ul>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Common Questions</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-slate-900 dark:text-white mb-1">How do I edit existing text in the PDF?</p>
                <p className="text-slate-600 dark:text-slate-400">Click the "Edit PDF Text" button (E key) and then click on any text in the PDF to edit it.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white mb-1">Can I undo changes?</p>
                <p className="text-slate-600 dark:text-slate-400">Yes! Use Ctrl+Z to undo and Ctrl+Y to redo. You can undo multiple steps.</p>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white mb-1">How do I delete a page?</p>
                <p className="text-slate-600 dark:text-slate-400">Open the Page Manager (P key) and use the delete button for the page you want to remove.</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div className="flex gap-3">
            <button onClick={() => { onClose(); onShowKeyboardShortcuts(); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              View Keyboard Shortcuts
            </button>
            <button onClick={() => { onClose(); onStartTutorial(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm">
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};





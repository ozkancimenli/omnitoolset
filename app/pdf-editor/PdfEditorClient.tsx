'use client';

import { useState } from 'react';
import PdfEditor from '@/components/tools/pdf-editor';

/**
 * PDF Editor - Standalone Application Client
 * 
 * This component represents a completely independent PDF editing application.
 * It has its own minimal UI, separate from the main website design.
 * Think of it as a separate app running under OmniToolset.
 */
export default function PdfEditorClient() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Minimal App Header - Independent Application Identity */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 flex-shrink-0 z-50 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            {/* App Logo & Name */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl">✏️</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">PDF Editor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Professional PDF Editing</p>
              </div>
            </div>

            {/* App Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Keyboard Shortcuts"
              >
                {showHelp ? '✕ Hide' : '⌨️ Help'}
              </button>
              <a
                href="/"
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                ← Back
              </a>
            </div>
          </div>
        </div>

        {/* Collapsible Help Panel */}
        {showHelp && (
          <div className="border-t border-gray-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/20 px-6 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1.5">✏️ Tools</div>
                <div className="space-y-0.5 text-blue-700 dark:text-blue-400">
                  <div><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">T</kbd> Text | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">H</kbd> Highlight</div>
                  <div><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">R</kbd> Rectangle | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">C</kbd> Circle</div>
                  <div><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">L</kbd> Line | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">A</kbd> Arrow</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1.5">⌨️ Shortcuts</div>
                <div className="space-y-0.5 text-blue-700 dark:text-blue-400">
                  <div><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">Ctrl+Z</kbd> Undo | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">Ctrl+Y</kbd> Redo</div>
                  <div><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">+</kbd> Zoom In | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded text-[10px]">-</kbd> Zoom Out</div>
                  <div className="text-[10px]">Drag to create shapes</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-300 mb-1.5">💡 Tips</div>
                <div className="space-y-0.5 text-blue-700 dark:text-blue-400 text-[10px]">
                  <div>Click annotations to select/delete</div>
                  <div>Use thumbnails for navigation</div>
                  <div>All edits saved to PDF</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Full-Screen Editor Container */}
      <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-slate-950">
        <div className="h-full">
          {/* Editor Component - Takes Full Available Space */}
          <PdfEditor />
        </div>
      </main>

      {/* Minimal App Footer - Application Info */}
      <footer className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-slate-800 flex-shrink-0 py-2 px-6">
        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span>Powered by <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">OmniToolset</a></span>
            <span>•</span>
            <span>100% Free • No Registration • No Watermarks</span>
          </div>
          <div className="flex items-center gap-2">
            <span>v1.0</span>
            <span>•</span>
            <span>Professional PDF Editing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

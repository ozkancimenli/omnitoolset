'use client';

import { useState } from 'react';
import Link from 'next/link';
import PdfEditor from '@/components/tools/pdf-editor';

export default function PdfEditorClient() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Minimal Header - PDF Editor Specific */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform">
                  X
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-lg">OmniToolset</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">All the tools you need in one place</div>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-slate-700" />
              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">PDF Editor</div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                {showHelp ? 'Hide Help' : 'Show Help'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Help Panel */}
      {showHelp && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900">
          <div className="max-w-[1920px] mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">✏️ Editing Tools</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-400 text-xs">
                  <li><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">T</kbd> Text | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">H</kbd> Highlight</li>
                  <li><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">R</kbd> Rectangle | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">C</kbd> Circle</li>
                  <li><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">L</kbd> Line | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">A</kbd> Arrow</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">⌨️ Shortcuts</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-400 text-xs">
                  <li><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">Ctrl+Z</kbd> Undo | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">Ctrl+Y</kbd> Redo</li>
                  <li><kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">+</kbd> Zoom In | <kbd className="px-1.5 py-0.5 bg-blue-200 dark:bg-blue-900 rounded">-</kbd> Zoom Out</li>
                  <li>Drag to create shapes and highlights</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Tips</h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-400 text-xs">
                  <li>Click annotations to select and delete</li>
                  <li>Use page thumbnails for quick navigation</li>
                  <li>All edits are saved to the PDF file</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area - Full Width, Clean Design */}
      <main className="max-w-[1920px] mx-auto">
        <div className="px-6 py-6">
          {/* Editor Component - Full Width */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <PdfEditor />
          </div>

          {/* Feature Highlights - Below Editor */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">✏️</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Text & Annotations</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Add text, highlights, shapes</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">↶↷</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Undo/Redo</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Full history tracking</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Zoom & Navigate</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">50%-300% zoom, thumbnails</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💾</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Professional Output</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Real PDF modification</div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-slate-800 py-6">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>© {new Date().getFullYear()} OmniToolset. All rights reserved.</div>
            <div className="flex gap-4">
              <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Home</Link>
              <Link href="/categories" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Categories</Link>
              <Link href="/#tools" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">All Tools</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


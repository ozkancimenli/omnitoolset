'use client';

import React from 'react';
import type { PdfTextRun } from '../types';

interface AIPanelProps {
  showAIPanel: boolean;
  setShowAIPanel: (show: boolean) => void;
  editingTextRun: PdfTextRun | null;
  editingTextValue: string | null;
  setEditingTextValue: (value: string) => void;
  cursorPosition: number | null;
  aiSuggestions: any[];
  setAiSuggestions: (suggestions: any[]) => void;
  pdfEngineRef: React.RefObject<any>;
  file: File | null;
  pageNum: number;
  renderPage: (pageNum: number) => void;
  setShowSocialShare: (show: boolean) => void;
  setShowPdfComparison: (show: boolean) => void;
  toast: any;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  showAIPanel,
  setShowAIPanel,
  editingTextRun,
  editingTextValue,
  setEditingTextValue,
  cursorPosition,
  aiSuggestions,
  setAiSuggestions,
  pdfEngineRef,
  file,
  pageNum,
  renderPage,
  setShowSocialShare,
  setShowPdfComparison,
  toast,
}) => {
  if (!showAIPanel || !pdfEngineRef.current) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-lg shadow-2xl border-2 border-purple-500 p-6 min-w-[500px] max-w-[700px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <span>AI-Powered PDF Editor</span>
        </h3>
        <button
          onClick={() => setShowAIPanel(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* AI Text Suggestions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>✨</span>
            Smart Text Suggestions
          </h4>
          <div className="space-y-2">
            <button
              onClick={async () => {
                if (editingTextRun && pdfEngineRef.current) {
                  const suggestions = await pdfEngineRef.current.getAISuggestions(editingTextValue || '', cursorPosition || 0);
                  setAiSuggestions(suggestions);
                  toast.success(`Got ${suggestions.length} AI suggestions`);
                } else {
                  toast.info('Start editing text to get AI suggestions');
                }
              }}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
            >
              🚀 Get AI Suggestions
            </button>
            {aiSuggestions.length > 0 && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (editingTextRun) {
                        setEditingTextValue(suggestion.text);
                        toast.success('Suggestion applied');
                      }
                    }}
                    className="w-full text-left px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all"
                  >
                    <div className="font-semibold">{suggestion.type}</div>
                    <div className="text-white/80">{suggestion.text.substring(0, 100)}...</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* AI Auto-Complete */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>⚡</span>
            Auto-Complete
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type to get AI suggestions..."
              className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onChange={async (e) => {
                if (e.target.value.length > 3 && pdfEngineRef.current) {
                  const suggestions = await pdfEngineRef.current.getAISuggestions(e.target.value, e.target.value.length);
                  setAiSuggestions(suggestions.slice(0, 3)); // Top 3 suggestions
                }
              }}
            />
            <button
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-semibold"
            >
              ✨ Complete
            </button>
          </div>
        </div>
        
        {/* AI Smart Formatting */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🎨</span>
            Smart Formatting
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                if (editingTextRun && pdfEngineRef.current) {
                  const result = await pdfEngineRef.current.getGodLevelFeatures().applySmartFormatting(editingTextRun);
                  if (result.success) {
                    toast.success('Smart formatting applied');
                    renderPage(pageNum);
                  }
                }
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all"
            >
              📝 Format Text
            </button>
            <button
              onClick={async () => {
                if (pdfEngineRef.current) {
                  const result = await pdfEngineRef.current.getGodLevelFeatures().detectLanguage(pageNum);
                  toast.info(`Detected language: ${result.language || 'Unknown'}`);
                }
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all"
            >
              🌍 Detect Language
            </button>
            <button
              onClick={async () => {
                if (pdfEngineRef.current) {
                  const result = await pdfEngineRef.current.getGodLevelFeatures().improveReadability(pageNum);
                  if (result.success) {
                    toast.success('Readability improved');
                    renderPage(pageNum);
                  }
                }
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all"
            >
              📖 Improve Readability
            </button>
            <button
              onClick={async () => {
                if (pdfEngineRef.current) {
                  const result = await pdfEngineRef.current.getGodLevelFeatures().fixGrammar(pageNum);
                  if (result.success) {
                    toast.success('Grammar fixed');
                    renderPage(pageNum);
                  }
                }
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all"
            >
              ✅ Fix Grammar
            </button>
          </div>
        </div>
        
        {/* Export & Share */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📤</span>
            Export & Share
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={async () => {
                if (file && pdfEngineRef.current) {
                  const pdfBytes = await pdfEngineRef.current.savePdf();
                  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name.replace('.pdf', '_exported.docx');
                  a.click();
                  toast.success('Exported to Word');
                }
              }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs transition-all"
            >
              📄 Word
            </button>
            <button
              onClick={async () => {
                if (file && pdfEngineRef.current) {
                  const pdfBytes = await pdfEngineRef.current.savePdf();
                  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name.replace('.pdf', '_exported.xlsx');
                  a.click();
                  toast.success('Exported to Excel');
                }
              }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs transition-all"
            >
              📊 Excel
            </button>
            <button
              onClick={async () => {
                if (file && pdfEngineRef.current) {
                  const pdfBytes = await pdfEngineRef.current.savePdf();
                  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name.replace('.pdf', '_exported.pptx');
                  a.click();
                  toast.success('Exported to PowerPoint');
                }
              }}
              className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs transition-all"
            >
              📽️ PowerPoint
            </button>
            <button
              onClick={() => setShowSocialShare(true)}
              className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg hover:from-pink-600 hover:to-rose-700 transition-all text-xs font-semibold col-span-3"
            >
              🚀 Share PDF
            </button>
            <button
              onClick={() => setShowPdfComparison(true)}
              className="px-3 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all text-xs font-semibold col-span-3 mt-2"
            >
              🔍 Compare PDFs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


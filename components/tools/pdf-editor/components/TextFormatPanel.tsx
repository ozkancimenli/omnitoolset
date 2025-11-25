// Text Format Panel Component
'use client';

import React from 'react';
import type { PdfTextRun } from '../types';

interface TextFormat {
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  textShadow?: { offsetX: number; offsetY: number; blur: number; color: string };
  textOutline?: { width: number; color: string };
}

interface TextFormatPanelProps {
  run: PdfTextRun;
  format: TextFormat;
  onFormatChange: (format: TextFormat) => void;
  multiLineEditing: boolean;
  onToggleMultiLine: () => void;
  useRichTextEditor: boolean;
  onToggleRichText: () => void;
  showAISuggestions: boolean;
  onToggleAISuggestions: () => void;
  enableMultiCursor: boolean;
  onToggleMultiCursor: () => void;
  aiSuggestions?: Array<{ text: string; confidence: number; type: string; replacement?: string; explanation?: string }>;
  onApplySuggestion?: (suggestion: any) => void;
  editingTextValue?: string;
  // Advanced features
  textRotation?: number;
  textScaleX?: number;
  textScaleY?: number;
  onRotationChange?: (rotation: number) => void;
  onScaleXChange?: (scaleX: number) => void;
  onScaleYChange?: (scaleY: number) => void;
  onTransformText?: (transform: 'uppercase' | 'lowercase' | 'capitalize') => void;
  textTemplates?: Array<{ id: string; name: string; text: string; format?: any }>;
  onApplyTemplate?: (template: { id: string; name: string; text: string; format?: any }) => void;
  onSaveTemplate?: (name: string) => void;
}

export const TextFormatPanel: React.FC<TextFormatPanelProps> = ({
  run,
  format,
  onFormatChange,
  multiLineEditing,
  onToggleMultiLine,
  useRichTextEditor,
  onToggleRichText,
  showAISuggestions,
  onToggleAISuggestions,
  enableMultiCursor,
  onToggleMultiCursor,
  aiSuggestions = [],
  onApplySuggestion,
  editingTextValue = '',
  textRotation,
  textScaleX,
  textScaleY,
  onRotationChange,
  onScaleXChange,
  onScaleYChange,
  onTransformText,
  textTemplates = [],
  onApplyTemplate,
  onSaveTemplate,
}) => {
  return (
    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-300 dark:border-slate-700 p-3 z-50 min-w-[300px]">
      <div className="space-y-2">
        {/* Basic Formatting */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Font Size:</label>
          <input
            type="number"
            min="8"
            max="72"
            value={format.fontSize || run.fontSize}
            onChange={(e) => onFormatChange({ ...format, fontSize: Number(e.target.value) })}
            className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Font:</label>
          <select
            value={format.fontFamily || run.fontName}
            onChange={(e) => onFormatChange({ ...format, fontFamily: e.target.value })}
            className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Color:</label>
          <input
            type="color"
            value={format.color || run.color || '#000000'}
            onChange={(e) => onFormatChange({ ...format, color: e.target.value })}
            className="w-12 h-8 border border-slate-300 dark:border-slate-600 rounded cursor-pointer"
          />
        </div>
        
        {/* Format Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFormatChange({ ...format, fontWeight: format.fontWeight === 'bold' ? 'normal' : 'bold' })}
            className={`px-3 py-1 rounded text-sm ${format.fontWeight === 'bold' ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => onFormatChange({ ...format, fontStyle: format.fontStyle === 'italic' ? 'normal' : 'italic' })}
            className={`px-3 py-1 rounded text-sm ${format.fontStyle === 'italic' ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => onFormatChange({ ...format, textDecoration: format.textDecoration === 'underline' ? 'none' : 'underline' })}
            className={`px-3 py-1 rounded text-sm ${format.textDecoration === 'underline' ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            onClick={onToggleMultiLine}
            className={`px-3 py-1 rounded text-sm ${multiLineEditing ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Multi-line"
          >
            ⤶
          </button>
          <button
            onClick={onToggleRichText}
            className={`px-3 py-1 rounded text-sm ${useRichTextEditor ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Rich Text Editor (Enhanced)"
          >
            ✨
          </button>
          <button
            onClick={onToggleAISuggestions}
            className={`px-3 py-1 rounded text-sm ${showAISuggestions ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="AI Suggestions"
          >
            🤖
          </button>
          <button
            onClick={onToggleMultiCursor}
            className={`px-3 py-1 rounded text-sm ${enableMultiCursor ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
            title="Multi-Cursor Mode (Alt+Click)"
          >
            👆
          </button>
        </div>
        
        {/* Alignment */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Align:</label>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                onClick={() => onFormatChange({ ...format, textAlign: align })}
                className={`px-3 py-1 rounded text-sm ${format.textAlign === align ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
              >
                {align === 'left' ? '⬅' : align === 'center' ? '⬌' : '➡'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Text Spacing */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
          <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Spacing:</label>
          <div className="flex gap-2 flex-1">
            <div className="flex-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Letter</label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={format.letterSpacing || 0}
                onChange={(e) => onFormatChange({ ...format, letterSpacing: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600 dark:text-gray-400">Line</label>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                value={format.lineHeight || 1.2}
                onChange={(e) => onFormatChange({ ...format, lineHeight: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Text Effects */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-300 dark:border-slate-600">
          <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Effects:</label>
          <div className="flex gap-2 flex-1">
            <button
              onClick={() => {
                const hasShadow = format.textShadow;
                onFormatChange({
                  ...format,
                  textShadow: hasShadow ? undefined : { offsetX: 2, offsetY: 2, blur: 4, color: 'rgba(0,0,0,0.3)' }
                });
              }}
              className={`px-3 py-1 rounded text-sm ${format.textShadow ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              title="Text Shadow"
            >
              🌑 Shadow
            </button>
            <button
              onClick={() => {
                const hasOutline = format.textOutline;
                onFormatChange({
                  ...format,
                  textOutline: hasOutline ? undefined : { width: 1, color: '#000000' }
                });
              }}
              className={`px-3 py-1 rounded text-sm ${format.textOutline ? 'bg-gray-900 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              title="Text Outline"
            >
              ⭕ Outline
            </button>
          </div>
        </div>
        
        {/* Text Transformation */}
        {onTransformText && (
          <div className="space-y-2 pt-2 border-t border-slate-300 dark:border-slate-600">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Transform:</label>
              <div className="flex gap-1 flex-1">
                {(['uppercase', 'lowercase', 'capitalize'] as const).map(transform => (
                  <button
                    key={transform}
                    onClick={() => onTransformText(transform)}
                    className="px-3 py-1 rounded text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 capitalize"
                    title={transform}
                  >
                    {transform === 'uppercase' ? 'ABC' : transform === 'lowercase' ? 'abc' : 'Abc'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Rotation & Scale */}
        {(textRotation !== undefined || textScaleX !== undefined || textScaleY !== undefined) && (
          <div className="space-y-2 pt-2 border-t border-slate-300 dark:border-slate-600">
            {textRotation !== undefined && onRotationChange && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Rotation:</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={textRotation}
                  onChange={(e) => onRotationChange(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 w-12">{textRotation}°</span>
              </div>
            )}
            {(textScaleX !== undefined || textScaleY !== undefined) && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Scale:</label>
                <div className="flex gap-2 flex-1">
                  {textScaleX !== undefined && onScaleXChange && (
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 dark:text-gray-400">X</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={textScaleX}
                        onChange={(e) => onScaleXChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  {textScaleY !== undefined && onScaleYChange && (
                    <div className="flex-1">
                      <label className="text-xs text-gray-600 dark:text-gray-400">Y</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={textScaleY}
                        onChange={(e) => onScaleYChange(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Text Templates */}
        {textTemplates && textTemplates.length > 0 && (
          <div className="pt-2 border-t border-slate-300 dark:border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm text-gray-700 dark:text-gray-300 w-20">Templates:</label>
              <select
                onChange={(e) => {
                  const template = textTemplates.find(t => t.id === e.target.value);
                  if (template && onApplyTemplate) {
                    onApplyTemplate(template);
                  }
                }}
                className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm"
                defaultValue=""
              >
                <option value="">Select template...</option>
                {textTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
              {onSaveTemplate && (
                <button
                  onClick={() => {
                    const name = prompt('Template name:');
                    if (name) {
                      onSaveTemplate(name);
                    }
                  }}
                  className="px-3 py-1 rounded text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  title="Save Current as Template"
                >
                  💾
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* AI Suggestions Panel */}
        {showAISuggestions && aiSuggestions && aiSuggestions.length > 0 && (
          <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
            <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">AI Suggestions:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {aiSuggestions.slice(0, 3).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onApplySuggestion?.(suggestion)}
                  className="w-full text-left px-2 py-1 text-xs bg-white dark:bg-slate-800 rounded hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-700"
                >
                  <div className="font-medium text-purple-900 dark:text-purple-200">
                    {suggestion.type === 'spelling' ? '🔤' : suggestion.type === 'grammar' ? '📝' : '💡'} {suggestion.explanation || suggestion.replacement}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

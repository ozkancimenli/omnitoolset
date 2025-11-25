'use client';

import React, { useRef } from 'react';
import { toast } from '@/components/Toast';
import { RichTextEditor } from '../enhancements/richTextEditor';
import { TextFormatPanel } from './TextFormatPanel';
import type { PdfTextRun } from '../types';

interface PdfTextEditorProps {
  editingTextRun: string | null;
  pdfTextRuns: Record<number, PdfTextRun[]>;
  pageNum: number;
  run: PdfTextRun;
  useRichTextEditor: boolean;
  editingTextValue: string;
  setEditingTextValue: (value: string) => void;
  updatePdfTextInStream: (id: string, text: string, format: any) => Promise<void>;
  setEditingTextRun: (id: string | null) => void;
  setTextEditMode: (mode: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewportRef: React.RefObject<{ width: number; height: number; scale: number } | null>;
  multiLineEditing: boolean;
  textInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  showAISuggestions: boolean;
  aiSuggestions: {
    getSuggestions: (options: any) => void;
    suggestions: any[];
    applySuggestion: (text: string, suggestion: any) => string;
    clearSuggestions: () => void;
  };
  realTimePreview: boolean;
  previewTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  setPdfTextRuns: React.Dispatch<React.SetStateAction<Record<number, PdfTextRun[]>>>;
  renderPage: (pageNum: number, clearCache?: boolean) => void;
  editingTextFormat: any;
  setEditingTextFormat: (format: any) => void;
  setShowTextFormatPanel: (show: boolean) => void;
  showTextFormatPanel: boolean;
  setMultiLineEditing: (enabled: boolean) => void;
  setUseRichTextEditor: (enabled: boolean) => void;
  setShowAISuggestions: (enabled: boolean) => void;
  enableMultiCursor: boolean;
  setEnableMultiCursor: (enabled: boolean) => void;
  multiCursor: {
    clearAll: () => void;
  };
  textRotation: number;
  textScaleX: number;
  textScaleY: number;
  setTextRotation: (rotation: number) => void;
  setTextScaleX: (scaleX: number) => void;
  setTextScaleY: (scaleY: number) => void;
  pdfEngineRef: React.RefObject<any>;
  transformText: (text: string, transform: any) => string;
  textTemplates: any[];
  setTextTemplates: React.Dispatch<React.SetStateAction<any[]>>;
}

export function PdfTextEditor({
  editingTextRun,
  pdfTextRuns,
  pageNum,
  run,
  useRichTextEditor,
  editingTextValue,
  setEditingTextValue,
  updatePdfTextInStream,
  setEditingTextRun,
  setTextEditMode,
  canvasRef,
  viewportRef,
  multiLineEditing,
  textInputRef,
  showAISuggestions,
  aiSuggestions,
  realTimePreview,
  previewTimeoutRef,
  setPdfTextRuns,
  renderPage,
  editingTextFormat,
  setEditingTextFormat,
  setShowTextFormatPanel,
  showTextFormatPanel,
  setMultiLineEditing,
  setUseRichTextEditor,
  setShowAISuggestions,
  enableMultiCursor,
  setEnableMultiCursor,
  multiCursor,
  textRotation,
  textScaleX,
  textScaleY,
  setTextRotation,
  setTextScaleX,
  setTextScaleY,
  pdfEngineRef,
  transformText,
  textTemplates,
  setTextTemplates,
}: PdfTextEditorProps) {
  // Calculate scaleX and scaleY
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const canvas = canvasRef.current;
  const rect = canvas?.getBoundingClientRect();
  const scaleX = canvas && rect ? (canvas.width / devicePixelRatio) / rect.width : 1;
  const scaleY = canvas && rect ? (canvas.height / devicePixelRatio) / rect.height : 1;
  // Use Rich Text Editor if enabled
  if (useRichTextEditor && viewportRef.current) {
    if (!canvas || !rect) return null;
    
    const viewport = viewportRef.current;
    
    // Convert PDF coordinates to canvas coordinates
    const canvasX = (run.x / viewport.width) * rect.width;
    const canvasY = ((viewport.height - run.y) / viewport.height) * rect.height;
    
    const textX = rect.left + canvasX;
    const textY = rect.top + canvasY - run.height * (rect.height / viewport.height);
    
    return (
      <RichTextEditor
        textRun={run}
        initialValue={editingTextValue || run.text}
        onSave={async (text: string, format: any) => {
          if (text && text.trim() && text !== run.text) {
            await updatePdfTextInStream(run.id, text, format);
            toast.success('Text updated with formatting!');
          }
          setEditingTextRun(null);
          setEditingTextValue('');
          setTextEditMode(false);
        }}
        onCancel={() => {
          setEditingTextRun(null);
          setEditingTextValue('');
          setTextEditMode(false);
          toast.info('Editing cancelled');
        }}
        position={{ x: textX, y: textY }}
        viewport={viewport}
      />
    );
  }
  
  if (!canvas || !viewportRef.current || !rect) return null;
  
  const viewport = viewportRef.current;
  
  // Convert PDF coordinates to canvas coordinates
  // PDF: y=0 at bottom, Canvas: y=0 at top
  const canvasX = (run.x / viewport.width) * rect.width;
  const canvasY = ((viewport.height - run.y) / viewport.height) * rect.height; // Invert Y
  
  // Calculate position relative to canvas
  const textX = rect.left + canvasX;
  const textY = rect.top + canvasY - run.height * (rect.height / viewport.height);
  
  // Phase 5: Multi-line editing support
  const InputComponent = multiLineEditing ? 'textarea' : 'input';
  const inputProps: any = {
    ref: textInputRef,
    value: editingTextValue || run.text, // Controlled input - CRITICAL
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      console.log('[TEXT INPUT] onChange triggered:', {
        newValue: newValue.substring(0, 50),
        editingTextRun,
        pageNum
      });
      setEditingTextValue(newValue);
      
      // Enhanced: Get AI suggestions as user types (debounced)
      if (showAISuggestions && newValue.length > 3) {
        setTimeout(() => {
          aiSuggestions.getSuggestions({
            text: newValue,
            context: run.text,
            enableGrammar: true,
            enableSpelling: true,
            enableStyle: false,
            enableCompletion: true,
          });
        }, 500); // Debounce AI calls
      }
      
      // Real-time preview
      if (realTimePreview && editingTextRun) {
        setPdfTextRuns(prev => {
          const pageRuns = prev[pageNum] || [];
          return {
            ...prev,
            [pageNum]: pageRuns.map(r =>
              r.id === editingTextRun ? { ...r, text: newValue } : r
            ),
          };
        });
        
        // Debounced re-render
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current);
        }
        previewTimeoutRef.current = setTimeout(() => {
          console.log('[TEXT INPUT] Re-rendering page for preview');
          renderPage(pageNum, false);
          previewTimeoutRef.current = null;
        }, 300);
      }
    },
    onBlur: async (e: any) => {
      if (editingTextRun) {
        const finalValue = editingTextValue || e.target.value;
        if (finalValue && finalValue.trim() && finalValue !== run.text) {
          console.log('[Edit] Saving text edit:', run.id, 'from', run.text, 'to', finalValue);
          try {
            // Phase 2.5: Update PDF text with formatting
            await updatePdfTextInStream(run.id, finalValue, editingTextFormat);
            console.log('[Edit] Text edit saved successfully');
            toast.success('Text updated successfully!');
          } catch (error) {
            console.error('[Edit] Error saving text edit:', error);
            toast.error('Failed to save text edit. Please try again.');
          }
        } else {
          console.log('[Edit] No changes to save or empty text');
        }
      }
      setEditingTextRun(null);
      setEditingTextValue(''); // Clear editing value
      setTextEditMode(false);
      setShowTextFormatPanel(false);
      setEditingTextFormat({});
    },
    onKeyDown: async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      // Enhanced keyboard shortcuts for text editing
      
      // Save and finish editing: Enter (single line) or Ctrl+Enter (multi-line)
      if (e.key === 'Enter' && (!multiLineEditing || (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        const finalValue = editingTextValue || run.text;
        if (finalValue !== run.text) {
          await updatePdfTextInStream(run.id, finalValue, editingTextFormat);
        }
        (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
        return;
      }
      
      // Cancel editing: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        setEditingTextRun(null);
        setEditingTextValue('');
        setTextEditMode(false);
        setShowTextFormatPanel(false);
        setEditingTextFormat({});
        toast.info('Editing cancelled');
        return;
      }
      
      // Format shortcuts (only when not in multi-line mode or with Ctrl)
      if (!multiLineEditing || (e.ctrlKey || e.metaKey)) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
          e.preventDefault();
          setEditingTextFormat({ ...editingTextFormat, fontWeight: editingTextFormat.fontWeight === 'bold' ? 'normal' : 'bold' });
          toast.info(`Text ${editingTextFormat.fontWeight === 'bold' ? 'unbolded' : 'bolded'}`);
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
          e.preventDefault();
          setEditingTextFormat({ ...editingTextFormat, fontStyle: editingTextFormat.fontStyle === 'italic' ? 'normal' : 'italic' });
          toast.info(`Text ${editingTextFormat.fontStyle === 'italic' ? 'unitalicized' : 'italicized'}`);
          return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
          e.preventDefault();
          setEditingTextFormat({ ...editingTextFormat, textDecoration: editingTextFormat.textDecoration === 'underline' ? 'none' : 'underline' });
          toast.info(`Text ${editingTextFormat.textDecoration === 'underline' ? 'ununderlined' : 'underlined'}`);
          return;
        }
      }
      
      // Paste from clipboard (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        try {
          const clipboardText = await navigator.clipboard.readText();
          const currentValue = editingTextValue || run.text;
          const cursorPos = (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).selectionStart || 0;
          const newValue = currentValue.slice(0, cursorPos) + clipboardText + currentValue.slice(cursorPos);
          setEditingTextValue(newValue);
          // Update cursor position
          setTimeout(() => {
            const input = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
            input.setSelectionRange(cursorPos + clipboardText.length, cursorPos + clipboardText.length);
          }, 0);
        } catch (err) {
          console.error('Failed to paste from clipboard:', err);
          toast.error('Failed to paste from clipboard');
        }
        return;
      }
      
      // Tab: Move to next text run (if available)
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const runs = pdfTextRuns[pageNum] || [];
        const currentIndex = runs.findIndex(r => r.id === run.id);
        if (currentIndex < runs.length - 1) {
          const nextRun = runs[currentIndex + 1];
          setEditingTextRun(nextRun.id);
          setEditingTextValue(nextRun.text);
          toast.info('Moved to next text');
        }
        return;
      }
      
      // Shift+Tab: Move to previous text run
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const runs = pdfTextRuns[pageNum] || [];
        const currentIndex = runs.findIndex(r => r.id === run.id);
        if (currentIndex > 0) {
          const prevRun = runs[currentIndex - 1];
          setEditingTextRun(prevRun.id);
          setEditingTextValue(prevRun.text);
          toast.info('Moved to previous text');
        }
        return;
      }
    },
    style: {
      position: 'fixed', // Use fixed for better positioning
      left: `${textX}px`, // textX already includes rect.left
      top: `${textY}px`, // textY already includes rect.top
      fontSize: `${editingTextFormat.fontSize || run.fontSize}px`,
      fontFamily: editingTextFormat.fontFamily || run.fontName,
      fontWeight: editingTextFormat.fontWeight || run.fontWeight || 'normal',
      fontStyle: editingTextFormat.fontStyle || run.fontStyle || 'normal',
      textDecoration: editingTextFormat.textDecoration || run.textDecoration || 'none',
      color: editingTextFormat.color || run.color || '#000000',
      letterSpacing: editingTextFormat.letterSpacing ? `${editingTextFormat.letterSpacing}px` : 'normal',
      lineHeight: editingTextFormat.lineHeight || 1.2,
      textShadow: editingTextFormat.textShadow 
        ? `${editingTextFormat.textShadow.offsetX}px ${editingTextFormat.textShadow.offsetY}px ${editingTextFormat.textShadow.blur}px ${editingTextFormat.textShadow.color}`
        : 'none',
      WebkitTextStroke: editingTextFormat.textOutline 
        ? `${editingTextFormat.textOutline.width}px ${editingTextFormat.textOutline.color}`
        : 'none',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #3b82f6',
      outline: 'none',
      padding: '2px 4px',
      minWidth: `${run.width / scaleX}px`,
      borderRadius: '4px',
      zIndex: 9999, // Ensure input is on top
      ...(multiLineEditing && {
        minHeight: `${run.height * 2 / scaleY}px`,
        resize: 'both',
      }),
    },
    className: "pdf-text-editor-input",
    autoFocus: true,
  };
  
  return (
    <div style={{ position: 'fixed', left: `${textX}px`, top: `${textY}px`, zIndex: 9999 }}>
      <InputComponent {...inputProps} />
      {/* Phase 5: Text Format Panel - Now using extracted component */}
      {showTextFormatPanel && (
        <TextFormatPanel
          run={run}
          format={editingTextFormat}
          onFormatChange={setEditingTextFormat}
          multiLineEditing={multiLineEditing}
          onToggleMultiLine={() => setMultiLineEditing(!multiLineEditing)}
          useRichTextEditor={useRichTextEditor}
          onToggleRichText={() => {
            setUseRichTextEditor(!useRichTextEditor);
            toast.info(useRichTextEditor ? 'Switched to simple editor' : 'Switched to rich text editor');
          }}
          showAISuggestions={showAISuggestions}
          onToggleAISuggestions={() => {
            setShowAISuggestions(!showAISuggestions);
            if (!showAISuggestions && editingTextValue) {
              aiSuggestions.getSuggestions({
                text: editingTextValue,
                context: run.text,
                enableGrammar: true,
                enableSpelling: true,
              });
            }
          }}
          enableMultiCursor={enableMultiCursor}
          onToggleMultiCursor={() => {
            setEnableMultiCursor(!enableMultiCursor);
            if (!enableMultiCursor) {
              multiCursor.clearAll();
            }
          }}
          aiSuggestions={aiSuggestions.suggestions}
          onApplySuggestion={(suggestion) => {
            const newText = aiSuggestions.applySuggestion(editingTextValue || run.text, suggestion);
            setEditingTextValue(newText);
            aiSuggestions.clearSuggestions();
          }}
          editingTextValue={editingTextValue}
          textRotation={textRotation}
          textScaleX={textScaleX}
          textScaleY={textScaleY}
          onRotationChange={(rotation) => {
            setTextRotation(rotation);
            if (editingTextRun && pdfEngineRef.current) {
              pdfEngineRef.current.transformText(pageNum, editingTextRun, { rotation });
              renderPage(pageNum);
            }
          }}
          onScaleXChange={(scaleX) => {
            setTextScaleX(scaleX);
            if (editingTextRun && pdfEngineRef.current) {
              pdfEngineRef.current.transformText(pageNum, editingTextRun, { scaleX });
              renderPage(pageNum);
            }
          }}
          onScaleYChange={(scaleY) => {
            setTextScaleY(scaleY);
            if (editingTextRun && pdfEngineRef.current) {
              pdfEngineRef.current.transformText(pageNum, editingTextRun, { scaleY });
              renderPage(pageNum);
            }
          }}
          onTransformText={(transform) => {
            if (editingTextRun && run) {
              const transformed = transformText(run.text, transform);
              updatePdfTextInStream(run.id, transformed, editingTextFormat);
            }
          }}
          textTemplates={textTemplates}
          onApplyTemplate={(template) => {
            if (editingTextRun) {
              setEditingTextValue(template.text);
              if (template.format) {
                setEditingTextFormat(template.format);
              }
            }
          }}
          onSaveTemplate={(name) => {
            if (editingTextRun && run) {
              const newTemplate = {
                id: `template-${Date.now()}`,
                name,
                text: editingTextValue || run.text,
                format: editingTextFormat,
              };
              setTextTemplates(prev => [...prev, newTemplate]);
              toast.success('Template saved');
            }
          }}
        />
      )}
    </div>
  );
}

'use client';

import React from 'react';
import type { ToolType } from '../types';

interface ToolbarProps {
  tool: ToolType | null;
  setTool: (tool: ToolType | null) => void;
  isEditable: boolean;
  showPageManager: boolean;
  setShowPageManager: (show: boolean) => void;
  showTemplatesPanel: boolean;
  setShowTemplatesPanel: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showPageFeatures: boolean;
  setShowPageFeatures: (show: boolean) => void;
  showAIPanel: boolean;
  setShowAIPanel: (show: boolean) => void;
  showPerformancePanel: boolean;
  setShowPerformancePanel: (show: boolean) => void;
  textEditMode: boolean;
  setTextEditMode: (mode: boolean) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
  // Tool options
  currentText: string;
  setCurrentText: (text: string) => void;
  fontFamily: string;
  setFontFamily: (family: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  textAlign: 'left' | 'center' | 'right';
  setTextAlign: (align: 'left' | 'center' | 'right') => void;
  textColor: string;
  setTextColor: (color: string) => void;
  fontWeight: 'normal' | 'bold';
  setFontWeight: (weight: 'normal' | 'bold') => void;
  fontStyle: 'normal' | 'italic';
  setFontStyle: (style: 'normal' | 'italic') => void;
  textDecoration: 'none' | 'underline';
  setTextDecoration: (decoration: 'none' | 'underline') => void;
  // Other tool options
  highlightColor: string;
  setHighlightColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (opacity: number) => void;
  selectedStamp: string;
  setSelectedStamp: (stamp: string) => void;
  stampSize: number;
  setStampSize: (size: number) => void;
  measurementUnit: 'px' | 'mm' | 'cm' | 'in';
  setMeasurementUnit: (unit: 'px' | 'mm' | 'cm' | 'in') => void;
  formFieldType: string;
  setFormFieldType: (type: string) => void;
  formFieldName: string;
  setFormFieldName: (name: string) => void;
  formFieldRequired: boolean;
  setFormFieldRequired: (required: boolean) => void;
  formFieldOptions: string[];
  setFormFieldOptions: (options: string[]) => void;
  polygonPoints: any[];
  setPolygonPoints: (points: any[]) => void;
  setIsDrawingPolygon: (drawing: boolean) => void;
  textTemplates: any[];
  applyTextTemplate: (template: any) => void;
  handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  renderPage: (pageNum: number) => void;
  pageNum: number;
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomMode: 'custom' | 'fit-width' | 'fit-page' | 'fit-height';
  setZoomMode: (mode: 'custom' | 'fit-width' | 'fit-page' | 'fit-height') => void;
  toast: any;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setTool,
  isEditable,
  showPageManager,
  setShowPageManager,
  showTemplatesPanel,
  setShowTemplatesPanel,
  showSettings,
  setShowSettings,
  showHelp,
  setShowHelp,
  showGrid,
  setShowGrid,
  showPageFeatures,
  setShowPageFeatures,
  showAIPanel,
  setShowAIPanel,
  showPerformancePanel,
  setShowPerformancePanel,
  textEditMode,
  setTextEditMode,
  imageInputRef,
  currentText,
  setCurrentText,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  textColor,
  setTextColor,
  fontWeight,
  setFontWeight,
  fontStyle,
  setFontStyle,
  textDecoration,
  setTextDecoration,
  highlightColor,
  setHighlightColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  watermarkText,
  setWatermarkText,
  watermarkOpacity,
  setWatermarkOpacity,
  selectedStamp,
  setSelectedStamp,
  stampSize,
  setStampSize,
  measurementUnit,
  setMeasurementUnit,
  formFieldType,
  setFormFieldType,
  formFieldName,
  setFormFieldName,
  formFieldRequired,
  setFormFieldRequired,
  formFieldOptions,
  setFormFieldOptions,
  polygonPoints,
  setPolygonPoints,
  setIsDrawingPolygon,
  textTemplates,
  applyTextTemplate,
  handleImageSelect,
  renderPage,
  pageNum,
  zoom,
  setZoom,
  zoomMode,
  setZoomMode,
  toast,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left: Tools */}
        <div className="flex items-center gap-2">
          {/* Basic Tools */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setTool(tool === 'text' ? null : 'text')}
              disabled={!isEditable}
              className={`p-2.5 rounded-md transition-all ${
                tool === 'text'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
              title="Add Text (T)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            {/* Add more basic tools here - keeping it minimal for now */}
          </div>

          {/* Professional Tools */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => {
                setTool(tool === 'edit-text' ? null : 'edit-text');
                setTextEditMode(tool !== 'edit-text');
                if (tool !== 'edit-text') {
                  toast.info('Edit mode: Click on PDF text to edit');
                }
              }}
              disabled={!isEditable}
              className={`p-2.5 rounded-md transition-all ${
                tool === 'edit-text'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              } ${!isEditable ? 'opacity-40 cursor-not-allowed' : ''}`}
              title="Edit PDF Text (E)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowPageManager(!showPageManager)}
              className={`p-2.5 rounded-md transition-all ${
                showPageManager
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Page Manager (P)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setShowTemplatesPanel(!showTemplatesPanel)}
              className={`p-2.5 rounded-md transition-all ${
                showTemplatesPanel
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Templates"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-md transition-all ${
                showSettings
                  ? 'bg-slate-700 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Settings (Ctrl+,)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-2.5 rounded-md transition-all ${
                showHelp
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Help (H)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2.5 rounded-md transition-all ${
                showGrid
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Toggle Grid (G)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setShowPageFeatures(!showPageFeatures)}
              className={`p-2.5 rounded-md transition-all ${
                showPageFeatures
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Page Features"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            {/* AI Features Button - TRAFFIC MAGNET */}
            <button
              onClick={() => {
                setShowAIPanel(!showAIPanel);
                if (typeof window !== 'undefined' && (window as any).trackFeature) {
                  (window as any).trackFeature('ai_panel');
                }
              }}
              className={`p-2.5 rounded-md transition-all relative ${
                showAIPanel
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg animate-pulse'
                  : 'hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-900 dark:hover:to-blue-900 text-slate-700 dark:text-slate-300'
              }`}
              title="🤖 AI-Powered Features"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              {!showAIPanel && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">
                  NEW
                </span>
              )}
            </button>
            {/* Performance Panel Button */}
            <button
              onClick={() => {
                setShowPerformancePanel(!showPerformancePanel);
                if (typeof window !== 'undefined' && (window as any).trackFeature) {
                  (window as any).trackFeature('performance_panel');
                }
              }}
              className={`p-2.5 rounded-md transition-all ${
                showPerformancePanel
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900 dark:hover:to-purple-900 text-slate-700 dark:text-slate-300'
              }`}
              title="⚡ Performance Boost"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right: View Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => {
                setZoomMode('fit-page');
                setZoom(1);
                renderPage(pageNum);
              }}
              className={`p-2 rounded-md transition-all ${
                zoomMode === 'fit-page'
                  ? 'bg-gray-900 text-white'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Fit to Page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setZoomMode('fit-width');
                setZoom(1);
                renderPage(pageNum);
              }}
              className={`p-2 rounded-md transition-all ${
                zoomMode === 'fit-width'
                  ? 'bg-gray-900 text-white'
                  : 'hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
              }`}
              title="Fit to Width"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
            <button
              onClick={() => {
                setZoomMode('custom');
                const newZoom = Math.max(0.5, zoom - 0.25);
                setZoom(newZoom);
                setTimeout(() => renderPage(pageNum), 0);
              }}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="px-2 text-xs text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => {
                setZoomMode('custom');
                const newZoom = Math.min(5, zoom + 0.25);
                setZoom(newZoom);
                setTimeout(() => renderPage(pageNum), 0);
              }}
              className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-all"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


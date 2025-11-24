// UI State Management Hook
'use client';

import { useState } from 'react';

export const useUIState = () => {
  // Panel visibility states
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showToolPanel, setShowToolPanel] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showPageFeatures, setShowPageFeatures] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showTextTemplates, setShowTextTemplates] = useState(false);
  const [showTextFormatPanel, setShowTextFormatPanel] = useState(false);
  const [showBatchOperations, setShowBatchOperations] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showPageJump, setShowPageJump] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showTextStats, setShowTextStats] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [showPdfComparison, setShowPdfComparison] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [showBinaryAnalysis, setShowBinaryAnalysis] = useState(false);
  const [showHistoryBranches, setShowHistoryBranches] = useState(false);
  const [showStreamProcessing, setShowStreamProcessing] = useState(false);
  const [showRepairPanel, setShowRepairPanel] = useState(false);
  const [showCompressionPanel, setShowCompressionPanel] = useState(false);
  const [showPdfACompliance, setShowPdfACompliance] = useState(false);
  const [showOcrPanel, setShowOcrPanel] = useState(false);
  const [showWasmPanel, setShowWasmPanel] = useState(false);
  const [showWorkerPanel, setShowWorkerPanel] = useState(false);
  const [showEncryptionPanel, setShowEncryptionPanel] = useState(false);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showSignaturePanel, setShowSignaturePanel] = useState(false);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState(false);
  const [showCachePanel, setShowCachePanel] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [show3DPanel, setShow3DPanel] = useState(false);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [showVersionControl, setShowVersionControl] = useState(false);
  const [showOCRPanel, setShowOCRPanel] = useState(false);

  // Floating toolbar state
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedTextForFormatting, setSelectedTextForFormatting] = useState<string | null>(null);

  return {
    // Panel visibility
    showThumbnails,
    setShowThumbnails,
    showToolPanel,
    setShowToolPanel,
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
    showLayerPanel,
    setShowLayerPanel,
    showTextTemplates,
    setShowTextTemplates,
    showTextFormatPanel,
    setShowTextFormatPanel,
    showBatchOperations,
    setShowBatchOperations,
    showExportOptions,
    setShowExportOptions,
    showPageJump,
    setShowPageJump,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts,
    showFindReplace,
    setShowFindReplace,
    showTextStats,
    setShowTextStats,
    showCollaborationPanel,
    setShowCollaborationPanel,
    showPdfComparison,
    setShowPdfComparison,
    showSocialShare,
    setShowSocialShare,
    showPerformanceDashboard,
    setShowPerformanceDashboard,
    showBinaryAnalysis,
    setShowBinaryAnalysis,
    showHistoryBranches,
    setShowHistoryBranches,
    showStreamProcessing,
    setShowStreamProcessing,
    showRepairPanel,
    setShowRepairPanel,
    showCompressionPanel,
    setShowCompressionPanel,
    showPdfACompliance,
    setShowPdfACompliance,
    showOcrPanel,
    setShowOcrPanel,
    showWasmPanel,
    setShowWasmPanel,
    showWorkerPanel,
    setShowWorkerPanel,
    showEncryptionPanel,
    setShowEncryptionPanel,
    showFontPanel,
    setShowFontPanel,
    showSignaturePanel,
    setShowSignaturePanel,
    showOptimizationPanel,
    setShowOptimizationPanel,
    showCachePanel,
    setShowCachePanel,
    showCloudSync,
    setShowCloudSync,
    show3DPanel,
    setShow3DPanel,
    showMediaPanel,
    setShowMediaPanel,
    showVersionControl,
    setShowVersionControl,
    showOCRPanel,
    setShowOCRPanel,
    // Floating toolbar
    showFloatingToolbar,
    setShowFloatingToolbar,
    floatingToolbarPosition,
    setFloatingToolbarPosition,
    selectedTextForFormatting,
    setSelectedTextForFormatting,
  };
};



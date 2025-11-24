// Loading Overlay Component
'use client';

import React, { memo } from 'react';

interface LoadingOverlayProps {
  isProcessing: boolean;
  processingMessage: string;
  processingProgress: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = memo(({
  isProcessing,
  processingMessage,
  processingProgress,
}) => {
  if (!isProcessing) return null;

  return (
    <div className="flex-1 flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading PDF">
      <div className="text-center max-w-md px-4">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-zinc-200/50 dark:border-zinc-800/50 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400 mb-2">{processingMessage || 'Loading PDF...'}</h3>
        {processingProgress > 0 && (
          <div className="w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full h-2.5 mb-2">
            <div 
              className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-violet-500/50" 
              style={{ width: `${processingProgress}%` }}
              role="progressbar"
              aria-valuenow={processingProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        )}
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          {processingProgress > 0 ? `${Math.round(processingProgress)}%` : 'Please wait while we process your document'}
        </p>
      </div>
    </div>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export const LoadingOverlay = memo(LoadingOverlayComponent);
LoadingOverlay.displayName = 'LoadingOverlay';


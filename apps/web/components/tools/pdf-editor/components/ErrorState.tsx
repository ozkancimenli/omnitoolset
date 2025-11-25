// Error State Component
'use client';

import React from 'react';

interface ErrorState {
  message: string;
  code?: string;
  retry?: () => void;
}

interface ErrorStateProps {
  errorState: ErrorState | null;
  isRetrying: boolean;
  setIsRetrying: (value: boolean) => void;
  onDismiss: () => void;
}

export const ErrorStateComponent: React.FC<ErrorStateProps> = ({
  errorState,
  isRetrying,
  setIsRetrying,
  onDismiss,
}) => {
  if (!errorState) return null;

  return (
    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-l-4 border-red-500 rounded-r-xl p-4 shadow-lg max-w-2xl">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-red-900 dark:text-red-200 text-sm font-semibold mb-1">
            {errorState.message}
          </p>
          {errorState.code && (
            <p className="text-red-700 dark:text-red-300 text-xs mb-2">
              Error Code: {errorState.code}
            </p>
          )}
          {errorState.retry && (
            <button
              onClick={() => {
                setIsRetrying(true);
                errorState.retry?.();
                setTimeout(() => setIsRetrying(false), 1000);
              }}
              disabled={isRetrying}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs disabled:opacity-50"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="ml-2 px-3 py-1.5 bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-300/80 dark:hover:bg-zinc-700/80 transition-all duration-200 text-xs border border-zinc-300/50 dark:border-zinc-700/50"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};


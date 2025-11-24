// Status Notification Component (Operation Status & View-Only Warning)
'use client';

import React from 'react';

interface OperationStatus {
  message: string;
  progress?: number;
}

interface StatusNotificationProps {
  operationStatus?: OperationStatus | null;
  isEditable: boolean;
}

export const StatusNotification: React.FC<StatusNotificationProps> = ({
  operationStatus,
  isEditable,
}) => {
  return (
    <>
      {/* Operation Status */}
      {operationStatus && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-700/60 rounded-xl p-4 shadow-2xl shadow-zinc-500/20 dark:shadow-zinc-900/50 max-w-md">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600 dark:border-violet-400"></div>
            <div className="flex-1">
              <p className="text-zinc-900 dark:text-white text-sm font-medium">
                {operationStatus.message}
              </p>
              {operationStatus.progress !== undefined && (
                <div className="mt-2 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 h-2 rounded-full transition-all duration-300 shadow-lg shadow-violet-500/50"
                    style={{ width: `${operationStatus.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View-Only Mode Warning */}
      {!isEditable && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-l-4 border-yellow-500 rounded-r-xl p-3 shadow-lg max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-yellow-900 dark:text-yellow-200 text-xs font-semibold">
                View-Only Mode - This PDF cannot be edited
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


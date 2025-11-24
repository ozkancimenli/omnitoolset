'use client';

import React, { useState } from 'react';

interface PageJumpModalProps {
  show: boolean;
  onClose: () => void;
  numPages: number;
  onJump: (page: number) => void;
}

export const PageJumpModal: React.FC<PageJumpModalProps> = ({
  show,
  onClose,
  numPages,
  onJump,
}) => {
  const [pageInput, setPageInput] = useState('');

  if (!show) return null;

  const handleJump = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      onJump(page);
      setPageInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Jump to Page</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={numPages}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleJump();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder={`Enter page (1-${numPages})`}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            autoFocus
          />
          <button
            onClick={handleJump}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-all"
          >
            Go
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-md transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};





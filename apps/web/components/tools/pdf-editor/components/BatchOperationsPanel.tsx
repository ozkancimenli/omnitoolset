'use client';

import React from 'react';

interface BatchOperationsPanelProps {
  show: boolean;
  onClose: () => void;
  selectedCount: number;
  onApplyFormat: (format: any) => void;
  onCopy: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
}

export const BatchOperationsPanel: React.FC<BatchOperationsPanelProps> = ({
  show,
  onClose,
  selectedCount,
  onApplyFormat,
  onCopy,
  onDelete,
  onClearSelection,
}) => {
  if (!show || selectedCount === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 p-4 min-w-[320px] max-w-[400px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📝</span>
          Batch Operations ({selectedCount} selected)
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Format Section */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Format</h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onApplyFormat({ fontWeight: 'bold' })}
              className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-bold"
            >
              Bold
            </button>
            <button
              onClick={() => onApplyFormat({ fontStyle: 'italic' })}
              className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm italic"
            >
              Italic
            </button>
            <button
              onClick={() => onApplyFormat({ textDecoration: 'underline' })}
              className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm underline"
            >
              Underline
            </button>
          </div>
        </div>
        
        {/* Font Size */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Font Size</label>
          <input
            type="number"
            min="8"
            max="72"
            defaultValue="12"
            onChange={(e) => {
              const size = Number(e.target.value);
                  if (size >= 8 && size <= 72) {
                    onApplyFormat({ fontSize: size });
                  }
            }}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          />
        </div>
        
        {/* Font Family */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Font Family</label>
          <select
            onChange={(e) => onApplyFormat({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm"
          >
            <option value="">Select font...</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
        
        {/* Color */}
        <div>
          <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Color</label>
          <input
            type="color"
            onChange={(e) => onApplyFormat({ color: e.target.value })}
            className="w-full h-10 rounded-md cursor-pointer border border-slate-300 dark:border-slate-600"
          />
        </div>
        
        {/* Actions */}
        <div className="pt-2 border-t border-slate-300 dark:border-slate-600">
          <div className="flex gap-2">
            <button
              onClick={onCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              📋 Copy
            </button>
            <button
              onClick={onDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              🗑️ Delete
            </button>
          </div>
          <button
            onClick={onClearSelection}
            className="w-full mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};


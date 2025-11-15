'use client';

/**
 * Toolbar Component
 * 
 * Clean toolbar with file info, page count, and actions.
 * Minimal design that doesn't distract from the editor.
 */
interface ToolbarProps {
  fileName?: string;
  pageCount: number;
  onReset: () => void;
  onDownload: () => void;
  isProcessing?: boolean;
  hasChanges?: boolean;
}

export default function Toolbar({
  fileName,
  pageCount,
  onReset,
  onDownload,
  isProcessing = false,
  hasChanges = false,
}: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: File Info */}
        <div className="flex items-center gap-4">
          {fileName && (
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                {fileName}
              </p>
            </div>
          )}
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{pageCount}</span> page{pageCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            disabled={!hasChanges}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Changes
          </button>
          <button
            onClick={onDownload}
            disabled={isProcessing || pageCount === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isProcessing ? 'Processing...' : 'Download Edited PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}


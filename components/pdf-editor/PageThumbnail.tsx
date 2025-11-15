'use client';

/**
 * Page Thumbnail Component
 * 
 * Individual page card with rotation, delete, and drag functionality.
 * Clean, minimal design with clear actions.
 */
interface PageThumbnailProps {
  pageNumber: number;
  displayIndex: number;
  rotation: number;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onDelete: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export default function PageThumbnail({
  pageNumber,
  displayIndex,
  rotation,
  onRotateLeft,
  onRotateRight,
  onDelete,
  isDragging = false,
  dragHandleProps,
}: PageThumbnailProps) {
  return (
    <div
      {...dragHandleProps}
      className={`group relative bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-gray-400 transition-all cursor-move ${
        isDragging ? 'opacity-50 scale-95' : ''
      }`}
    >
      {/* Page Number Badge */}
      <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
        {displayIndex + 1}
      </div>

      {/* Page Preview */}
      <div
        className="w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center border border-gray-300"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <span className="text-gray-400 text-xs font-medium">
          Page {pageNumber + 1}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotateLeft();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label={`Rotate page ${displayIndex + 1} left`}
            title="Rotate left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotateRight();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label={`Rotate page ${displayIndex + 1} right`}
            title="Rotate right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" transform="rotate(180 12 12)" />
            </svg>
          </button>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 hover:bg-red-50 rounded-md text-red-600 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Delete page ${displayIndex + 1}`}
          title="Delete page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Drag Hint */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
    </div>
  );
}



// File Upload Area Component
'use client';

import React, { memo } from 'react';

interface FileUploadAreaProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onUploadAreaClick: (e: React.MouseEvent<HTMLDivElement>, handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void) => void;
  onUploadAreaKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = memo(({
  fileInputRef,
  onFileSelect,
  onDrop,
  onDragOver,
  onUploadAreaClick,
  onUploadAreaKeyDown,
}) => {

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        className="w-full max-w-2xl border-2 border-dashed border-zinc-300/60 dark:border-zinc-700/60 rounded-2xl p-16 text-center bg-gradient-to-br from-violet-50/30 via-indigo-50/20 to-violet-50/30 dark:from-violet-950/10 dark:via-indigo-950/10 dark:to-violet-950/10 hover:border-violet-400/80 dark:hover:border-violet-600/60 hover:shadow-2xl hover:shadow-violet-500/30 dark:hover:shadow-violet-900/30 transition-all duration-300 cursor-pointer group backdrop-blur-sm"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onClick={(e) => onUploadAreaClick(e, onFileSelect)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => onUploadAreaKeyDown(e, fileInputRef)}
        aria-label="Upload PDF file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            console.log('[PDF Editor] File input onChange triggered, files:', e.target.files?.length || 0);
            onFileSelect(e);
          }}
          onClick={(e) => {
            console.log('[PDF Editor] File input clicked');
          }}
          onInput={(e) => {
            console.log('[PDF Editor] File input onInput triggered');
          }}
          style={{ display: 'none' }}
          aria-label="PDF file input"
        />
        <div className="text-center">
          <div className="text-7xl mb-6 transform group-hover:scale-110 transition-transform duration-300">📄</div>
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
            Upload Your PDF Document
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-base mb-2">
            Drag and drop your PDF file here, or click to browse
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm">
            Supported: PDF files up to 50MB
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100/80 to-indigo-100/80 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-full text-violet-700 dark:text-violet-300 text-sm font-medium border border-violet-200/50 dark:border-violet-800/50">
            <span>✨</span>
            <span>100% Free • No Registration • Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
});

FileUploadArea.displayName = 'FileUploadArea';

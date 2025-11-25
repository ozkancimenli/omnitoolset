'use client';

import { useRef, useState } from 'react';
import { toast } from '@/components/Toast';
import { validateFile, formatFileSize } from './ToolBase';

export interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  onFileError?: (error: string) => void;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  acceptedExtensions?: string[];
  multiple?: boolean;
  icon?: string;
  text?: string;
  subtext?: string;
  showFileInfo?: boolean;
  className?: string;
}

export default function FileUploadArea({
  onFileSelect,
  onFileError,
  maxFileSize = 50,
  acceptedFileTypes = [],
  acceptedExtensions = [],
  multiple = false,
  icon = '📄',
  text = 'Drag and drop your file here or click to select',
  subtext,
  showFileInfo = true,
  className = '',
}: FileUploadAreaProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (selectedFile: File) => {
    const validation = validateFile(selectedFile, maxFileSize, acceptedFileTypes, acceptedExtensions);
    
    if (!validation.valid) {
      const errorMsg = validation.error || 'Invalid file';
      toast.error(errorMsg);
      if (onFileError) {
        onFileError(errorMsg);
      }
      return false;
    }

    return true;
  };

  const handleFileChange = (selectedFile: File) => {
    if (handleFileValidation(selectedFile)) {
      setFile(selectedFile);
      onFileSelect(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const acceptString = [
    ...acceptedFileTypes,
    ...acceptedExtensions,
  ].join(',');

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50'
          }
          ${className}
        `}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="File upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          aria-label="File input"
        />
        <div className="text-5xl mb-4">{icon}</div>
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{text}</p>
        {subtext && (
          <p className="text-sm text-gray-500 dark:text-gray-500">{subtext}</p>
        )}
        {!subtext && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Max file size: {maxFileSize}MB
            {acceptedFileTypes.length > 0 && ` • ${acceptedFileTypes.join(', ')}`}
          </p>
        )}
      </div>

      {showFileInfo && file && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-200">{file.name}</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
              aria-label="Remove file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


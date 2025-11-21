'use client';

import { ReactNode } from 'react';
import { toast } from '@/components/Toast';

export interface ToolBaseProps {
  title: string;
  description: string;
  icon: string;
  children: ReactNode;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  acceptedExtensions?: string[];
  onFileSelect?: (file: File) => void;
  onFileError?: (error: string) => void;
  showFileInfo?: boolean;
  showProgress?: boolean;
  progress?: number;
  isProcessing?: boolean;
  helpText?: string;
  tips?: string[];
}

export function validateFile(
  file: File,
  maxSize: number = 50,
  acceptedTypes: string[] = [],
  acceptedExtensions: string[] = []
): { valid: boolean; error?: string } {
  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize}MB limit. Your file is ${fileSizeMB.toFixed(2)}MB.`,
    };
  }

  // Check file type
  if (acceptedTypes.length > 0) {
    const isAcceptedType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isAcceptedType) {
      return {
        valid: false,
        error: `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`,
      };
    }
  }

  // Check file extension
  if (acceptedExtensions.length > 0) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `File extension not supported. Accepted: ${acceptedExtensions.join(', ')}`,
      };
    }
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export default function ToolBase({
  title,
  description,
  icon,
  children,
  maxFileSize = 50,
  acceptedFileTypes = [],
  acceptedExtensions = [],
  onFileSelect,
  onFileError,
  showFileInfo = true,
  showProgress = true,
  progress = 0,
  isProcessing = false,
  helpText,
  tips = [],
}: ToolBaseProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Help Text */}
      {helpText && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">{helpText}</p>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">💡 Tips</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* File Limits Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Max file size:</span>
          <span className="font-medium text-gray-900 dark:text-white">{maxFileSize}MB</span>
        </div>
        {acceptedFileTypes.length > 0 && (
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600 dark:text-gray-400">Accepted types:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {acceptedFileTypes.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      {children}

      {/* Progress Bar */}
      {showProgress && isProcessing && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300 flex items-center justify-center"
            style={{ width: `${progress}%` }}
          >
            {progress > 10 && (
              <span className="text-xs font-medium text-white">{Math.round(progress)}%</span>
            )}
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm">Processing...</span>
        </div>
      )}
    </div>
  );
}


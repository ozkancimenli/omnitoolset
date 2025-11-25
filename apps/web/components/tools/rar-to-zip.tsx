'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function RarToZip() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.rar')) {
      toast.error('Please select a RAR file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a RAR file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: RAR to ZIP conversion requires server-side processing
      toast.info('RAR to ZIP conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API
      // RAR is a proprietary format, requires unrar or similar
      // Then recompress as ZIP using JSZip or similar
      toast.warning('Full RAR to ZIP conversion requires backend service with unrar.');
    } catch (error) {
      toast.error('Error converting RAR: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setProgress(0);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="RAR to ZIP Converter"
      description="Convert RAR archive files to ZIP format"
      icon="📦"
      helpText="Convert RAR archive files to ZIP format. Note: RAR to ZIP conversion requires server-side processing as RAR is a proprietary format. For production use, implement a backend service using unrar or similar tools."
      tips={[
        'Upload RAR file',
        'Converts to ZIP',
        'Requires server-side processing',
        'Backend service needed',
        'Preserves file structure'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/x-rar-compressed', 'application/vnd.rar']}
            acceptedExtensions={['.rar']}
            icon="📦"
            text="Drag and drop your RAR file here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Converting...' : 'Convert to ZIP'}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> RAR to ZIP conversion requires server-side processing. For production use, implement a backend service using unrar or similar tools.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


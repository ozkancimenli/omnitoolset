'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function EpubToMobi() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.epub')) {
      toast.error('Please select an EPUB file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select an EPUB file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: EPUB to MOBI conversion requires server-side processing
      toast.info('EPUB to MOBI conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API
      // MOBI is Amazon's proprietary format for Kindle
      // Conversion requires: calibre, kindlegen, or similar tools
      toast.warning('Full EPUB to MOBI conversion requires backend service with calibre or kindlegen.');
    } catch (error) {
      toast.error('Error converting EPUB: ' + (error as Error).message);
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
      title="EPUB to MOBI Converter"
      description="Convert EPUB ebook files to MOBI format for Kindle"
      icon="📖"
      helpText="Convert EPUB ebook files to MOBI format for Kindle devices. Note: EPUB to MOBI conversion requires server-side processing. For production use, implement a backend service using calibre, kindlegen, or similar tools."
      tips={[
        'Upload EPUB file',
        'Converts to MOBI',
        'Requires server-side processing',
        'Backend service needed',
        'Kindle-compatible format'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/epub+zip']}
            acceptedExtensions={['.epub']}
            icon="📖"
            text="Drag and drop your EPUB file here or click to select"
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
          {isProcessing ? 'Converting...' : 'Convert to MOBI'}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> EPUB to MOBI conversion requires server-side processing. For production use, implement a backend service using calibre, kindlegen, or similar tools.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


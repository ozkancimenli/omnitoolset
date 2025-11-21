'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function HeicToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.heic') && !selectedFile.name.toLowerCase().endsWith('.heif')) {
      toast.error('Please select a HEIC/HEIF file');
      return;
    }
    
    setFile(selectedFile);
    toast.info('HEIC conversion requires server-side processing. This tool provides a basic implementation.');
    
    // Note: Browser cannot directly read HEIC files
    // This would require a backend service or WebAssembly library
    setPreview('');
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a HEIC file first');
      return;
    }

    setIsProcessing(true);

    try {
      // Note: HEIC conversion requires server-side processing or WebAssembly
      // Browser cannot directly decode HEIC files
      toast.warning('HEIC to JPG conversion requires server-side processing. Please use a backend service with libheif or similar library.');
      
      // Placeholder: In production, this would call a backend API
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch('/api/convert/heic-to-jpg', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = file.name.replace(/\.(heic|heif)$/i, '.jpg');
      // a.click();
      // URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error('Error converting HEIC: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="HEIC to JPG Converter"
      description="Convert HEIC/HEIF images to JPG format"
      icon="🖼️"
      helpText="Convert HEIC/HEIF images to JPG format. Note: HEIC conversion requires server-side processing as browsers cannot directly decode HEIC files. For production use, implement a backend service using libheif or similar library."
      tips={[
        'Upload HEIC/HEIF file',
        'Requires server-side processing',
        'Browser limitation applies',
        'Backend service needed',
        'Supports HEIC and HEIF formats'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={[]}
            acceptedExtensions={['.heic', '.heif']}
            icon="🖼️"
            text="Drag and drop your HEIC/HEIF file here or click to select"
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
          {isProcessing ? 'Converting...' : 'Convert to JPG'}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> HEIC to JPG conversion requires server-side processing as browsers cannot directly decode HEIC files. For production use, implement a backend service using libheif, heif-js, or similar library.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


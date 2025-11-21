'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function MovToMp4() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.mov') && !selectedFile.type.includes('quicktime')) {
      toast.error('Please select a MOV file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a MOV file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: MOV to MP4 conversion requires server-side processing
      toast.info('MOV to MP4 conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API with FFmpeg
      toast.warning('Full MOV to MP4 conversion requires backend service with FFmpeg.');
    } catch (error) {
      toast.error('Error converting MOV: ' + (error as Error).message);
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
      title="MOV to MP4 Converter"
      description="Convert MOV video files to MP4 format"
      icon="🎬"
      helpText="Convert MOV video files to MP4 format. Note: MOV to MP4 conversion requires server-side processing with FFmpeg. For production use, implement a backend service."
      tips={[
        'Upload MOV file',
        'Converts to MP4',
        'Requires server-side processing',
        'Backend service needed',
        'Preserves video quality'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['video/quicktime']}
            acceptedExtensions={['.mov']}
            icon="🎬"
            text="Drag and drop your MOV file here or click to select"
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
          {isProcessing ? 'Converting...' : 'Convert to MP4'}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> MOV to MP4 conversion requires server-side processing with FFmpeg. For production use, implement a backend service.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function VideoConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select a video file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Browser-based video conversion is limited
      // For production, you'd need a backend service or WebAssembly solution
      toast.info('Video conversion requires server-side processing. This is a client-side demo.');
      
      // Simulate conversion progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }

      toast.success('Video conversion would be processed on the server. Please use a backend service for production.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred during conversion');
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
      title="Video Converter"
      description="Convert videos between different formats"
      icon="🎬"
      helpText="Convert videos between different formats (MP4, AVI, MOV, MKV, WebM, etc.). Note: Full video conversion requires server-side processing. For production use, implement a backend service using FFmpeg or similar tools."
      tips={[
        'Upload video file',
        'Select output format',
        'Full conversion requires backend',
        'Supports multiple formats',
        'Server-side processing needed'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['video/*']}
            icon="🎬"
            text={file ? file.name : 'Drop video file here or click to browse'}
            subtext="Supported: MP4, AVI, MOV, MKV, WebM, and more"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mp4">MP4</option>
                <option value="avi">AVI</option>
                <option value="mov">MOV</option>
                <option value="mkv">MKV</option>
                <option value="webm">WebM</option>
                <option value="flv">FLV</option>
                <option value="wmv">WMV</option>
              </select>
            </div>

            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {isProcessing ? `Converting... ${progress}%` : 'Convert Video'}
            </button>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠ <strong>Note:</strong> Full video conversion requires server-side processing. 
                For production use, implement a backend service using FFmpeg or similar tools.
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


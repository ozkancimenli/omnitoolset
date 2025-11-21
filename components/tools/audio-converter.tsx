'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function AudioConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav' | 'aac' | 'ogg' | 'flac'>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select an audio file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Audio conversion requires server-side processing
      // Browser can only extract audio from video, not convert formats
      toast.info('Audio format conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API with FFmpeg
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('outputFormat', outputFormat);
      // const response = await fetch('/api/convert/audio', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = file.name.replace(/\.[^/.]+$/, `.${outputFormat}`);
      // a.click();
      // URL.revokeObjectURL(url);
      
      toast.warning('Full audio conversion requires backend service with FFmpeg.');
    } catch (error) {
      toast.error('Error converting audio: ' + (error as Error).message);
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
      title="Audio Converter"
      description="Convert audio files between different formats"
      icon="🎵"
      helpText="Convert audio files between different formats (MP3, WAV, AAC, OGG, FLAC). Note: Audio format conversion requires server-side processing with FFmpeg. For production use, implement a backend service."
      tips={[
        'Upload audio file',
        'Select output format',
        'Requires server-side processing',
        'Backend service needed',
        'Supports multiple formats'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['audio/*']}
            icon="🎵"
            text="Drag and drop your audio file here or click to select"
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
                Output Format:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'mp3' | 'wav' | 'aac' | 'ogg' | 'flac')}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mp3">MP3</option>
                <option value="wav">WAV</option>
                <option value="aac">AAC</option>
                <option value="ogg">OGG</option>
                <option value="flac">FLAC</option>
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> Audio format conversion requires server-side processing with FFmpeg. For production use, implement a backend service.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


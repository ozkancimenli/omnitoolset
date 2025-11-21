'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function VideoToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(640);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a video file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Full GIF conversion requires server-side processing or WebAssembly
      // This is a client-side demo using canvas
      toast.info('GIF conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API with FFmpeg
      // const formData = new FormData();
      // formData.append('file', file);
      // formData.append('startTime', startTime.toString());
      // formData.append('endTime', endTime.toString());
      // formData.append('fps', fps.toString());
      // formData.append('width', width.toString());
      // const response = await fetch('/api/convert/video-to-gif', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const blob = await response.blob();
      // const url = URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = file.name.replace(/\.[^/.]+$/, '.gif');
      // a.click();
      // URL.revokeObjectURL(url);
      
      toast.warning('Full GIF conversion requires backend service with FFmpeg.');
    } catch (error) {
      toast.error('Error converting video: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setProgress(0);
    setStartTime(0);
    setEndTime(0);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Video to GIF Converter"
      description="Convert video files to animated GIF"
      icon="🎞️"
      helpText="Convert video files to animated GIF format. Note: Full GIF conversion requires server-side processing with FFmpeg. For production use, implement a backend service."
      tips={[
        'Upload video file',
        'Set start and end time',
        'Adjust FPS and width',
        'Requires server-side processing',
        'Backend service needed'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['video/*']}
            icon="🎞️"
            text="Drag and drop your video file here or click to select"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time (seconds):
                </label>
                <input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                           text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time (seconds):
                </label>
                <input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(Math.max(startTime, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                           text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={startTime}
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  FPS: {fps}
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Width: {width}px
                </label>
                <input
                  type="range"
                  min="320"
                  max="1920"
                  step="160"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Converting...' : 'Convert to GIF'}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> Full GIF conversion requires server-side processing with FFmpeg. For production use, implement a backend service.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


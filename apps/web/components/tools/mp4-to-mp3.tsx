'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function Mp4ToMp3() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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
      // Note: Browser doesn't support direct MP3 encoding
      // This creates a WebM audio file as a workaround
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.currentTime = 0;
          resolve(null);
        };
        video.onerror = reject;
      });

      setProgress(30);

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(video);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      setProgress(60);

      const mediaRecorder = new MediaRecorder(destination.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.[^/.]+$/, '') + '.webm';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Audio extracted! (Saved as WebM due to browser limitations)');
        setIsProcessing(false);
        setProgress(100);
      };

      mediaRecorder.onerror = () => {
        toast.error('Error during recording');
        setIsProcessing(false);
      };

      video.play();
      mediaRecorder.start();
      
      video.onended = () => {
        mediaRecorder.stop();
        source.disconnect();
        setProgress(100);
      };

      setProgress(80);

    } catch (error) {
      toast.error('Error converting video: ' + (error as Error).message);
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
      title="MP4 to MP3 Converter"
      description="Extract audio from video files"
      icon="🎬"
      helpText="Extract audio from MP4 and other video files. Note: Due to browser limitations, output is saved as WebM format. Full MP3 conversion requires a backend service."
      tips={[
        'Upload video file (MP4, etc.)',
        'Extracts audio track',
        'Saves as WebM format',
        'Browser limitations apply',
        'Full MP3 requires backend'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['video/mp4', 'video/*']}
            icon="🎬"
            text="Drag and drop your MP4 video file here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
            <video src={URL.createObjectURL(file)} controls className="w-full mt-4 rounded-lg" />
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Converting...' : 'Extract Audio'}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠ Note: Due to browser limitations, audio is saved as WebM format. Full MP3 conversion requires a backend service.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}

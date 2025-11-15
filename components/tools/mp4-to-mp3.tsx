'use client';

import { useState, useRef } from 'react';

export default function Mp4ToMp3() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setFile(file);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Browser doesn't support direct MP3 encoding
      // This creates a WebM audio file as a workaround
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.crossOrigin = 'anonymous';
      
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          video.currentTime = 0;
          resolve(null);
        };
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
      console.error('Error:', error);
      alert('An error occurred during conversion. Browser support may be limited.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-4">🎬</div>
        <p className="text-slate-300">Drag and drop your MP4 video file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-300">Selected: {file.name}</p>
          <video src={URL.createObjectURL(file)} controls className="w-full mt-4 rounded-lg" />
        </div>
      )}

      {isProcessing && (
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Converting...' : 'Convert to MP3'}
      </button>

      <p className="text-sm text-slate-400 text-center">
        Note: Due to browser limitations, saved as WebM format. Full MP3 conversion requires a backend service.
      </p>
    </div>
  );
}

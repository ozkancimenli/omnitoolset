'use client';

import { useState, useRef } from 'react';

export default function ImageInvert() {
  const [file, setFile] = useState<File | null>(null);
  const [processedUrl, setProcessedUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]?.type.startsWith('image/')) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  const processImage = (selectedFile: File) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }

          ctx.putImageData(imageData, 0, 0);
          setProcessedUrl(canvas.toDataURL());
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = file?.name.replace(/\.[^/.]+$/, '') + '_inverted.png';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-4">🖼️</div>
        <p className="text-slate-300">Drag and drop your image here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {processedUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Inverted Image:</h3>
            <button onClick={download} className="btn">
              Download
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center">
            <img
              src={processedUrl}
              alt="Inverted"
              className="max-w-full h-auto mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}


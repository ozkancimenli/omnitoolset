'use client';

import { useState, useRef } from 'react';

export default function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompress = () => {
    if (!preview) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      let mimeType = 'image/jpeg';
      if (outputFormat === 'png') mimeType = 'image/png';
      if (outputFormat === 'webp') mimeType = 'image/webp';

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
        a.download = file?.name.replace(/\.[^/.]+$/, '') + '_compressed.' + extension;
        a.click();
        URL.revokeObjectURL(url);
      }, mimeType, quality / 100);
    };
    img.src = preview;
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
        <p className="text-slate-300">Drag and drop your image file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="text-center">
          <img src={preview} alt="Preview" className="max-w-full max-h-96 mx-auto rounded-lg border border-slate-700" />
          {file && (
            <p className="text-sm text-slate-400 mt-2">
              Original Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Quality: {quality}%
        </label>
        <input
          type="range"
          min="10"
          max="100"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full"
        />
        <p className="text-xs text-slate-400 mt-1">Lower value = smaller file but lower quality</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Output Format:</label>
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
        >
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>

      <button
        onClick={handleCompress}
        disabled={!preview}
        className="btn w-full"
      >
        Compress Image
      </button>
    </div>
  );
}

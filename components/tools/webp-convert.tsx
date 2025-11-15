'use client';

import { useState, useRef } from 'react';

export default function WebpConvert() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'webp' | 'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState(90);
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
      
      if (file.type === 'image/webp') {
        setOutputFormat('jpeg');
      } else {
        setOutputFormat('webp');
      }
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
      
      if (file.type === 'image/webp') {
        setOutputFormat('jpeg');
      } else {
        setOutputFormat('webp');
      }
    }
  };

  const handleConvert = () => {
    if (!preview) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      let mimeType = 'image/webp';
      if (outputFormat === 'jpeg') mimeType = 'image/jpeg';
      if (outputFormat === 'png') mimeType = 'image/png';
      
      let qualityValue = (outputFormat === 'webp' || outputFormat === 'jpeg') 
        ? quality / 100 
        : 1.0;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let extension = 'webp';
        if (outputFormat === 'jpeg') extension = 'jpg';
        if (outputFormat === 'png') extension = 'png';
        a.download = file?.name.replace(/\.[^/.]+$/, '') + '.' + extension;
        a.click();
        URL.revokeObjectURL(url);
      }, mimeType, qualityValue);
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
          accept="image/webp,image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {preview && (
        <div className="text-center">
          <img src={preview} alt="Preview" className="max-w-full max-h-96 mx-auto rounded-lg border border-slate-700" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Convert:</label>
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as 'webp' | 'jpeg' | 'png')}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
        >
          <option value="webp">Convert to WEBP</option>
          <option value="jpeg">Convert to JPG</option>
          <option value="png">Convert to PNG</option>
        </select>
      </div>

      {(outputFormat === 'webp' || outputFormat === 'jpeg') && (
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
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!preview}
        className="btn w-full"
      >
        Convert
      </button>
    </div>
  );
}

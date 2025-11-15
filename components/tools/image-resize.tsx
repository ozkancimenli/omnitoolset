'use client';

import { useState, useRef } from 'react';

export default function ImageResize() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [method, setMethod] = useState<'percentage' | 'pixels' | 'preset'>('percentage');
  const [percentage, setPercentage] = useState(100);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [preset, setPreset] = useState('1920x1080');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ width: img.width, height: img.height });
          setWidth(img.width);
          setHeight(img.height);
          setPreview(e.target?.result as string);
        };
        img.src = e.target?.result as string;
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
        const img = new Image();
        img.onload = () => {
          setOriginalSize({ width: img.width, height: img.height });
          setWidth(img.width);
          setHeight(img.height);
          setPreview(e.target?.result as string);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResize = () => {
    if (!preview) return;

    const img = new Image();
    img.onload = () => {
      let newWidth: number, newHeight: number;

      if (method === 'percentage') {
        newWidth = Math.round(originalSize.width * (percentage / 100));
        newHeight = Math.round(originalSize.height * (percentage / 100));
      } else if (method === 'pixels') {
        newWidth = width;
        newHeight = height;
      } else {
        const [w, h] = preset === 'thumbnail' ? [150, 150] : preset.split('x').map(Number);
        newWidth = w;
        newHeight = h;
      }

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resized_image.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
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
          <p className="text-sm text-slate-400 mt-2">
            Original: {originalSize.width} x {originalSize.height} px
          </p>
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Resize Method:</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="percentage"
              checked={method === 'percentage'}
              onChange={(e) => setMethod(e.target.value as 'percentage')}
            />
            <span className="text-slate-300">Percentage (%)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="pixels"
              checked={method === 'pixels'}
              onChange={(e) => setMethod(e.target.value as 'pixels')}
            />
            <span className="text-slate-300">Pixels (px)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="preset"
              checked={method === 'preset'}
              onChange={(e) => setMethod(e.target.value as 'preset')}
            />
            <span className="text-slate-300">Preset Sizes</span>
          </label>
        </div>
      </div>

      {method === 'percentage' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Percentage: {percentage}%
          </label>
          <input
            type="range"
            min="10"
            max="500"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {method === 'pixels' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Width (px):</label>
            <input
              type="number"
              value={width}
              onChange={(e) => {
                const w = parseInt(e.target.value);
                setWidth(w);
                if (maintainAspect && originalSize.width) {
                  setHeight(Math.round(w * (originalSize.height / originalSize.width)));
                }
              }}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Height (px):</label>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                const h = parseInt(e.target.value);
                setHeight(h);
                if (maintainAspect && originalSize.height) {
                  setWidth(Math.round(h * (originalSize.width / originalSize.height)));
                }
              }}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
            />
            <span className="text-slate-300">Maintain aspect ratio</span>
          </label>
        </div>
      )}

      {method === 'preset' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Hazır Boyut:</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
          >
            <option value="1920x1080">Full HD (1920x1080)</option>
            <option value="1280x720">HD (1280x720)</option>
            <option value="1024x768">1024x768</option>
            <option value="800x600">800x600</option>
            <option value="640x480">640x480</option>
            <option value="thumbnail">Thumbnail (150x150)</option>
          </select>
        </div>
      )}

      <button
        onClick={handleResize}
        disabled={!preview}
        className="btn w-full"
      >
        Resize Image
      </button>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState([16, 32, 48]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const generate = async () => {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = `favicon-${size}x${size}.png`;
          link.click();
        }
      });
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-6">
      <div
        className="upload-area"
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-4">⭐</div>
        <p className="text-slate-300">Drag and drop image or click to select</p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>
      {file && (
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-300 mb-4">Selected: {file.name}</p>
          <button onClick={generate} className="btn w-full">Generate Favicons</button>
        </div>
      )}
    </div>
  );
}


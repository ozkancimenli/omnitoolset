'use client';

import { useState, useRef } from 'react';

export default function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState('');
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      convertToBase64(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]?.type.startsWith('image/')) {
      setFile(e.dataTransfer.files[0]);
      convertToBase64(e.dataTransfer.files[0]);
    }
  };

  const convertToBase64 = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const mimeType = `image/${format}`;
          const base64String = canvas.toDataURL(mimeType);
          setBase64(base64String);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(base64);
    alert('Copied!');
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

      {file && (
        <div className="bg-slate-900 rounded-xl p-4 space-y-4">
          <p className="text-slate-300">Selected: {file.name}</p>
          <div>
            <label className="block text-slate-300 mb-2">Output Format:</label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value as 'jpeg' | 'png' | 'webp');
                if (file) convertToBase64(file);
              }}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WEBP</option>
            </select>
          </div>
        </div>
      )}

      {base64 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Base64:</h3>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={base64}
            readOnly
            rows={8}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs"
          />
          <div className="bg-slate-900 rounded-xl p-4">
            <img src={base64} alt="Preview" className="max-w-full h-auto rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}


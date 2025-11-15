'use client';

import { useState } from 'react';

export default function Base64ToImage() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const convert = () => {
    try {
      if (!input.trim()) {
        alert('Please enter Base64 string');
        return;
      }
      setImageUrl(input);
    } catch (error) {
      alert('Invalid Base64 string: ' + (error as Error).message);
    }
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image.png';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter Base64 string:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="data:image/png;base64,iVBORw0KGgo..."
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to Image
      </button>

      {imageUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Image Preview:</h3>
            <button onClick={download} className="btn">
              Download
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 text-center">
            <img
              src={imageUrl}
              alt="Converted"
              className="max-w-full h-auto mx-auto rounded-lg"
              onError={() => alert('Invalid Base64 image data')}
            />
          </div>
        </div>
      )}
    </div>
  );
}


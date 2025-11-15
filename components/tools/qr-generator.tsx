'use client';

import { useState, useEffect } from 'react';

export default function QrGenerator() {
  const [input, setInput] = useState('');
  const [size, setSize] = useState(200);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (input.trim()) {
      const encoded = encodeURIComponent(input);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`);
    }
  }, [input, size]);

  const download = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          QR Kod İçeriği:
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter URL, text or data..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Boyut: {size}x{size}
        </label>
        <input
          type="range"
          min="100"
          max="500"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {qrUrl && (
        <div className="text-center space-y-4">
          <img src={qrUrl} alt="QR Code" className="mx-auto border-2 border-slate-700 rounded-lg" />
          <button onClick={download} className="btn w-full">
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}

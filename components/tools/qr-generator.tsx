'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function QrGenerator() {
  const [input, setInput] = useState('');
  const [size, setSize] = useState(200);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (input.trim()) {
      const encoded = encodeURIComponent(input);
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`);
    } else {
      setQrUrl('');
    }
  }, [input, size]);

  const download = () => {
    if (!qrUrl) {
      toast.error('No QR code to download');
      return;
    }
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR code downloaded!');
  };

  return (
    <ToolBase
      title="QR Code Generator"
      description="Generate QR codes for URLs, text, or any data"
      icon="📱"
      helpText="Create QR codes instantly for URLs, text, contact information, or any data. Perfect for sharing links, contact details, or information quickly."
      tips={[
        'Enter any text, URL, or data to generate QR code',
        'Larger sizes are better for printing',
        'QR codes can be scanned by any smartphone camera',
        'Perfect for sharing links, contact info, or text',
        'Download as PNG image'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              QR Code Content:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL, text, contact info, or any data..."
          />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Size: {size}×{size} pixels
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {size < 200 ? 'Small' : size < 300 ? 'Medium' : 'Large'}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>100px</span>
            <span>500px</span>
          </div>
        </div>

        {qrUrl && (
          <div className="text-center space-y-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="mx-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg" 
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Scan this QR code with your smartphone camera
            </div>
            <button 
              onClick={download} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Download QR Code</span>
            </button>
          </div>
        )}

        {!input.trim() && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Enter text or URL above to generate QR code
            </p>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

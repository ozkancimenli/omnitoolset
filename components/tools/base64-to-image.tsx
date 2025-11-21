'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function Base64ToImage() {
  const [input, setInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (input.trim()) {
      if (input.startsWith('data:image/') || input.startsWith('iVBORw0KGgo') || /^[A-Za-z0-9+/=]+$/.test(input)) {
        try {
          let base64 = input.trim();
          if (!base64.startsWith('data:')) {
            base64 = 'data:image/png;base64,' + base64;
          }
          setImageUrl(base64);
        } catch {
          setImageUrl('');
        }
      } else {
        setImageUrl('');
      }
    } else {
      setImageUrl('');
    }
  }, [input]);

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter Base64 string');
      return;
    }

    try {
      let base64 = input.trim();
      if (!base64.startsWith('data:')) {
        base64 = 'data:image/png;base64,' + base64;
      }
      setImageUrl(base64);
      toast.success('Base64 converted to image!');
    } catch (error) {
      toast.error('Invalid Base64 string: ' + (error as Error).message);
      setImageUrl('');
    }
  };

  const download = () => {
    if (!imageUrl) {
      toast.warning('No image to download');
      return;
    }
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image.png';
    link.click();
    toast.success('Image downloaded!');
  };

  const clear = () => {
    setInput('');
    setImageUrl('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Base64 to Image Converter"
      description="Convert Base64 strings to images"
      icon="🖼️"
      helpText="Convert Base64 encoded image strings to viewable images. Supports data URIs and raw Base64 strings."
      tips={[
        'Paste Base64 string or data URI',
        'Real-time preview',
        'Supports all image formats',
        'Download converted image',
        'Validates Base64 format'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter Base64 string:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="data:image/png;base64,iVBORw0KGgo..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert to Image
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {imageUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Image Preview:</h3>
              <button 
                onClick={download} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Download
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
              <img
                src={imageUrl}
                alt="Converted"
                className="max-w-full h-auto mx-auto rounded-lg"
                onError={() => {
                  toast.error('Invalid Base64 image data');
                  setImageUrl('');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function ImageToBase64() {
  const [file, setFile] = useState<File | null>(null);
  const [base64, setBase64] = useState('');
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFile(selectedFile);
    convertToBase64(selectedFile);
  };

  const convertToBase64 = (selectedFile: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = () => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const mimeType = `image/${format}`;
            const base64String = canvas.toDataURL(mimeType);
            setBase64(base64String);
            toast.success('Image converted to Base64!');
          }
        } catch (error) {
          toast.error('Error converting image: ' + (error as Error).message);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        toast.error('Error loading image');
        setIsProcessing(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      toast.error('Error reading file');
      setIsProcessing(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFormatChange = (newFormat: 'jpeg' | 'png' | 'webp') => {
    setFormat(newFormat);
    if (file) {
      convertToBase64(file);
    }
  };

  const copyToClipboard = () => {
    if (!base64.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(base64);
    toast.success('Base64 copied to clipboard!');
  };

  const clear = () => {
    setFile(null);
    setBase64('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Image to Base64 Converter"
      description="Convert images to Base64 strings"
      icon="🖼️"
      helpText="Convert images to Base64 encoded strings. Supports JPEG, PNG, and WebP formats. Perfect for embedding images in HTML, CSS, or data URIs."
      tips={[
        'Upload any image format',
        'Choose output format (JPEG, PNG, WebP)',
        'Get Base64 data URI',
        'Copy to clipboard',
        'Preview converted image'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['image/*']}
            icon="🖼️"
            text="Drag and drop your image here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Selected: {file.name}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format:
              </label>
              <select
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as 'jpeg' | 'png' | 'webp')}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Base64:</h3>
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Copy
                </button>
                <button 
                  onClick={clear}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={base64}
                readOnly
                rows={8}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-xs resize-none focus:outline-none"
              />
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <img src={base64} alt="Preview" className="max-w-full h-auto rounded-lg mx-auto" />
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


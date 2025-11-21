'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function ImageCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, ['image/*'], ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressedSize(null);
    setCompressionRatio(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
        setPreview(e.target?.result as string);
        toast.success(`Image loaded: ${selectedFile.name}`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCompress = () => {
    if (!preview || !file) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    toast.info('Compressing image...');

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create canvas context');
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);

      let mimeType = 'image/jpeg';
      if (outputFormat === 'png') mimeType = 'image/png';
      if (outputFormat === 'webp') mimeType = 'image/webp';

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to compress image');
          setIsProcessing(false);
          return;
        }

        setCompressedSize(blob.size);
        const ratio = ((file.size - blob.size) / file.size) * 100;
        setCompressionRatio(ratio);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
        a.download = file.name.replace(/\.[^/.]+$/, '') + '_compressed.' + extension;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsProcessing(false);
        if (ratio > 0) {
          toast.success(`Image compressed! Size reduced by ${ratio.toFixed(1)}%`);
        } else {
          toast.warning('Image could not be compressed further. Try lower quality.');
        }
      }, mimeType, quality / 100);
    };
    
    img.onerror = () => {
      toast.error('Failed to load image');
      setIsProcessing(false);
    };
    
    img.src = preview;
  };

  return (
    <ToolBase
      title="Compress Image"
      description="Reduce image file size while maintaining quality"
      icon="🗜️"
      maxFileSize={50}
      acceptedFileTypes={['image/*']}
      acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']}
      isProcessing={isProcessing}
      helpText="Compress your images to reduce file size. Perfect for web uploads, email attachments, and storage optimization."
      tips={[
        'Lower quality = smaller file size',
        'JPEG is best for photos',
        'PNG is best for graphics with transparency',
        'WebP offers best compression',
        'Original dimensions are preserved'
      ]}
    >
      <FileUploadArea
        onFileSelect={handleFileSelect}
        maxFileSize={50}
        acceptedFileTypes={['image/*']}
        acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']}
        icon="🖼️"
        text="Drag and drop your image file here or click to select"
        subtext="100% free • No registration • Secure • Files processed in your browser"
        showFileInfo={true}
      />

      {preview && (
        <div className="space-y-4">
          <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200 dark:border-gray-700" 
            />
            {imageDimensions && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {imageDimensions.width} × {imageDimensions.height} pixels
              </p>
            )}
          </div>

          {originalSize && (
            <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Original Size</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    {formatFileSize(originalSize)}
                  </p>
                </div>
                {compressedSize && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Compressed Size</p>
                    <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                      {formatFileSize(compressedSize)}
                    </p>
                  </div>
                )}
              </div>
              {compressionRatio !== null && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Size Reduction</span>
                    <span className={`font-bold text-lg ${
                      compressionRatio > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {compressionRatio > 0 ? '-' : ''}{Math.abs(compressionRatio).toFixed(1)}%
                    </span>
                  </div>
                  {compressionRatio > 0 && (
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(compressionRatio, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quality: {quality}%
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {quality >= 80 ? 'High' : quality >= 60 ? 'Medium' : 'Low'}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="jpeg">JPEG (Best for photos)</option>
                <option value="png">PNG (Best for graphics)</option>
                <option value="webp">WebP (Best compression)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCompress}
            disabled={!preview || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <span>🗜️</span>
                <span>Compress Image</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Upload your image file (up to 50MB)</li>
          <li>Adjust quality slider (lower = smaller file)</li>
          <li>Choose output format (JPEG, PNG, or WebP)</li>
          <li>Click "Compress Image" to process</li>
          <li>Download your compressed image instantly</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

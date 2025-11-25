'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

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
  const [newSize, setNewSize] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, ['image/*'], ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setNewSize(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setPreview(e.target?.result as string);
        toast.success(`Image loaded: ${img.width} × ${img.height} pixels`);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  };

  const calculateNewSize = () => {
    if (!originalSize.width || !originalSize.height) return null;

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

    return { width: newWidth, height: newHeight };
  };

  const handleResize = () => {
    if (!preview || !file) {
      toast.error('Please select an image first');
      return;
    }

    setIsProcessing(true);
    toast.info('Resizing image...');

    const img = new Image();
    img.onload = () => {
      const calculatedSize = calculateNewSize();
      if (!calculatedSize) {
        toast.error('Invalid size calculation');
        setIsProcessing(false);
        return;
      }

      const { width: newWidth, height: newHeight } = calculatedSize;
      setNewSize({ width: newWidth, height: newHeight });

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create canvas context');
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to resize image');
          setIsProcessing(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = file.name.split('.').pop() || 'png';
        a.download = file.name.replace(/\.[^/.]+$/, '') + `_${newWidth}x${newHeight}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsProcessing(false);
        toast.success(`Image resized to ${newWidth} × ${newHeight} pixels!`);
      }, file.type || 'image/png', 1.0);
    };
    
    img.onerror = () => {
      toast.error('Failed to load image');
      setIsProcessing(false);
    };
    
    img.src = preview;
  };

  const calculatedSize = calculateNewSize();

  return (
    <ToolBase
      title="Resize Image"
      description="Resize your images by percentage, pixels, or preset sizes"
      icon="📐"
      maxFileSize={50}
      acceptedFileTypes={['image/*']}
      acceptedExtensions={['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']}
      isProcessing={isProcessing}
      helpText="Resize your images to any size. Choose from percentage, pixel dimensions, or preset sizes. Maintain aspect ratio or set custom dimensions."
      tips={[
        'Percentage: Scale by percentage (e.g., 50% = half size)',
        'Pixels: Set exact width and height',
        'Preset: Choose from common sizes (HD, Full HD, etc.)',
        'Maintain aspect ratio to avoid distortion',
        'Original quality is preserved'
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

      {preview && originalSize.width > 0 && (
        <div className="space-y-4">
          <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200 dark:border-gray-700" 
            />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Original Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {originalSize.width} × {originalSize.height} px
                </p>
              </div>
              {calculatedSize && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">New Size</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {calculatedSize.width} × {calculatedSize.height} px
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Resize Method:
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="method"
                    value="percentage"
                    checked={method === 'percentage'}
                    onChange={(e) => setMethod(e.target.value as 'percentage')}
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <span className="text-gray-900 dark:text-white font-medium">Percentage</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Scale by percentage (e.g., 50% = half size)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="method"
                    value="pixels"
                    checked={method === 'pixels'}
                    onChange={(e) => setMethod(e.target.value as 'pixels')}
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <span className="text-gray-900 dark:text-white font-medium">Pixels</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Set exact width and height in pixels
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input
                    type="radio"
                    name="method"
                    value="preset"
                    checked={method === 'preset'}
                    onChange={(e) => setMethod(e.target.value as 'preset')}
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <span className="text-gray-900 dark:text-white font-medium">Preset Sizes</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose from common sizes (HD, Full HD, etc.)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {method === 'percentage' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Percentage: {percentage}%
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {calculatedSize && `${calculatedSize.width} × ${calculatedSize.height} px`}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>10%</span>
                  <span>500%</span>
                </div>
              </div>
            )}

            {method === 'pixels' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Width (px):
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => {
                        const w = parseInt(e.target.value) || 0;
                        setWidth(w);
                        if (maintainAspect && originalSize.width) {
                          setHeight(Math.round(w * (originalSize.height / originalSize.width)));
                        }
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Height (px):
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => {
                        const h = parseInt(e.target.value) || 0;
                        setHeight(h);
                        if (maintainAspect && originalSize.height) {
                          setWidth(Math.round(h * (originalSize.width / originalSize.height)));
                        }
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintainAspect}
                    onChange={(e) => setMaintainAspect(e.target.checked)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Maintain aspect ratio
                  </span>
                </label>
              </div>
            )}

            {method === 'preset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preset Size:
                </label>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1920x1080">Full HD (1920×1080)</option>
                  <option value="1280x720">HD (1280×720)</option>
                  <option value="1024x768">1024×768</option>
                  <option value="800x600">800×600</option>
                  <option value="640x480">640×480</option>
                  <option value="thumbnail">Thumbnail (150×150)</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleResize}
            disabled={!preview || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Resizing...</span>
              </>
            ) : (
              <>
                <span>📐</span>
                <span>Resize Image</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Upload your image file (up to 50MB)</li>
          <li>Choose resize method: percentage, pixels, or preset</li>
          <li>Adjust settings based on your chosen method</li>
          <li>Click "Resize Image" to process</li>
          <li>Download your resized image instantly</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function FaviconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState([16, 32, 48]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const generate = async () => {
    if (!file) {
      toast.warning('Please select an image first');
      return;
    }

    setIsGenerating(true);
    try {
      const img = new Image();
      img.onload = () => {
        try {
          sizes.forEach((size, index) => {
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
          toast.success(`Generated ${sizes.length} favicon(s)!`);
        } catch (error) {
          toast.error('Error generating favicons: ' + (error as Error).message);
        } finally {
          setIsGenerating(false);
        }
      };
      img.onerror = () => {
        toast.error('Error loading image');
        setIsGenerating(false);
      };
      img.src = URL.createObjectURL(file);
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
      setIsGenerating(false);
    }
  };

  const toggleSize = (size: number) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size].sort((a, b) => a - b));
    }
  };

  const clear = () => {
    setFile(null);
    toast.info('Cleared');
  };

  const commonSizes = [16, 32, 48, 64, 96, 128, 180, 192, 256];

  return (
    <ToolBase
      title="Favicon Generator"
      description="Generate favicons in multiple sizes"
      icon="⭐"
      helpText="Generate favicons in multiple sizes from a single image. Select the sizes you need and download all at once."
      tips={[
        'Upload any image format',
        'Select multiple sizes',
        'Downloads all selected sizes',
        'Common sizes: 16x16, 32x32, 48x48',
        'Perfect for web development'
      ]}
      isProcessing={isGenerating}
    >
      <div className="space-y-4">
        {!isGenerating && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['image/*']}
            icon="⭐"
            text="Drag and drop image or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Sizes:
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {commonSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      sizes.includes(size)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Selected: {sizes.length} size{sizes.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={generate} 
                disabled={sizes.length === 0 || isGenerating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate Favicons'}
              </button>
              <button 
                onClick={clear}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


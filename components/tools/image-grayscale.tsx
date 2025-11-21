'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function ImageGrayscale() {
  const [file, setFile] = useState<File | null>(null);
  const [processedUrl, setProcessedUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    processImage(selectedFile);
  };

  const processImage = (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
              const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              data[i] = gray;
              data[i + 1] = gray;
              data[i + 2] = gray;
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedUrl(canvas.toDataURL());
            toast.success('Image converted to grayscale!');
          }
        } catch (error) {
          toast.error('Error processing image: ' + (error as Error).message);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        toast.error('Error loading image');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      toast.error('Error reading file');
      setIsProcessing(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const download = () => {
    if (!processedUrl) {
      toast.warning('No image to download');
      return;
    }
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = file?.name.replace(/\.[^/.]+$/, '') + '_grayscale.png';
    link.click();
    toast.success('Image downloaded!');
  };

  const clear = () => {
    setFile(null);
    setProcessedUrl('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Image Grayscale Converter"
      description="Convert images to grayscale"
      icon="🖼️"
      helpText="Convert color images to grayscale. Uses luminance formula (0.299*R + 0.587*G + 0.114*B) for accurate grayscale conversion."
      tips={[
        'Upload any image format',
        'Automatic grayscale conversion',
        'Preserves image dimensions',
        'Download processed image',
        'Works with all image types'
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

        {processedUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Grayscale Image:</h3>
              <div className="flex gap-2">
                <button 
                  onClick={download} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Download
                </button>
                <button 
                  onClick={clear}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
              <img
                src={processedUrl}
                alt="Grayscale"
                className="max-w-full h-auto mx-auto rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


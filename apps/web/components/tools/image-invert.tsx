'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function ImageInvert() {
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
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }

            ctx.putImageData(imageData, 0, 0);
            setProcessedUrl(canvas.toDataURL());
            toast.success('Image inverted!');
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
    link.download = file?.name.replace(/\.[^/.]+$/, '') + '_inverted.png';
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
      title="Image Inverter"
      description="Invert image colors"
      icon="🖼️"
      helpText="Invert the colors of your images. Creates a negative effect by inverting RGB values (255 - value)."
      tips={[
        'Upload any image format',
        'Automatic color inversion',
        'Preserves image dimensions',
        'Download processed image',
        'Negative photo effect'
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Inverted Image:</h3>
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
                alt="Inverted"
                className="max-w-full h-auto mx-auto rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


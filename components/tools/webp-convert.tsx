'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function WebpConvert() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'webp' | 'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsDataURL(selectedFile);
    
    if (selectedFile.type === 'image/webp') {
      setOutputFormat('jpeg');
    } else {
      setOutputFormat('webp');
    }
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = () => {
    if (!preview) {
      toast.warning('Please select an image first');
      return;
    }

    setIsProcessing(true);

    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            toast.error('Error creating canvas');
            setIsProcessing(false);
            return;
          }

          ctx.drawImage(img, 0, 0);

          let mimeType = 'image/webp';
          if (outputFormat === 'jpeg') mimeType = 'image/jpeg';
          if (outputFormat === 'png') mimeType = 'image/png';
          
          let qualityValue = (outputFormat === 'webp' || outputFormat === 'jpeg') 
            ? quality / 100 
            : 1.0;

          canvas.toBlob((blob) => {
            if (!blob) {
              toast.error('Error converting image');
              setIsProcessing(false);
              return;
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            let extension = 'webp';
            if (outputFormat === 'jpeg') extension = 'jpg';
            if (outputFormat === 'png') extension = 'png';
            a.download = file?.name.replace(/\.[^/.]+$/, '') + '.' + extension;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`Image converted to ${outputFormat.toUpperCase()}!`);
            setIsProcessing(false);
          }, mimeType, qualityValue);
        } catch (error) {
          toast.error('Error converting image: ' + (error as Error).message);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        toast.error('Error loading image');
        setIsProcessing(false);
      };
      img.src = preview;
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="WebP Converter"
      description="Convert images to/from WebP format"
      icon="🖼️"
      helpText="Convert images between WebP, JPEG, and PNG formats. Adjustable quality for WebP and JPEG output."
      tips={[
        'Upload any image format',
        'Convert to WebP, JPG, or PNG',
        'Adjustable quality settings',
        'Preserves image dimensions',
        'Download converted image'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['image/webp', 'image/jpeg', 'image/jpg', 'image/png']}
            icon="🖼️"
            text="Drag and drop your image file here or click to select"
          />
        )}

        {preview && (
          <div className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <img src={preview} alt="Preview" className="max-w-full max-h-96 mx-auto rounded-lg" />
          </div>
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Convert to:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'webp' | 'jpeg' | 'png')}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="webp">Convert to WEBP</option>
                <option value="jpeg">Convert to JPG</option>
                <option value="png">Convert to PNG</option>
              </select>
            </div>

            {(outputFormat === 'webp' || outputFormat === 'jpeg') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleConvert}
                disabled={!preview || isProcessing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isProcessing ? 'Converting...' : 'Convert'}
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

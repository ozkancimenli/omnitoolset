'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfMergeImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select image files only');
      return;
    }
    setFiles(prev => [...prev, selectedFile]);
    toast.success(`Added: ${selectedFile.name}`);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info('File removed');
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.warning('Please select at least one image');
      return;
    }

    setIsProcessing(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const img = await loadImage(file);
        
        if (i > 0) {
          pdf.addPage();
        }

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;

        pdf.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
      }

      pdf.save('images.pdf');
      toast.success(`PDF created with ${files.length} image(s)!`);
    } catch (error) {
      toast.error('Error creating PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFiles([]);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Merge Images to PDF"
      description="Combine multiple images into a single PDF"
      icon="🖼️"
      helpText="Combine multiple images into a single PDF document. Each image becomes a page. Supports all common image formats."
      tips={[
        'Upload multiple images',
        'Each image becomes a page',
        'Images are automatically resized',
        'Download as single PDF',
        'Supports all image formats'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['image/*']}
            multiple={true}
            icon="🖼️"
            text="Drag and drop your images here or click to select"
            subtext="You can add multiple images"
          />
        )}

        {files.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Selected Images ({files.length})
              </h3>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    {index + 1}. {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-1 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={files.length === 0 || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Creating PDF...' : `Create PDF from ${files.length} Image${files.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </ToolBase>
  );
}


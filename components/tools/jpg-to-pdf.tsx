'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

interface JpgToPdfProps {
  toolId?: string;
}

export default function JpgToPdf({ toolId }: JpgToPdfProps) {
  const isPNG = toolId === 'png-to-pdf';
  const format = isPNG ? 'PNG' : 'JPG';
  const acceptedTypes = isPNG ? ['image/png'] : ['image/jpeg', 'image/jpg'];
  const acceptedExts = isPNG ? ['.png'] : ['.jpg', '.jpeg'];
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, acceptedTypes, acceptedExts);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Check if file already exists
    if (files.some(f => f.name === selectedFile.name && f.size === selectedFile.size)) {
      toast.warning('This file is already added');
      return;
    }

    setFiles(prev => [...prev, selectedFile]);
    toast.success(`Added: ${selectedFile.name}`);
  };

  const handleMultipleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => handleFileSelect(file));
    }
  };

  const removeFile = (index: number) => {
    const removedFile = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info(`Removed: ${removedFile.name}`);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
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
      toast.error('Please select at least one image file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      toast.info(`Converting ${files.length} image(s) to PDF...`);
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();

      for (let i = 0; i < files.length; i++) {
        setProgress(((i + 1) / files.length) * 90);
        toast.info(`Processing image ${i + 1} of ${files.length}...`);
        
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

        pdf.addImage(img, isPNG ? 'PNG' : 'JPEG', x, y, imgWidth, imgHeight);
      }

      setProgress(95);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length === 1 
        ? files[0].name.replace(/\.[^/.]+$/, '.pdf')
        : 'images.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Successfully converted ${files.length} image(s) to PDF!`);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An error occurred during conversion';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <ToolBase
      title={`${format} to PDF`}
      description={`Convert ${format} images to PDF document`}
      icon="📄"
      maxFileSize={50}
      acceptedFileTypes={acceptedTypes}
      acceptedExtensions={acceptedExts}
      showProgress={true}
      progress={progress}
      isProcessing={isProcessing}
      helpText={`Convert your ${format} images to a PDF document. Multiple images will be combined into a single PDF with each image on a separate page.`}
      tips={[
        'You can convert one or multiple images',
        'Images are added in the order shown below',
        'Drag files to reorder them',
        'Each image becomes a separate page in the PDF',
        'Images are automatically scaled to fit the page'
      ]}
    >
      <FileUploadArea
        onFileSelect={handleFileSelect}
        maxFileSize={50}
        acceptedFileTypes={acceptedTypes}
        acceptedExtensions={acceptedExts}
        multiple={true}
        icon="🖼️"
        text={`Drag and drop ${format} files here or click to select multiple files`}
        subtext="100% free • No registration • Secure • Files processed in your browser"
        showFileInfo={false}
      />

      {/* Multiple file input for selecting multiple at once */}
      <input
        ref={fileInputRef}
        type="file"
        accept={isPNG ? 'image/png' : 'image/jpeg,image/jpg'}
        multiple
        onChange={handleMultipleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
      >
        + Add More {format} Files
      </button>

      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Files ({files.length})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatFileSize(totalSize)}
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    aria-label="Remove file"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={files.length === 0 || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Converting... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Convert {files.length > 0 ? `${files.length} Image${files.length > 1 ? 's' : ''}` : 'Images'} to PDF</span>
          </>
        )}
      </button>

      {files.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Please add at least one {format} image to convert
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Select one or multiple {format} images</li>
          <li>Arrange images in the desired order using up/down arrows</li>
          <li>Click "Convert to PDF" to create your PDF</li>
          <li>Each image becomes a separate page in the PDF</li>
          <li>Download your PDF instantly</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

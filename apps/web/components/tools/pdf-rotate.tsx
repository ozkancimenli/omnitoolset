'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import { PDFDocument, degrees } from 'pdf-lib';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_rotated.pdf');
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`PDF rotated ${rotation}°!`);
    } catch (error) {
      toast.error('Error rotating PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PDF Rotator"
      description="Rotate all pages in a PDF document"
      icon="📄"
      helpText="Rotate all pages in a PDF document by 90°, 180°, or 270°. Useful for correcting orientation of scanned documents."
      tips={[
        'Upload PDF file',
        'Select rotation angle',
        'All pages are rotated',
        'Download rotated PDF',
        'Supports 90°, 180°, 270°'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/pdf']}
            acceptedExtensions={['.pdf']}
            icon="📄"
            text="Drag and drop your PDF file here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rotation angle:
              </label>
              <div className="flex gap-3">
                {[90, 180, 270].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setRotation(angle as 90 | 180 | 270)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      rotation === angle
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {angle}°
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Rotating...' : 'Rotate PDF'}
        </button>
      </div>
    </ToolBase>
  );
}


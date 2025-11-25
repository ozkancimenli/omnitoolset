'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfPageCount() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    await countPages(selectedFile);
  };

  const countPages = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setPageCount(null);
    
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      try {
        const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
        if (!response.ok) throw new Error('Worker not found');
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      toast.success(`PDF has ${pdf.numPages} page${pdf.numPages !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Error counting pages: ' + (error as Error).message);
      setPageCount(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPageCount(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PDF Page Counter"
      description="Count pages in a PDF document"
      icon="📄"
      helpText="Count the number of pages in a PDF file. Quick and accurate page counting for any PDF document."
      tips={[
        'Upload any PDF file',
        'Instant page count',
        'Works with all PDF types',
        'No file size limit',
        'Fast and accurate'
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
            {pageCount !== null && (
              <div className="text-center mt-4">
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">{pageCount}</div>
                <div className="text-gray-600 dark:text-gray-400 text-lg">
                  {pageCount === 1 ? 'Page' : 'Pages'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolBase>
  );
}


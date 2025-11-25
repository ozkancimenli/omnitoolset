'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import { PDFDocument } from 'pdf-lib';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfDeletePages() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState<string>('');
  const [totalPages, setTotalPages] = useState(0);

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      toast.success(`PDF loaded: ${pdfDoc.getPageCount()} page${pdfDoc.getPageCount() !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Error loading PDF: ' + (error as Error).message);
      setFile(null);
      setTotalPages(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const parsePageNumbers = (input: string): number[] => {
    const pages: number[] = [];
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i > 0 && i <= totalPages) pages.push(i - 1); // Convert to 0-based
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num > 0 && num <= totalPages) {
          pages.push(num - 1); // Convert to 0-based
        }
      }
    }
    
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a PDF file first');
      return;
    }
    if (!pagesToDelete.trim()) {
      toast.warning('Please specify which pages to delete');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pagesToRemove = parsePageNumbers(pagesToDelete);
      if (pagesToRemove.length === 0) {
        toast.warning('No valid pages to delete');
        setIsProcessing(false);
        return;
      }

      // Remove pages in reverse order to maintain indices
      pagesToRemove.reverse().forEach((pageIndex) => {
        pdfDoc.removePage(pageIndex);
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_edited.pdf');
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Deleted ${pagesToRemove.length} page${pagesToRemove.length !== 1 ? 's' : ''}!`);
    } catch (error) {
      toast.error('Error deleting pages: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPagesToDelete('');
    setTotalPages(0);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PDF Delete Pages"
      description="Remove specific pages from a PDF"
      icon="📄"
      helpText="Delete specific pages from a PDF document. Enter page numbers separated by commas or ranges like 2-5."
      tips={[
        'Upload PDF file',
        'Enter page numbers to delete',
        'Supports ranges (e.g., 2-5)',
        'Supports comma-separated (e.g., 1,3,5)',
        'Download edited PDF'
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total pages: <span className="font-semibold">{totalPages}</span></p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pages to delete (e.g., 1,3,5 or 2-5):
              </label>
              <input
                type="text"
                value={pagesToDelete}
                onChange={(e) => setPagesToDelete(e.target.value)}
                placeholder="1,3,5 or 2-5"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Enter page numbers separated by commas, or ranges like 2-5
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || !pagesToDelete.trim() || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Delete Pages'}
        </button>
      </div>
    </ToolBase>
  );
}


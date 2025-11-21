'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [method, setMethod] = useState<'all' | 'range' | 'custom'>('all');
  const [pageRange, setPageRange] = useState('');
  const [customPages, setCustomPages] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [extractedPages, setExtractedPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, ['application/pdf'], ['.pdf']);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    
    // Load PDF to get page count
    selectedFile.arrayBuffer().then(buffer => {
      PDFDocument.load(buffer).then(pdf => {
        setTotalPages(pdf.getPageCount());
        toast.success(`PDF loaded: ${pdf.getPageCount()} pages`);
      }).catch(() => {
        // Will be handled in split function
      });
    });
  };

  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (start && end && start <= end && start >= 1 && end <= maxPages) {
          for (let i = start; i <= end; i++) {
            pages.add(i - 1);
          }
        }
      } else {
        const page = parseInt(trimmed);
        if (page && page >= 1 && page <= maxPages) {
          pages.add(page - 1);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      toast.info('Loading PDF...');
      setProgress(10);
      const fileBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBytes);
      const pdfTotalPages = sourcePdf.getPageCount();
      setTotalPages(pdfTotalPages);

      let pagesToExtract: number[][] = [];

      if (method === 'all') {
        pagesToExtract = Array.from({ length: pdfTotalPages }, (_, i) => [i]);
        toast.info(`Splitting all ${pdfTotalPages} pages...`);
      } else if (method === 'range') {
        if (!pageRange.trim()) {
          toast.error('Please enter a page range (e.g., 1-5)');
          setIsProcessing(false);
          return;
        }
        const pages = parsePageRange(pageRange, pdfTotalPages);
        if (pages.length === 0) {
          toast.error('Invalid page range! Please check your input.');
          setIsProcessing(false);
          return;
        }
        pagesToExtract = pages.map(p => [p]);
        toast.info(`Extracting ${pages.length} page(s)...`);
      } else if (method === 'custom') {
        if (!customPages.trim()) {
          toast.error('Please enter page numbers (e.g., 1,3,5-8)');
          setIsProcessing(false);
          return;
        }
        const pages = parsePageRange(customPages, pdfTotalPages);
        if (pages.length === 0) {
          toast.error('Invalid page numbers! Please check your input.');
          setIsProcessing(false);
          return;
        }
        pagesToExtract = pages.map(p => [p]);
        toast.info(`Extracting ${pages.length} page(s)...`);
      }

      setProgress(20);
      // Create ZIP with all split PDFs
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const baseName = file.name.replace('.pdf', '');

      for (let i = 0; i < pagesToExtract.length; i++) {
        setProgress(20 + ((i + 1) / pagesToExtract.length) * 70);
        
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, pagesToExtract[i]);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        zip.file(`${baseName}_page_${pagesToExtract[i][0] + 1}.pdf`, pdfBytes);
      }

      setProgress(95);
      toast.info('Creating ZIP file...');
      const blob = await zip.generateAsync({ type: 'blob' });
      setExtractedPages(pagesToExtract.length);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = baseName + '_split.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Successfully split PDF into ${pagesToExtract.length} file(s)!`);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An error occurred during splitting';
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          errorMessage = 'This PDF is password-protected. Please unlock it first.';
        } else if (error.message.includes('corrupted')) {
          errorMessage = 'The PDF file appears to be corrupted or invalid.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <ToolBase
      title="Split PDF"
      description="Split your PDF file by pages into separate files"
      icon="✂️"
      maxFileSize={50}
      acceptedFileTypes={['application/pdf']}
      acceptedExtensions={['.pdf']}
      showProgress={true}
      progress={progress}
      isProcessing={isProcessing}
      helpText="Split your PDF into individual pages or extract specific pages. All split files will be downloaded as a ZIP archive."
      tips={[
        'Split all pages: Creates separate PDF for each page',
        'Page range: Extract pages 1-5, 10-15, etc.',
        'Custom pages: Extract specific pages like 1,3,5-8',
        'All files are downloaded as a ZIP archive'
      ]}
    >
      <FileUploadArea
        onFileSelect={handleFileSelect}
        maxFileSize={50}
        acceptedFileTypes={['application/pdf']}
        acceptedExtensions={['.pdf']}
        icon="📄"
        text="Drag and drop your PDF file here or click to select"
        subtext="100% free • No registration • Secure • Files processed in your browser"
        showFileInfo={true}
      />

      {file && totalPages > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Pages:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
              {totalPages}
            </span>
          </div>
          {extractedPages > 0 && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
              <span className="text-gray-600 dark:text-gray-400">Will Extract:</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {extractedPages} file(s)
              </span>
            </div>
          )}
        </div>
      )}

      {file && (
        <div className="space-y-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Split Method:
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="method"
                value="all"
                checked={method === 'all'}
                onChange={(e) => {
                  setMethod(e.target.value as 'all');
                  setExtractedPages(totalPages);
                }}
                className="text-blue-600"
              />
              <div className="flex-1">
                <span className="text-gray-900 dark:text-white font-medium">Split all pages</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Creates separate PDF for each page ({totalPages} files)
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="method"
                value="range"
                checked={method === 'range'}
                onChange={(e) => {
                  setMethod(e.target.value as 'range');
                  setExtractedPages(0);
                }}
                className="text-blue-600"
              />
              <div className="flex-1">
                <span className="text-gray-900 dark:text-white font-medium">Page range</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Extract a range of pages (e.g., 1-5)
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="method"
                value="custom"
                checked={method === 'custom'}
                onChange={(e) => {
                  setMethod(e.target.value as 'custom');
                  setExtractedPages(0);
                }}
                className="text-blue-600"
              />
              <div className="flex-1">
                <span className="text-gray-900 dark:text-white font-medium">Custom pages</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Extract specific pages (e.g., 1,3,5-8,10)
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {file && method === 'range' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Page Range (e.g., 1-5):
          </label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => {
              setPageRange(e.target.value);
              if (e.target.value.trim()) {
                const pages = parsePageRange(e.target.value, totalPages);
                setExtractedPages(pages.length);
              } else {
                setExtractedPages(0);
              }
            }}
            placeholder="1-5"
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter range like: 1-5, 10-15, or single pages: 1, 3, 5
          </p>
        </div>
      )}

      {file && method === 'custom' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Page Numbers:
          </label>
          <input
            type="text"
            value={customPages}
            onChange={(e) => {
              setCustomPages(e.target.value);
              if (e.target.value.trim()) {
                const pages = parsePageRange(e.target.value, totalPages);
                setExtractedPages(pages.length);
              } else {
                setExtractedPages(0);
              }
            }}
            placeholder="1,3,5-8,10"
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter pages separated by commas. Use dashes for ranges: 1,3,5-8,10
          </p>
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || isProcessing || (method === 'range' && !pageRange.trim()) || (method === 'custom' && !customPages.trim())}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Splitting... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <span>✂️</span>
            <span>Split PDF</span>
          </>
        )}
      </button>

      {file && extractedPages > 0 && method !== 'all' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Will extract {extractedPages} page{extractedPages > 1 ? 's' : ''} into separate file{extractedPages > 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Upload your PDF file (up to 50MB)</li>
          <li>Choose split method: all pages, range, or custom</li>
          <li>Enter page numbers or range if needed</li>
          <li>Click "Split PDF" to process</li>
          <li>Download ZIP file containing all split PDFs</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { toast } from '@/components/Toast';

type Rotation = 0 | 90 | 180 | 270;

interface PageData {
  id: string;
  pageNumber: number;
  rotation: Rotation;
}

export default function PdfPageEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<PDFDocument | null>(null);

  // Listen for external file input triggers
  useEffect(() => {
    const handleFileInputClick = () => {
      fileInputRef.current?.click();
    };

    const inputElement = document.getElementById('pdf-file-input');
    if (inputElement) {
      inputElement.addEventListener('click', handleFileInputClick);
      return () => {
        inputElement.removeEventListener('click', handleFileInputClick);
      };
    }
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.includes('pdf')) {
      toast.error('Please select a valid PDF file.');
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB.');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      pdfDocRef.current = pdfDoc;

      const numPages = pdfDoc.getPageCount();
      const newPages: PageData[] = Array.from({ length: numPages }, (_, i) => ({
        id: `page-${i}`,
        pageNumber: i,
        rotation: 0,
      }));

      setPages(newPages);
      setFile(selectedFile);
      toast.success(`PDF loaded successfully! ${numPages} page${numPages !== 1 ? 's' : ''} found.`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF. Please make sure the file is valid and not corrupted.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const rotatePage = useCallback((pageId: string, direction: 'left' | 'right') => {
    setPages(prevPages =>
      prevPages.map(page => {
        if (page.id === pageId) {
          const rotationChange = direction === 'right' ? 90 : -90;
          const newRotation = (page.rotation + rotationChange) % 360;
          const normalizedRotation = (newRotation < 0 ? 360 + newRotation : newRotation) as Rotation;
          return { ...page, rotation: normalizedRotation };
        }
        return page;
      })
    );
    toast.info(`Page rotated ${direction === 'right' ? 'right' : 'left'}`);
  }, []);

  const deletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the last page.');
      return;
    }
    setPages(prevPages => prevPages.filter(page => page.id !== pageId));
    toast.info('Page deleted');
  }, [pages.length]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOverItem = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setPages(prevPages => {
      const newPages = [...prevPages];
      const draggedItem = newPages[draggedIndex];
      newPages.splice(draggedIndex, 1);
      newPages.splice(index, 0, draggedItem);
      return newPages;
    });
    setDraggedIndex(index);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    toast.info('Pages reordered');
  }, []);

  const resetChanges = useCallback(() => {
    if (!file) return;
    handleFileSelect(file);
    toast.info('Changes reset');
  }, [file, handleFileSelect]);

  const applyChanges = useCallback(async () => {
    if (!pdfDocRef.current || pages.length === 0) {
      toast.error('Please load a PDF file first.');
      return;
    }

    setIsProcessing(true);
    try {
      const pdfDoc = pdfDocRef.current;
      const newPdfDoc = await PDFDocument.create();

      // Copy pages in new order with rotations
      for (const pageData of pages) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageData.pageNumber]);
        newPdfDoc.addPage(copiedPage);

        // Apply rotation to the last added page
        const newPage = newPdfDoc.getPage(newPdfDoc.getPageCount() - 1);
        newPage.setRotation(degrees(pageData.rotation));
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file?.name.replace('.pdf', '_edited.pdf') || 'edited.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error applying changes:', error);
      toast.error('Failed to apply changes. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [pages, file]);

  // No file uploaded state
  if (!file) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-16 text-center bg-white dark:bg-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all cursor-pointer group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="pdf-file-input"
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) handleFileSelect(selectedFile);
            }}
            className="hidden"
          />
          <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📄</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Drop your PDF here or click to browse
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Maximum file size: 50MB
          </p>
        </div>
      </div>
    );
  }

  // Editor state
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{pages.length}</span> page{pages.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={resetChanges}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Reset Changes
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={applyChanges}
              disabled={isProcessing}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? 'Processing...' : 'Download Edited PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Page Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map((page, index) => (
          <div
            key={page.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOverItem(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-move ${
              draggedIndex === index ? 'opacity-50 scale-95' : ''
            }`}
          >
            {/* Page Number */}
            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
              {index + 1}
            </div>

            {/* Page Preview (Placeholder) */}
            <div
              className="w-full aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg mb-3 flex items-center justify-center border border-slate-300 dark:border-slate-600"
              style={{
                transform: `rotate(${page.rotation}deg)`,
              }}
            >
              <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                Page {page.pageNumber + 1}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <button
                  onClick={() => rotatePage(page.id, 'left')}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  aria-label={`Rotate page ${index + 1} left`}
                  title="Rotate left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => rotatePage(page.id, 'right')}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  aria-label={`Rotate page ${index + 1} right`}
                  title="Rotate right"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" transform="rotate(180 12 12)" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => deletePage(page.id)}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                aria-label={`Delete page ${index + 1}`}
                title="Delete page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Drag hint */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


'use client';

import { useState, useRef, useCallback } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { toast } from '@/components/Toast';
import Toolbar from './Toolbar';
import PageThumbnail from './PageThumbnail';

type Rotation = 0 | 90 | 180 | 270;

interface PageData {
  id: string;
  pageNumber: number;
  rotation: Rotation;
}

/**
 * Standalone PDF Editor Component
 * 
 * Clean, professional PDF editor with reorder, rotate, and delete functionality.
 * Designed with a calm, trustworthy UI that encourages engagement.
 */
export default function PdfEditorStandalone() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfDocRef = useRef<PDFDocument | null>(null);

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
          className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center bg-white hover:border-blue-400 transition-all cursor-pointer group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload PDF file"
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Drop your PDF here or click to browse
          </h3>
          <p className="text-gray-600 text-sm">
            Maximum file size: 50MB
          </p>
        </div>
      </div>
    );
  }

  // Editor state
  return (
    <div className="bg-white">
      {/* Toolbar */}
      <Toolbar
        fileName={file.name}
        pageCount={pages.length}
        onReset={resetChanges}
        onDownload={applyChanges}
        isProcessing={isProcessing}
        hasChanges={true}
      />

      {/* Page Thumbnails Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((page, index) => (
            <div
              key={page.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
            >
              <PageThumbnail
                pageNumber={page.pageNumber}
                displayIndex={index}
                rotation={page.rotation}
                onRotateLeft={() => rotatePage(page.id, 'left')}
                onRotateRight={() => rotatePage(page.id, 'right')}
                onDelete={() => deletePage(page.id)}
                isDragging={draggedIndex === index}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


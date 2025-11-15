'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function PdfDeletePages() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pagesToDelete, setPagesToDelete] = useState<string>('');
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdfDoc.getPageCount());
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]?.type === 'application/pdf') {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      try {
        const arrayBuffer = await droppedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdfDoc.getPageCount());
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
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
    if (!file) return;
    if (!pagesToDelete.trim()) {
      alert('Please specify which pages to delete');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pagesToRemove = parsePageNumbers(pagesToDelete);
      if (pagesToRemove.length === 0) {
        alert('No valid pages to delete');
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
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-5xl mb-4">📄</div>
        <p className="text-slate-300">Drag and drop your PDF file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="bg-slate-900 rounded-xl p-4 space-y-4">
          <p className="text-slate-300">Selected: {file.name}</p>
          <p className="text-slate-400 text-sm">Total pages: {totalPages}</p>
          
          <div>
            <label className="block text-slate-300 mb-2">
              Pages to delete (e.g., 1,3,5 or 2-5):
            </label>
            <input
              type="text"
              value={pagesToDelete}
              onChange={(e) => setPagesToDelete(e.target.value)}
              placeholder="1,3,5 or 2-5"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-xs text-slate-400 mt-2">
              Enter page numbers separated by commas, or ranges like 2-5
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || !pagesToDelete.trim() || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Processing...' : 'Delete Pages'}
      </button>
    </div>
  );
}


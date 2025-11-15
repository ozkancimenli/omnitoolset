'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [method, setMethod] = useState<'all' | 'range' | 'custom'>('all');
  const [pageRange, setPageRange] = useState('');
  const [customPages, setCustomPages] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]?.type === 'application/pdf') {
      setFile(e.dataTransfer.files[0]);
    }
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
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const fileBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileBytes);
      const totalPages = sourcePdf.getPageCount();

      let pagesToExtract: number[][] = [];

      if (method === 'all') {
        pagesToExtract = Array.from({ length: totalPages }, (_, i) => [i]);
      } else if (method === 'range') {
        if (!pageRange) {
          alert('Please enter page range!');
          setIsProcessing(false);
          return;
        }
        const pages = parsePageRange(pageRange, totalPages);
        if (pages.length === 0) {
          alert('Invalid page range!');
          setIsProcessing(false);
          return;
        }
        pagesToExtract = pages.map(p => [p]);
      } else if (method === 'custom') {
        if (!customPages) {
          alert('Please enter page numbers!');
          setIsProcessing(false);
          return;
        }
        const pages = parsePageRange(customPages, totalPages);
        if (pages.length === 0) {
          alert('Invalid page numbers!');
          setIsProcessing(false);
          return;
        }
        pagesToExtract = pages.map(p => [p]);
      }

      // Create ZIP with all split PDFs
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const baseName = file.name.replace('.pdf', '');

      for (let i = 0; i < pagesToExtract.length; i++) {
        setProgress(((i + 1) / pagesToExtract.length) * 100);
        
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(sourcePdf, pagesToExtract[i]);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        zip.file(`${baseName}_page_${pagesToExtract[i][0] + 1}.pdf`, pdfBytes);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = baseName + '_split.zip';
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during splitting: ' + (error as Error).message);
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
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-300">Selected: {file.name}</p>
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">Split Method:</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="all"
              checked={method === 'all'}
              onChange={(e) => setMethod(e.target.value as 'all')}
            />
            <span className="text-slate-300">Split all pages into separate files</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="range"
              checked={method === 'range'}
              onChange={(e) => setMethod(e.target.value as 'range')}
            />
            <span className="text-slate-300">Specific page range</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="method"
              value="custom"
              checked={method === 'custom'}
              onChange={(e) => setMethod(e.target.value as 'custom')}
            />
            <span className="text-slate-300">Custom page numbers (e.g., 1,3,5-8)</span>
          </label>
        </div>
      </div>

      {method === 'range' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Page Range (e.g., 1-5):
          </label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="1-5"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
          />
        </div>
      )}

      {method === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Page Numbers:
          </label>
          <input
            type="text"
            value={customPages}
            onChange={(e) => setCustomPages(e.target.value)}
            placeholder="1,3,5-8,10"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
          />
        </div>
      )}

      {isProcessing && (
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Splitting...' : 'Split PDF'}
      </button>
    </div>
  );
}

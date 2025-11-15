'use client';

import { useState, useRef } from 'react';

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least 2 PDF files!');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Dynamic import for pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setProgress(((i + 1) / files.length) * 100);
        const fileBytes = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during merging: ' + (error as Error).message);
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
        <p className="text-slate-300">Drag and drop your PDF files here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 space-y-2">
          <h3 className="text-lg font-semibold mb-3">Selected Files ({files.length})</h3>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
              <span className="text-slate-300 text-sm">
                {index + 1}. {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-400 hover:text-red-300 px-3 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
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
        onClick={handleMerge}
        disabled={files.length < 2 || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Merging...' : 'Merge PDFs'}
      </button>
    </div>
  );
}

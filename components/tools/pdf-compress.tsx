'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(30);
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);
      
      setProgress(60);
      const pdfBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false
      });
      
      setProgress(90);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '') + '_compressed.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during compression: ' + (error as Error).message);
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
          <p className="text-slate-300">Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
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
        onClick={handleCompress}
        disabled={!file || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Compressing...' : 'Compress PDF'}
      </button>
    </div>
  );
}

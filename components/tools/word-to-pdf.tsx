'use client';

import { useState, useRef } from 'react';

export default function WordToPdf() {
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
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.docx') || file.type.includes('wordprocessingml'))) {
      setFile(file);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(30);
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      setProgress(50);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      setProgress(70);
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Simple text extraction
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const text = tempDiv.innerText || tempDiv.textContent || '';
      const lines = pdf.splitTextToSize(text, 180);
      
      let y = 20;
      for (let i = 0; i < lines.length; i++) {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(lines[i], 10, y);
        y += 7;
      }
      
      setProgress(100);
      pdf.save(file.name.replace('.docx', '') + '.pdf');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during conversion. Note: Complex formatting may not be preserved.');
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
        <p className="text-slate-300">Drag and drop your Word file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-300">Selected: {file.name}</p>
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
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Converting...' : 'Convert to PDF'}
      </button>

      <p className="text-sm text-slate-400 text-center">
        Note: Complex formatting (tables, images) may not be fully preserved.
      </p>
    </div>
  );
}

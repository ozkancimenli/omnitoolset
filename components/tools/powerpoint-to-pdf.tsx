'use client';

import { useState, useRef } from 'react';

export default function PowerpointToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.pptx') || file.type.includes('presentationml'))) {
      setFile(file);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      pdf.setFontSize(16);
      pdf.text('PowerPoint Conversion', 105, 50, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('File: ' + file.name, 105, 70, { align: 'center' });
      pdf.text('Note: PowerPoint files have complex structure.', 105, 90, { align: 'center' });
      pdf.text('Full conversion requires a backend service.', 105, 100, { align: 'center' });
      pdf.text('This is a simple example PDF file.', 105, 110, { align: 'center' });
      
      pdf.save(file.name.replace('.pptx', '') + '.pdf');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during conversion: ' + (error as Error).message);
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
        <p className="text-slate-300">Drag and drop your PowerPoint file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {file && (
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-300">Selected: {file.name}</p>
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
        Note: Full conversion of PowerPoint files requires a specialized backend service. This is a simple example PDF file.
      </p>
    </div>
  );
}

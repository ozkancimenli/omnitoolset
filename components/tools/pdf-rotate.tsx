'use client';

import { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function PdfRotate() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState<90 | 180 | 270>(90);
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

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotation));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_rotated.pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during rotation: ' + (error as Error).message);
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
          <p className="text-slate-300 mb-4">Selected: {file.name}</p>
          
          <div>
            <label className="block text-slate-300 mb-2">Rotation angle:</label>
            <div className="flex gap-3">
              {[90, 180, 270].map((angle) => (
                <button
                  key={angle}
                  onClick={() => setRotation(angle as 90 | 180 | 270)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    rotation === angle
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Rotating...' : 'Rotate PDF'}
      </button>
    </div>
  );
}


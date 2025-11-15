'use client';

import { useState, useRef } from 'react';

interface PdfToJpgProps {
  toolId?: string;
}

export default function PdfToJpg({ toolId }: PdfToJpgProps) {
  const isPNG = toolId === 'pdf-to-png';
  const format = isPNG ? 'PNG' : 'JPG';
  const mimeType = isPNG ? 'image/png' : 'image/jpeg';
  const fileExt = isPNG ? 'png' : 'jpg';
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setImages([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]?.type === 'application/pdf') {
      setFile(e.dataTransfer.files[0]);
      setImages([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setImages([]);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      // Use local worker from public folder or fallback to CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      // If public worker doesn't exist, use CDN
      try {
        const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
        if (!response.ok) throw new Error('Worker not found');
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const newImages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress((i / numPages) * 100);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context not available');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext as any).promise;
        
        const imgData = canvas.toDataURL(mimeType, 0.9);
        newImages.push(imgData);
      }

      setImages(newImages);
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during conversion: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (index: number) => {
    const img = images[index];
    const link = document.createElement('a');
    link.href = img;
    link.download = `${file?.name.replace('.pdf', '')}_page_${index + 1}.${fileExt}`;
    link.click();
  };

  const downloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    images.forEach((img, index) => {
      const base64Data = img.split(',')[1];
      zip.file(`${file?.name.replace('.pdf', '')}_page_${index + 1}.${fileExt}`, base64Data, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name.replace('.pdf', '') + '_images.zip';
    a.click();
    URL.revokeObjectURL(url);
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
        {isProcessing ? 'Converting...' : `Convert to ${format}`}
      </button>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <div key={index} className="text-center">
                <img
                  src={img}
                  alt={`Page ${index + 1}`}
                  className="w-full rounded-lg border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => downloadImage(index)}
                />
                <p className="text-sm text-slate-400 mt-2">Page {index + 1}</p>
              </div>
            ))}
          </div>
          <button onClick={downloadAll} className="btn w-full">
            Download All as ZIP
          </button>
        </div>
      )}
    </div>
  );
}

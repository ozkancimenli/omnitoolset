'use client';

import { useState, useRef } from 'react';

export default function TxtToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setText(event.target?.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/plain' || droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          setText(event.target?.result as string);
        };
        reader.readAsText(droppedFile);
      }
    }
  };

  const handleConvert = async () => {
    if (!text.trim()) {
      alert('Please enter or upload text content');
      return;
    }

    setIsProcessing(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      const lines = pdf.splitTextToSize(text, 180);
      const pageHeight = pdf.internal.pageSize.getHeight();
      const lineHeight = 7;
      let y = 20;
      
      lines.forEach((line: string) => {
        if (y + lineHeight > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 15, y);
        y += lineHeight;
      });

      pdf.save(file ? file.name.replace('.txt', '.pdf') : 'document.pdf');
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
        <p className="text-slate-300">Drag and drop your TXT file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Or paste text directly:</label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="w-full h-64 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      {file && (
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-slate-300">Selected: {file.name}</p>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!text.trim() || isProcessing}
        className="btn w-full"
      >
        {isProcessing ? 'Converting...' : 'Convert to PDF'}
      </button>
    </div>
  );
}


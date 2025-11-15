'use client';

import { useState, useRef } from 'react';

export default function ExcelToPdf() {
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
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setFile(file);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(30);
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      setProgress(50);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      setProgress(70);
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('landscape');
      
      const fontSize = 8;
      pdf.setFontSize(fontSize);
      
      let y = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxWidth = pageWidth - 2 * margin;
      const numCols = jsonData[0] ? (jsonData[0] as any[]).length : 0;
      const colWidth = numCols > 0 ? maxWidth / numCols : maxWidth;
      
      for (let row = 0; row < jsonData.length; row++) {
        if (y > pageHeight - 20) {
          pdf.addPage('landscape');
          y = 20;
        }
        
        const rowData = jsonData[row] as any[];
        let x = margin;
        
        for (let col = 0; col < numCols; col++) {
          const cellValue = rowData[col] !== undefined ? String(rowData[col]) : '';
          const text = pdf.splitTextToSize(cellValue, colWidth - 2);
          pdf.text(text, x, y);
          x += colWidth;
        }
        
        y += fontSize + 2;
      }
      
      setProgress(100);
      pdf.save(file.name.replace(/\.(xlsx|xls)$/, '') + '.pdf');
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
        <p className="text-slate-300">Drag and drop your Excel file here or click to select</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
    </div>
  );
}

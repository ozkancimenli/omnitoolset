'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls') && !selectedFile.type.includes('spreadsheetml')) {
      toast.error('Please select an Excel file (.xlsx or .xls)');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select an Excel file first');
      return;
    }

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
      toast.success('Excel converted to PDF!');
    } catch (error) {
      toast.error('Error converting Excel: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setProgress(0);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Excel to PDF Converter"
      description="Convert Excel spreadsheets to PDF"
      icon="📄"
      helpText="Convert Excel (.xlsx, .xls) files to PDF format. Converts the first sheet to a landscape PDF with table layout."
      tips={[
        'Upload Excel file (.xlsx or .xls)',
        'Converts first sheet',
        'Landscape orientation',
        'Table layout preserved',
        'Download as PDF'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
            acceptedExtensions={['.xlsx', '.xls']}
            icon="📄"
            text="Drag and drop your Excel file here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Converting...' : 'Convert to PDF'}
        </button>
      </div>
    </ToolBase>
  );
}

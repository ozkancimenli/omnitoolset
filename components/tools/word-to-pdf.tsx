'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.docx') && !selectedFile.type.includes('wordprocessingml')) {
      toast.error('Please select a Word (.docx) file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a Word file first');
      return;
    }

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
      toast.success('Word document converted to PDF!');
    } catch (error) {
      toast.error('Error converting document: ' + (error as Error).message);
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
      title="Word to PDF Converter"
      description="Convert Word documents to PDF"
      icon="📄"
      helpText="Convert Word (.docx) documents to PDF format. Extracts text content and converts to PDF. Note: Complex formatting (tables, images) may not be fully preserved."
      tips={[
        'Upload Word (.docx) file',
        'Extracts text content',
        'Converts to PDF',
        'Basic formatting preserved',
        'Complex elements may be simplified'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            acceptedExtensions={['.docx']}
            icon="📄"
            text="Drag and drop your Word file here or click to select"
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

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠ Note: Complex formatting (tables, images) may not be fully preserved. Text content is extracted and converted to PDF.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}

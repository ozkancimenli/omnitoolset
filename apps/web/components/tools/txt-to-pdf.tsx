'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function TxtToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'text/plain' && !selectedFile.name.endsWith('.txt')) {
      toast.error('Please select a TXT file');
      return;
    }
    
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target?.result as string);
      toast.success(`File loaded: ${selectedFile.name}`);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(selectedFile);
  };

  const handleConvert = async () => {
    if (!text.trim()) {
      toast.warning('Please enter or upload text content');
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
      toast.success('PDF created successfully!');
    } catch (error) {
      toast.error('Error creating PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setText('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="TXT to PDF Converter"
      description="Convert text files to PDF documents"
      icon="📄"
      helpText="Convert TXT files or paste text directly to PDF format. Automatically handles page breaks and formatting."
      tips={[
        'Upload TXT file or paste text',
        'Automatic page breaks',
        'Preserves text formatting',
        'Download as PDF',
        'Supports large text files'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['text/plain']}
            acceptedExtensions={['.txt']}
            icon="📄"
            text="Drag and drop your TXT file here or click to select"
          />
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Or paste text directly:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {text.length} characters
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-64 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleConvert}
            disabled={!text.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isProcessing ? 'Converting...' : 'Convert to PDF'}
          </button>
          <button
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </ToolBase>
  );
}


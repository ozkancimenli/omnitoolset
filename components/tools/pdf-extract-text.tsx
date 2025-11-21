'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfExtractText() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    setFile(selectedFile);
    setExtractedText('');
  };

  const handleExtract = async () => {
    if (!file) {
      toast.warning('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setExtractedText('');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      try {
        const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
        if (!response.ok) throw new Error('Worker not found');
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `\n--- Page ${i} ---\n${pageText}\n`;
      }

      setExtractedText(fullText.trim());
      toast.success(`Text extracted from ${numPages} page${numPages !== 1 ? 's' : ''}!`);
    } catch (error) {
      toast.error('Error extracting text: ' + (error as Error).message);
      setExtractedText('');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    if (!extractedText.trim()) {
      toast.warning('No text to download');
      return;
    }
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name.replace('.pdf', '.txt') || 'extracted_text.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Text downloaded!');
  };

  const copyText = () => {
    if (!extractedText.trim()) {
      toast.warning('No text to copy');
      return;
    }
    navigator.clipboard.writeText(extractedText);
    toast.success('Text copied to clipboard!');
  };

  const clear = () => {
    setFile(null);
    setExtractedText('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PDF Text Extractor"
      description="Extract text content from PDF files"
      icon="📄"
      helpText="Extract all text content from a PDF file. Preserves page structure and allows you to copy or download the extracted text."
      tips={[
        'Upload any PDF file',
        'Extracts text from all pages',
        'Preserves page structure',
        'Download as TXT file',
        'Copy to clipboard'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/pdf']}
            acceptedExtensions={['.pdf']}
            icon="📄"
            text="Drag and drop your PDF file here or click to select"
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
          onClick={handleExtract}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Extracting...' : 'Extract Text'}
        </button>

        {extractedText && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Extracted Text:</h3>
              <div className="flex gap-2">
                <button 
                  onClick={copyText}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Copy
                </button>
                <button 
                  onClick={downloadText}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Download TXT
                </button>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={extractedText}
                readOnly
                rows={20}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 resize-none font-mono text-sm focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


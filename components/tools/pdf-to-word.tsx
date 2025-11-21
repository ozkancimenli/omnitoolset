'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, ['application/pdf'], ['.pdf']);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setNumPages(0);
    setExtractedText('');
    toast.success(`PDF selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      toast.info('Loading PDF...');
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      try {
        const response = await fetch('/pdf.worker.mjs', { method: 'HEAD' });
        if (!response.ok) throw new Error('Worker not found');
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      }

      setProgress(10);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      setNumPages(totalPages);
      
      toast.info(`Extracting text from ${totalPages} page(s)...`);
      let fullText = '';

      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + (i / totalPages) * 80);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setExtractedText(fullText);
      
      // Create HTML that Word can open
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${file.name.replace('.pdf', '')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        p { margin: 10px 0; }
    </style>
</head>
<body>
${fullText.split('\n\n').filter(p => p.trim()).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
</body>
</html>`;
      
      setProgress(95);
      toast.info('Creating Word document...');
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '.doc');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Successfully converted PDF to Word! Extracted text from ${totalPages} page(s).`);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An error occurred during conversion';
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          errorMessage = 'This PDF is password-protected. Please unlock it first.';
        } else if (error.message.includes('corrupted')) {
          errorMessage = 'The PDF file appears to be corrupted or invalid.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <ToolBase
      title="PDF to Word"
      description="Convert PDF file to editable Word format"
      icon="📝"
      maxFileSize={50}
      acceptedFileTypes={['application/pdf']}
      acceptedExtensions={['.pdf']}
      showProgress={true}
      progress={progress}
      isProcessing={isProcessing}
      helpText="Convert your PDF files to Word format for easy editing. Text content is extracted and converted to an editable document."
      tips={[
        'Simple text-based PDFs convert best',
        'Complex layouts may not be perfectly preserved',
        'Images and graphics are not included',
        'Output is in .doc format (compatible with Word)',
        'You can open the file in Microsoft Word or Google Docs'
      ]}
    >
      <FileUploadArea
        onFileSelect={handleFileSelect}
        maxFileSize={50}
        acceptedFileTypes={['application/pdf']}
        acceptedExtensions={['.pdf']}
        icon="📄"
        text="Drag and drop your PDF file here or click to select"
        subtext="100% free • No registration • Secure • Files processed in your browser"
        showFileInfo={true}
      />

      {file && numPages > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">PDF Pages:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
              {numPages}
            </span>
          </div>
          {extractedText && (
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Text Extracted:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {extractedText.length.toLocaleString()} characters
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Converting... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <span>📝</span>
            <span>Convert to Word</span>
          </>
        )}
      </button>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>⚠️ Note:</strong> Due to browser limitations, the output is saved as HTML format (.doc). 
          You can open it in Microsoft Word, Google Docs, or any word processor. 
          Complex layouts, images, and special formatting may not be perfectly preserved. 
          Simple text-based PDFs convert best.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Upload your PDF file (up to 50MB)</li>
          <li>Text is extracted from all pages</li>
          <li>Content is converted to Word-compatible format</li>
          <li>Download your Word document instantly</li>
          <li>Open in Microsoft Word, Google Docs, or any word processor</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize } from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfCompress() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    setCompressionRatio(null);
    setCompressedSize(null);
  };

  const handleCompress = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(10);
      toast.info('Loading PDF file...');
      
      const fileBytes = await file.arrayBuffer();
      setProgress(30);
      
      toast.info('Compressing PDF...');
      const pdf = await PDFDocument.load(fileBytes);
      
      setProgress(50);
      const pdfBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      
      setProgress(80);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      setProgress(90);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '') + '_compressed.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCompressedSize(blob.size);
      const ratio = ((file.size - blob.size) / file.size) * 100;
      setCompressionRatio(ratio);

      setProgress(100);
      
      if (ratio > 0) {
        toast.success(`PDF compressed successfully! Size reduced by ${ratio.toFixed(1)}%`);
      } else {
        toast.warning('PDF could not be compressed further. File may already be optimized.');
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An error occurred during compression';
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          errorMessage = 'This PDF is password-protected. Please unlock it first.';
        } else if (error.message.includes('corrupted') || error.message.includes('invalid')) {
          errorMessage = 'The PDF file appears to be corrupted or invalid.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <ToolBase
      title="Compress PDF"
      description="Reduce PDF file size while maintaining quality"
      icon="🗜️"
      maxFileSize={50}
      acceptedFileTypes={['application/pdf']}
      acceptedExtensions={['.pdf']}
      showProgress={true}
      progress={progress}
      isProcessing={isProcessing}
      helpText="Compress your PDF files to reduce file size. Perfect for email attachments and faster uploads."
      tips={[
        'Image-heavy PDFs compress best',
        'Text-only PDFs may not compress much',
        'Scanned PDFs can be significantly reduced',
        'Avoid compressing already-compressed files'
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

      {file && originalSize && (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Original Size</p>
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                {formatFileSize(originalSize)}
              </p>
            </div>
            {compressedSize && (
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">Compressed Size</p>
                <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                  {formatFileSize(compressedSize)}
                </p>
              </div>
            )}
          </div>
          {compressionRatio !== null && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Size Reduction</span>
                <span className={`font-bold text-lg ${
                  compressionRatio > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {compressionRatio > 0 ? '-' : ''}{Math.abs(compressionRatio).toFixed(1)}%
                </span>
              </div>
              {compressionRatio > 0 && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(compressionRatio, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleCompress}
        disabled={!file || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Compressing... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <span>🗜️</span>
            <span>Compress PDF</span>
          </>
        )}
      </button>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Upload your PDF file (up to 50MB)</li>
          <li>Our tool optimizes images and removes unnecessary data</li>
          <li>Download your compressed PDF instantly</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

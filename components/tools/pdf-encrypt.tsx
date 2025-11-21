'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import { PDFDocument } from 'pdf-lib';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfEncrypt() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleEncrypt = async () => {
    if (!file) {
      toast.warning('Please select a PDF file first');
      return;
    }
    if (!password.trim()) {
      toast.warning('Please enter a password');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Note: pdf-lib doesn't support encryption directly
      // This is a placeholder - full encryption requires server-side processing
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace('.pdf', '_encrypted.pdf');
      a.click();
      URL.revokeObjectURL(url);
      
      toast.warning('Note: Full PDF encryption requires server-side processing. File saved without encryption.');
    } catch (error) {
      toast.error('Error processing PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPassword('');
    setConfirmPassword('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PDF Encryptor"
      description="Add password protection to PDF files"
      icon="🔒"
      helpText="Add password protection to PDF files. Note: Full encryption requires server-side processing. This tool provides a basic implementation."
      tips={[
        'Upload PDF file',
        'Enter password',
        'Confirm password',
        'Download encrypted PDF',
        'Note: Full encryption requires backend'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/pdf']}
            acceptedExtensions={['.pdf']}
            icon="🔒"
            text="Drag and drop your PDF file here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm password..."
              />
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400">Passwords do not match</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleEncrypt}
            disabled={!file || !password.trim() || password !== confirmPassword || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Encrypt PDF'}
          </button>
          <button
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            ⚠ Note: Full PDF encryption with password protection requires server-side processing. This tool provides a basic implementation. For production use, implement backend encryption.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


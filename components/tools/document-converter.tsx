'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function DocumentConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt'>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    const documentExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt'];
    const isDocument = documentExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    
    if (!isDocument) {
      toast.error('Please select a document file (PDF, Word, Excel, PowerPoint, TXT)');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a document file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Document conversion requires server-side processing
      toast.info('Document conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API
      // Requires: LibreOffice, Pandoc, or similar tools
      toast.warning('Full document conversion requires backend service with LibreOffice or Pandoc.');
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

  const getSupportedFormats = () => {
    if (!file) return [];
    const ext = file.name.toLowerCase().split('.').pop();
    if (['pdf', 'docx', 'doc'].includes(ext || '')) {
      return ['pdf', 'docx', 'txt'];
    } else if (['xlsx', 'xls'].includes(ext || '')) {
      return ['pdf', 'xlsx', 'txt'];
    } else if (['pptx', 'ppt'].includes(ext || '')) {
      return ['pdf', 'pptx', 'txt'];
    } else if (ext === 'txt') {
      return ['pdf', 'docx', 'txt'];
    }
    return ['pdf', 'docx', 'xlsx', 'pptx', 'txt'];
  };

  const supportedFormats = getSupportedFormats();

  return (
    <ToolBase
      title="Document Converter"
      description="Convert between various document formats"
      icon="📄"
      helpText="Convert between various document formats (PDF, Word, Excel, PowerPoint, TXT). Note: Document conversion requires server-side processing. For production use, implement a backend service using LibreOffice, Pandoc, or similar tools."
      tips={[
        'Upload document file',
        'Select output format',
        'Requires server-side processing',
        'Backend service needed',
        'Supports multiple formats'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain']}
            acceptedExtensions={['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.txt']}
            icon="📄"
            text="Drag and drop your document file here or click to select"
          />
        )}

        {file && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700 dark:text-gray-300">Selected: <span className="font-semibold">{file.name}</span></p>
              <button
                onClick={clear}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Format:
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt')}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {supportedFormats.map(format => (
                  <option key={format} value={format}>{format.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          onClick={handleConvert}
          disabled={!file || isProcessing}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {isProcessing ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> Document conversion requires server-side processing. For production use, implement a backend service using LibreOffice, Pandoc, or similar tools.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


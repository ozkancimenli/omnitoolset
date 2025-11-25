'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PowerpointToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.pptx') && !selectedFile.type.includes('presentationml')) {
      toast.error('Please select a PowerPoint (.pptx) file');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select a PowerPoint file first');
      return;
    }

    setIsProcessing(true);

    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      pdf.setFontSize(16);
      pdf.text('PowerPoint Conversion', 105, 50, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('File: ' + file.name, 105, 70, { align: 'center' });
      pdf.text('Note: PowerPoint files have complex structure.', 105, 90, { align: 'center' });
      pdf.text('Full conversion requires a backend service.', 105, 100, { align: 'center' });
      pdf.text('This is a simple example PDF file.', 105, 110, { align: 'center' });
      
      pdf.save(file.name.replace('.pptx', '') + '.pdf');
      toast.warning('Note: Full PowerPoint conversion requires backend service. Simple PDF created.');
    } catch (error) {
      toast.error('Error creating PDF: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFile(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PowerPoint to PDF Converter"
      description="Convert PowerPoint presentations to PDF"
      icon="📄"
      helpText="Convert PowerPoint (.pptx) files to PDF format. Note: Full conversion with all slides and formatting requires a specialized backend service. This tool creates a basic PDF."
      tips={[
        'Upload PowerPoint (.pptx) file',
        'Creates basic PDF',
        'Full conversion requires backend',
        'Complex structure preserved on backend',
        'Simple PDF generated'
      ]}
      isProcessing={isProcessing}
    >
      <div className="space-y-4">
        {!isProcessing && (
          <FileUploadArea
            onFileSelect={handleFileSelect}
            acceptedFileTypes={['application/vnd.openxmlformats-officedocument.presentationml.presentation']}
            acceptedExtensions={['.pptx']}
            icon="📄"
            text="Drag and drop your PowerPoint file here or click to select"
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
            ⚠ Note: Full conversion of PowerPoint files with all slides and formatting requires a specialized backend service. This tool creates a basic PDF file.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}

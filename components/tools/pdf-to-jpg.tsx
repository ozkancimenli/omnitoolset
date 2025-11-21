'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

interface PdfToJpgProps {
  toolId?: string;
}

export default function PdfToJpg({ toolId }: PdfToJpgProps) {
  const isPNG = toolId === 'pdf-to-png';
  const format = isPNG ? 'PNG' : 'JPG';
  const mimeType = isPNG ? 'image/png' : 'image/jpeg';
  const fileExt = isPNG ? 'png' : 'jpg';
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [numPages, setNumPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, ['application/pdf'], ['.pdf']);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setFile(selectedFile);
    setImages([]);
    setNumPages(0);
    toast.success(`PDF selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setImages([]);

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
      
      toast.info(`Converting ${totalPages} page(s) to ${format}...`);
      const newImages: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setProgress(10 + (i / totalPages) * 85);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context not available');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext as any).promise;
        
        const imgData = canvas.toDataURL(mimeType, 0.9);
        newImages.push(imgData);
      }

      setImages(newImages);
      setProgress(100);
      toast.success(`Successfully converted ${totalPages} page(s) to ${format}!`);
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

  const downloadImage = (index: number) => {
    const img = images[index];
    const link = document.createElement('a');
    link.href = img;
    link.download = `${file?.name.replace('.pdf', '')}_page_${index + 1}.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded page ${index + 1}`);
  };

  const downloadAll = async () => {
    if (images.length === 0) {
      toast.error('No images to download');
      return;
    }

    toast.info('Creating ZIP file...');
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    images.forEach((img, index) => {
      const base64Data = img.split(',')[1];
      zip.file(`${file?.name.replace('.pdf', '')}_page_${index + 1}.${fileExt}`, base64Data, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file?.name.replace('.pdf', '') + '_images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${images.length} image(s) as ZIP!`);
  };

  return (
    <ToolBase
      title={`PDF to ${format}`}
      description={`Convert PDF pages to ${format} images`}
      icon="🖼️"
      maxFileSize={50}
      acceptedFileTypes={['application/pdf']}
      acceptedExtensions={['.pdf']}
      showProgress={true}
      progress={progress}
      isProcessing={isProcessing}
      helpText={`Convert your PDF pages to ${format} images. Each page becomes a separate image file. Download individually or as a ZIP archive.`}
      tips={[
        'Each PDF page becomes a separate image',
        'High quality conversion (2x scale)',
        'Click on any image to download it',
        'Use "Download All" to get all images as ZIP',
        'Perfect for extracting pages as images'
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
            <span>🖼️</span>
            <span>Convert to {format}</span>
          </>
        )}
      </button>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-800 dark:text-green-200 font-medium">
                ✓ {images.length} image{images.length > 1 ? 's' : ''} ready
              </span>
              <button
                onClick={downloadAll}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                📦 Download All as ZIP
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 hover:shadow-lg transition-shadow">
                <img
                  src={img}
                  alt={`Page ${index + 1}`}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors mb-2"
                  onClick={() => downloadImage(index)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Page {index + 1}</p>
                <button
                  onClick={() => downloadImage(index)}
                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Upload your PDF file (up to 50MB)</li>
          <li>Each page is converted to a {format} image</li>
          <li>Click on any image to download it individually</li>
          <li>Use "Download All" to get all images as a ZIP file</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

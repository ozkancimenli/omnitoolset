'use client';

import { useState, useRef } from 'react';
import { loadPdf, mergePdfs, exportPdf, releasePdf } from '@omni/pdf-engine';
import { toast } from '@/components/Toast';
import ToolBase, { formatFileSize, validateFile } from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateFile(selectedFile, 50, ['application/pdf'], ['.pdf']);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Check if file already exists
    if (files.some(f => f.name === selectedFile.name && f.size === selectedFile.size)) {
      toast.warning('This file is already added');
      return;
    }

    setFiles(prev => [...prev, selectedFile]);
    toast.success(`Added: ${selectedFile.name}`);
  };

  const handleMultipleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => handleFileSelect(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(file => handleFileSelect(file));
  };

  const removeFile = (index: number) => {
    const removedFile = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.info(`Removed: ${removedFile.name}`);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const newFiles = [...files];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    let mergedDoc: Awaited<ReturnType<typeof mergePdfs>> | null = null;
    const loadedDocs: Awaited<ReturnType<typeof loadPdf>>[] = [];

    try {
      toast.info('Loading PDF files...');
      let pageCount = 0;

      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        setProgress(((i + 1) / (files.length + 3)) * 60);
        toast.info(`Processing ${currentFile.name}`);

        try {
          const fileBytes = await currentFile.arrayBuffer();
          const doc = await loadPdf(fileBytes, { sourceName: currentFile.name });
          loadedDocs.push(doc);
          pageCount += doc.pages.length;
        } catch (loadError) {
          console.error(`Error processing ${currentFile.name}:`, loadError);
          toast.error(`Failed to process ${currentFile.name}. Skipping...`);
        }
      }

      if (!loadedDocs.length) {
        throw new Error('Unable to load any of the selected PDFs');
      }

      setProgress(80);
      toast.info('Creating merged PDF...');
      mergedDoc = await mergePdfs(loadedDocs);
      setTotalPages(pageCount);

      const exported = await exportPdf(mergedDoc, { asBlob: true });
      const blob = exported instanceof Blob
        ? exported
        : new Blob([exported], { type: 'application/pdf' });

      setProgress(95);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = files.length === 1
        ? files[0].name.replace('.pdf', '_merged.pdf')
        : 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Successfully merged ${files.length} PDF files into ${pageCount} pages!`);
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'An error occurred during merging';
      
      if (error instanceof Error) {
        if (error.message.includes('password') || error.message.includes('encrypted')) {
          errorMessage = 'One or more PDFs are password-protected. Please unlock them first.';
        } else if (error.message.includes('corrupted')) {
          errorMessage = 'One or more PDFs appear to be corrupted.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      loadedDocs.forEach((doc) => releasePdf(doc));
      if (mergedDoc) {
        releasePdf(mergedDoc);
      }
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <ToolBase
      title="Merge PDF"
      description="Combine multiple PDF files into one document"
      icon="📄"
      maxFileSize={50}
      acceptedFileTypes={['application/pdf']}
      acceptedExtensions={['.pdf']}
      showProgress={true}
      progress={progress}
      isProcessing={isProcessing}
      helpText="Merge multiple PDF files into a single document. Arrange files in the order you want them to appear."
      tips={[
        'You can merge 2 or more PDF files',
        'Files are merged in the order shown below',
        'Drag files to reorder them',
        'All pages from all files will be combined'
      ]}
    >
      <FileUploadArea
        onFileSelect={handleFileSelect}
        maxFileSize={50}
        acceptedFileTypes={['application/pdf']}
        acceptedExtensions={['.pdf']}
        multiple={true}
        icon="📄"
        text="Drag and drop PDF files here or click to select multiple files"
        subtext="100% free • No registration • Secure • Files processed in your browser"
        showFileInfo={false}
      />

      {/* Multiple file input for selecting multiple at once */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        onChange={handleMultipleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
      >
        + Add More PDF Files
      </button>

      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Files ({files.length})
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total: {formatFileSize(totalSize)}
              {totalPages > 0 && ` • ${totalPages} pages`}
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveFile(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveFile(index, 'down')}
                    disabled={index === files.length - 1}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    aria-label="Remove file"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleMerge}
        disabled={files.length < 2 || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Merging... {Math.round(progress)}%</span>
          </>
        ) : (
          <>
            <span>📄</span>
            <span>Merge {files.length > 0 ? `${files.length} PDF${files.length > 1 ? 's' : ''}` : 'PDFs'}</span>
          </>
        )}
      </button>

      {files.length < 2 && files.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Please add at least one more PDF file to merge
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How it works</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Select multiple PDF files (2 or more)</li>
          <li>Arrange files in the desired order using up/down arrows</li>
          <li>Click "Merge PDFs" to combine all files</li>
          <li>Download your merged PDF instantly</li>
          <li>All processing happens in your browser - your files never leave your device</li>
        </ol>
      </div>
    </ToolBase>
  );
}

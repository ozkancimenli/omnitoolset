'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';
import FileUploadArea from './FileUploadArea';

export default function ArchiveConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'zip' | 'rar' | '7z' | 'tar' | 'gz'>('zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz'];
    const isArchive = archiveExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
    
    if (!isArchive) {
      toast.error('Please select an archive file (ZIP, RAR, 7Z, TAR, GZ, etc.)');
      return;
    }
    setFile(selectedFile);
    toast.success(`File selected: ${selectedFile.name}`);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.warning('Please select an archive file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Note: Archive conversion requires server-side processing
      toast.info('Archive conversion requires server-side processing. This is a basic implementation.');
      
      // Placeholder: In production, this would call a backend API
      // Requires: unzip/unrar/7z/tar tools, then recompress
      toast.warning('Full archive conversion requires backend service with archive tools.');
    } catch (error) {
      toast.error('Error converting archive: ' + (error as Error).message);
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
      title="Archive Converter"
      description="Convert between archive formats"
      icon="📦"
      helpText="Convert between archive formats (ZIP, RAR, 7Z, TAR, GZ, etc.). Note: Archive conversion requires server-side processing. For production use, implement a backend service using appropriate archive tools."
      tips={[
        'Upload archive file',
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
            acceptedFileTypes={['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip']}
            acceptedExtensions={['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz']}
            icon="📦"
            text="Drag and drop your archive file here or click to select"
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
                onChange={(e) => setOutputFormat(e.target.value as 'zip' | 'rar' | '7z' | 'tar' | 'gz')}
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zip">ZIP</option>
                <option value="rar">RAR</option>
                <option value="7z">7Z</option>
                <option value="tar">TAR</option>
                <option value="gz">GZ</option>
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
            ⚠ <strong>Note:</strong> Archive conversion requires server-side processing. For production use, implement a backend service using appropriate archive tools.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


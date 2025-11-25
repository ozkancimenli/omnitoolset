'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA1' | 'SHA256' | 'SHA512'>('SHA256');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const generateHash = async () => {
    if (!input.trim()) {
      toast.error('Please enter text to hash');
      return;
    }

    setIsProcessing(true);
    toast.info('Generating hash...');

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      let hashBuffer: ArrayBuffer;

      switch (algorithm) {
        case 'SHA1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data);
          break;
        case 'SHA256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
          break;
        case 'SHA512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data);
          break;
        default:
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
      toast.success('Hash generated successfully!');
    } catch (error) {
      toast.error('An error occurred during hashing: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!output.trim()) {
      toast.warning('No hash to copy!');
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success('Hash copied to clipboard!');
  };

  const clear = () => {
    setInput('');
    setOutput('');
    toast.info('Cleared');
  };

  const hashLengths: Record<string, number> = {
    'SHA1': 40,
    'SHA256': 64,
    'SHA512': 128,
  };

  return (
    <ToolBase
      title="Hash Generator"
      description="Generate cryptographic hashes for text using SHA algorithms"
      icon="🔒"
      isProcessing={isProcessing}
      helpText="Generate cryptographic hashes for your text using SHA algorithms. Hashes are one-way functions perfect for password storage, data integrity, and security."
      tips={[
        'SHA-256: Most common, 256-bit hash (64 hex chars)',
        'SHA-1: Older algorithm, 160-bit hash (40 hex chars)',
        'SHA-512: Strongest, 512-bit hash (128 hex chars)',
        'Hashes are one-way - cannot be reversed',
        'Same input always produces same hash'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hash Algorithm:
          </label>
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value as 'SHA1' | 'SHA256' | 'SHA512');
              setOutput('');
            }}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SHA256">SHA-256 (Recommended)</option>
            <option value="SHA1">SHA-1 (Legacy)</option>
            <option value="SHA512">SHA-512 (Strongest)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Output length: {hashLengths[algorithm]} characters
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text to hash:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text to generate hash..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={generateHash} 
            disabled={!input || isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Hashing...</span>
              </>
            ) : (
              <>
                <span>🔒</span>
                <span>Generate Hash</span>
              </>
            )}
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {output && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-green-900 dark:text-green-200">
                  Hash Result ({algorithm}):
                </label>
                <span className="text-xs text-green-700 dark:text-green-300">
                  {output.length} chars
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={output}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-lg 
                           text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
                <button 
                  onClick={copyToClipboard} 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

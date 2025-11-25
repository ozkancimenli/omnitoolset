'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function UrlDecode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const decode = () => {
    if (!input.trim()) {
      toast.warning('Please enter URL encoded text first');
      return;
    }

    try {
      const decoded = decodeURIComponent(input.trim());
      setOutput(decoded);
      toast.success('URL decoded successfully!');
    } catch (error) {
      toast.error('Invalid URL encoded format! Please check your input.');
      setOutput('');
    }
  };

  const encode = () => {
    if (!output.trim()) {
      toast.warning('No decoded text to encode');
      return;
    }

    try {
      const encoded = encodeURIComponent(output);
      setInput(encoded);
      setOutput('');
      toast.success('Text encoded successfully!');
    } catch (error) {
      toast.error('An error occurred during encoding!');
    }
  };

  const copyToClipboard = () => {
    if (!output.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setInput('');
    setOutput('');
    toast.info('Cleared');
  };

  const stats = {
    inputLength: input.length,
    outputLength: output.length,
    ratio: input.length > 0 && output.length > 0 ? ((output.length / input.length) * 100).toFixed(1) : 0,
  };

  return (
    <ToolBase
      title="URL Decoder"
      description="Decode URL encoded text back to original format"
      icon="🔓"
      helpText="Decode URL encoded text back to its original format. Perfect for decoding URLs, query parameters, and web addresses."
      tips={[
        'Paste URL encoded text to decode',
        'URL decoding reduces text size',
        'Use URL Encode to reverse the process',
        'Commonly used for query parameters and URLs',
        'All processing happens in your browser'
      ]}
    >
      <div className="space-y-4">
        {stats.inputLength > 0 && stats.outputLength > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Input</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.inputLength.toLocaleString()} chars</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Output</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.outputLength.toLocaleString()} chars</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Size Ratio</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.ratio}%</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter URL encoded text:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.trim()) {
                try {
                  setOutput(decodeURIComponent(e.target.value.trim()));
                } catch {
                  setOutput('');
                }
              } else {
                setOutput('');
              }
            }}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter URL encoded text to decode..."
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={decode} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Decode
          </button>
          <button 
            onClick={encode}
            disabled={!output}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Encode
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Decoded Result:
            </label>
            {output && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100"
            placeholder="Decoded text will appear here..."
          />
        </div>

        <button 
          onClick={copyToClipboard} 
          disabled={!output}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Copy Result
        </button>
      </div>
    </ToolBase>
  );
}

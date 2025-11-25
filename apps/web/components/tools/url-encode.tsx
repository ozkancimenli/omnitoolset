'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function UrlEncode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encode = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    try {
      const encoded = encodeURIComponent(input);
      setOutput(encoded);
      toast.success('Text encoded successfully!');
    } catch (error) {
      toast.error('An error occurred during encoding!');
    }
  };

  const decode = () => {
    if (!output.trim()) {
      toast.warning('No encoded text to decode');
      return;
    }

    try {
      const decoded = decodeURIComponent(output);
      setInput(decoded);
      setOutput('');
      toast.success('Text decoded successfully!');
    } catch (error) {
      toast.error('Invalid encoded text!');
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
    ratio: input.length > 0 ? ((output.length / input.length) * 100).toFixed(1) : 0,
  };

  return (
    <ToolBase
      title="URL Encoder / Decoder"
      description="Encode or decode text for use in URLs"
      icon="🔗"
      helpText="Encode text for safe use in URLs, or decode URL-encoded text. Perfect for handling special characters in URLs, query parameters, and web addresses."
      tips={[
        'URL encoding converts special characters to %XX format',
        'Spaces become %20, & becomes %26, etc.',
        'Useful for query parameters and URLs',
        'Decode to reverse the encoding process',
        'All processing happens in your browser'
      ]}
    >
      <div className="space-y-4">
        {stats.inputLength > 0 && (
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
              Enter text to encode:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value) {
                try {
                  setOutput(encodeURIComponent(e.target.value));
                } catch {
                  setOutput('');
                }
              } else {
                setOutput('');
              }
            }}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text to URL encode..."
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={encode} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Encode
          </button>
          <button 
            onClick={decode}
            disabled={!output}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Decode
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
              Encoded Result:
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
                     text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Encoded URL text will appear here..."
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

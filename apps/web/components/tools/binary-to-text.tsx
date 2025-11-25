'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function BinaryToText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter binary code first');
      return;
    }

    try {
      const binary = input.replace(/\s/g, '');
      
      if (!/^[01]+$/.test(binary)) {
        toast.error('Invalid binary input. Only 0s and 1s are allowed.');
        setOutput('');
        return;
      }

      if (binary.length % 8 !== 0) {
        toast.warning('Binary length is not a multiple of 8. Padding with zeros...');
      }
      
      const paddedBinary = binary.padEnd(Math.ceil(binary.length / 8) * 8, '0');
      const text = paddedBinary
        .match(/.{1,8}/g)
        ?.map(byte => String.fromCharCode(parseInt(byte, 2)))
        .join('') || '';
      
      setOutput(text);
      toast.success('Binary converted to text!');
    } catch (error) {
      toast.error('Error converting binary to text: ' + (error as Error).message);
      setOutput('');
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

  const binaryLength = input.replace(/\s/g, '').length;
  const bytes = Math.ceil(binaryLength / 8);
  const isValid = /^[01\s]+$/.test(input);

  return (
    <ToolBase
      title="Binary to Text Converter"
      description="Convert binary code back to text (ASCII)"
      icon="🔤"
      helpText="Convert binary code back to readable text using ASCII decoding. Each 8-bit sequence represents one character."
      tips={[
        'Each 8 bits = 1 character',
        'Spaces are automatically ignored',
        'Invalid characters will show an error',
        'Use Text to Binary to reverse',
        'All processing happens in your browser'
      ]}
    >
      <div className="space-y-4">
        {input.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Bits</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{binaryLength.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Bytes</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{bytes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Status</p>
                <p className={`font-semibold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isValid ? 'Valid' : 'Invalid'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter binary:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {binaryLength} bits
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter binary code (e.g., 01001000 01100101 01101100 01101100 01101111)..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input || !isValid}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔤</span>
            <span>Convert to Text</span>
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <textarea
              value={output}
              readOnly
              rows={8}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100"
            />
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy Result
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TextToBinary() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<'spaced' | 'continuous'>('spaced');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    const binary = input
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(format === 'spaced' ? ' ' : '');
    
    setOutput(binary);
    toast.success('Text converted to binary!');
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
    bytes: input.length,
    bits: input.length * 8,
  };

  return (
    <ToolBase
      title="Text to Binary Converter"
      description="Convert text to binary code (ASCII)"
      icon="🔢"
      helpText="Convert any text to binary code using ASCII encoding. Each character is represented as an 8-bit binary number."
      tips={[
        'Each character = 8 bits (1 byte)',
        'Spaced format: easier to read',
        'Continuous format: compact',
        'Use Binary to Text to reverse',
        'All processing happens in your browser'
      ]}
    >
      <div className="space-y-4">
        {stats.inputLength > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Characters</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.inputLength.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Bytes</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.bytes.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Bits</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.bits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format:
          </label>
          <select
            value={format}
            onChange={(e) => {
              setFormat(e.target.value as 'spaced' | 'continuous');
              setOutput('');
            }}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="spaced">Spaced (01001000 01100101)</option>
            <option value="continuous">Continuous (0100100001100101)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text:
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
            placeholder="Enter text to convert to binary..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔢</span>
            <span>Convert to Binary</span>
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
                Binary:
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
                       text-gray-900 dark:text-gray-100 font-mono text-sm"
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


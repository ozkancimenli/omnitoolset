'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function AddLineNumbers() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [format, setFormat] = useState<'simple' | 'padded'>('simple');

  const addNumbers = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    const lines = input.split('\n');
    const maxDigits = format === 'padded' ? String(lines.length + startNumber - 1).length : 0;
    const numbered = lines.map((line, i) => {
      const num = startNumber + i;
      const numStr = format === 'padded' ? String(num).padStart(maxDigits, '0') : String(num);
      return `${numStr}. ${line}`;
    }).join('\n');
    setOutput(numbered);
    toast.success('Line numbers added!');
  };

  useEffect(() => {
    if (input.trim()) {
      const lines = input.split('\n');
      const maxDigits = format === 'padded' ? String(lines.length + startNumber - 1).length : 0;
      const numbered = lines.map((line, i) => {
        const num = startNumber + i;
        const numStr = format === 'padded' ? String(num).padStart(maxDigits, '0') : String(num);
        return `${numStr}. ${line}`;
      }).join('\n');
      setOutput(numbered);
    } else {
      setOutput('');
    }
  }, [input, startNumber, format]);

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

  const lineCount = input.split('\n').length;

  return (
    <ToolBase
      title="Add Line Numbers"
      description="Add line numbers to text"
      icon="🔢"
      helpText="Add line numbers to each line of your text. Supports custom start number and padded format for better alignment."
      tips={[
        'Adds numbers to each line',
        'Custom start number',
        'Padded format for alignment',
        'Real-time preview',
        'Copy numbered text to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start number:
            </label>
            <input
              type="number"
              value={startNumber}
              onChange={(e) => setStartNumber(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format:
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'simple' | 'padded')}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple (1, 2, 3...)</option>
              <option value="padded">Padded (01, 02, 03...)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {lineCount} lines
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text (each line will be numbered)..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={addNumbers} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Add Numbers
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
                Numbered text:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={output}
              readOnly
              rows={10}
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


'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function PascalCase() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    const pascal = input
      .toLowerCase()
      .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^[a-z]/, char => char.toUpperCase());
    setOutput(pascal);
    toast.success('Converted to PascalCase!');
  };

  useEffect(() => {
    if (input.trim()) {
      const pascal = input
        .toLowerCase()
        .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[a-z]/, char => char.toUpperCase());
      setOutput(pascal);
    } else {
      setOutput('');
    }
  }, [input]);

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

  return (
    <ToolBase
      title="Pascal Case Converter"
      description="Convert text to PascalCase format"
      icon="🏛️"
      helpText="Convert any text to PascalCase format. All words start with uppercase. Perfect for class names in programming."
      tips={[
        'All words start with uppercase',
        'No spaces or special characters',
        'Removes special characters',
        'Commonly used for class names',
        'Real-time conversion as you type'
      ]}
    >
      <div className="space-y-4">
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
            rows={6}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text to convert to PascalCase..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert
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
                PascalCase:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <input
                type="text"
                value={output}
                readOnly
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-lg focus:outline-none"
              />
            </div>
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


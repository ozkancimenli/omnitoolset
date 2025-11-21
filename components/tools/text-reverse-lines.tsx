'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TextReverseLines() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const reverse = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    const lines = input.split('\n');
    setOutput(lines.reverse().join('\n'));
    toast.success('Lines reversed!');
  };

  useEffect(() => {
    if (input.trim()) {
      const lines = input.split('\n');
      setOutput(lines.reverse().join('\n'));
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

  const lineCount = input.split('\n').length;

  return (
    <ToolBase
      title="Reverse Lines"
      description="Reverse the order of lines in text"
      icon="🔄"
      helpText="Reverse the order of lines in your text. Perfect for reordering lists or reversing line sequences."
      tips={[
        'Reverses line order',
        'Preserves line content',
        'Real-time preview',
        'Useful for reordering lists',
        'Copy reversed text to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text (one line per item):
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
            placeholder="Enter text lines..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={reverse} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Reverse Lines
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
                Reversed lines:
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


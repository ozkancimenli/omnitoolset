'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function ReverseText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [reverseMode, setReverseMode] = useState<'characters' | 'words' | 'lines'>('characters');

  const reverse = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    let result = '';
    if (reverseMode === 'characters') {
      result = input.split('').reverse().join('');
    } else if (reverseMode === 'words') {
      result = input.split(/\s+/).reverse().join(' ');
    } else {
      result = input.split('\n').reverse().join('\n');
    }

    setOutput(result);
    toast.success('Text reversed!');
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

  return (
    <ToolBase
      title="Reverse Text"
      description="Reverse text by characters, words, or lines"
      icon="🔄"
      helpText="Reverse your text in different ways. Reverse characters, words, or lines. Perfect for testing, obfuscation, or creative purposes."
      tips={[
        'Characters: Reverse each character',
        'Words: Reverse the order of words',
        'Lines: Reverse the order of lines',
        'Useful for testing and obfuscation',
        'Copy reversed text to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reverse Mode:
          </label>
          <select
            value={reverseMode}
            onChange={(e) => {
              setReverseMode(e.target.value as 'characters' | 'words' | 'lines');
              setOutput('');
            }}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="characters">Reverse Characters</option>
            <option value="words">Reverse Words</option>
            <option value="lines">Reverse Lines</option>
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
            placeholder="Enter text to reverse..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={reverse} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            <span>Reverse Text</span>
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
                Reversed text:
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


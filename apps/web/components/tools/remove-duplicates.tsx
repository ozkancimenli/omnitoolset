'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function RemoveDuplicates() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removedCount, setRemovedCount] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);

  const removeDuplicates = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    let lines = input.split('\n');
    
    if (trimWhitespace) {
      lines = lines.map(line => line.trim());
    }

    let unique: string[];
    if (caseSensitive) {
      unique = Array.from(new Set(lines));
    } else {
      const seen = new Set<string>();
      unique = lines.filter(line => {
        const key = caseSensitive ? line : line.toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    const removed = lines.length - unique.length;
    
    setRemovedCount(removed);
    setOutput(unique.join('\n'));
    
    if (removed > 0) {
      toast.success(`Removed ${removed} duplicate line${removed !== 1 ? 's' : ''}!`);
    } else {
      toast.info('No duplicates found');
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
    setRemovedCount(0);
    toast.info('Cleared');
  };

  const stats = {
    inputLines: input.split('\n').length,
    outputLines: output ? output.split('\n').length : 0,
    removed: removedCount,
  };

  return (
    <ToolBase
      title="Remove Duplicates"
      description="Remove duplicate lines from text"
      icon="🔁"
      helpText="Remove duplicate lines from your text. Supports case-sensitive and case-insensitive matching, with options to trim whitespace."
      tips={[
        'One line per item',
        'Case sensitive: exact match required',
        'Trim whitespace: removes leading/trailing spaces',
        'Preserves original order',
        'Copy cleaned text to clipboard'
      ]}
    >
      <div className="space-y-4">
        {stats.inputLines > 0 && stats.outputLines > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Input Lines</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.inputLines.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Output Lines</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.outputLines.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Removed</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.removed.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={trimWhitespace}
              onChange={(e) => setTrimWhitespace(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Trim whitespace</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text (one line per item):
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.inputLines} lines
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text lines (duplicates will be removed)..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={removeDuplicates} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔁</span>
            <span>Remove Duplicates</span>
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
            {removedCount > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
                  ✓ Removed {removedCount} duplicate line{removedCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Result (unique lines):
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stats.outputLines} lines
                </span>
              </div>
              <textarea
                value={output}
                readOnly
                rows={10}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100"
              />
            </div>

            <button 
              onClick={copyToClipboard} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy Result
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

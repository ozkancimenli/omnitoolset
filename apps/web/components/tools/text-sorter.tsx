'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TextSorter() {
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [output, setOutput] = useState('');

  const sort = () => {
    if (!input.trim()) {
      toast.warning('Please enter text to sort');
      return;
    }

    const lines = input.split('\n').filter(line => line.trim());
    const sorted = order === 'asc' 
      ? [...lines].sort((a, b) => {
          const aComp = caseSensitive ? a : a.toLowerCase();
          const bComp = caseSensitive ? b : b.toLowerCase();
          return aComp.localeCompare(bComp);
        })
      : [...lines].sort((a, b) => {
          const aComp = caseSensitive ? a : a.toLowerCase();
          const bComp = caseSensitive ? b : b.toLowerCase();
          return bComp.localeCompare(aComp);
        });
    
    setOutput(sorted.join('\n'));
    toast.success(`Sorted ${sorted.length} line${sorted.length > 1 ? 's' : ''}!`);
  };

  useEffect(() => {
    if (input.trim()) {
      const lines = input.split('\n').filter(line => line.trim());
      const sorted = order === 'asc' 
        ? [...lines].sort((a, b) => {
            const aComp = caseSensitive ? a : a.toLowerCase();
            const bComp = caseSensitive ? b : b.toLowerCase();
            return aComp.localeCompare(bComp);
          })
        : [...lines].sort((a, b) => {
            const aComp = caseSensitive ? a : a.toLowerCase();
            const bComp = caseSensitive ? b : b.toLowerCase();
            return bComp.localeCompare(aComp);
          });
      setOutput(sorted.join('\n'));
    } else {
      setOutput('');
    }
  }, [input, order, caseSensitive]);

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

  const lineCount = input.split('\n').filter(line => line.trim()).length;

  return (
    <ToolBase
      title="Text Sorter"
      description="Sort lines of text alphabetically"
      icon="🔤"
      helpText="Sort lines of text alphabetically in ascending or descending order. Supports case-sensitive and case-insensitive sorting."
      tips={[
        'Sort lines alphabetically',
        'Ascending (A-Z) or Descending (Z-A)',
        'Case sensitive option',
        'Real-time preview',
        'Copy sorted text to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort Order:
            </label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">A-Z (Ascending)</option>
              <option value="desc">Z-A (Descending)</option>
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
          </label>
        </div>

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
            placeholder="Enter text lines to sort..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={sort} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Sort
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sorted Result:
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

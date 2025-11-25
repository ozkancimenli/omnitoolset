'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState(true);

  const generate = () => {
    if (min >= max) {
      toast.error('Minimum must be less than maximum');
      return;
    }

    if (count > 1000) {
      toast.error('Maximum count is 1000');
      return;
    }

    const nums: number[] = [];
    const used = new Set<number>();

    for (let i = 0; i < count; i++) {
      let num: number;
      if (!allowDuplicates && count > (max - min + 1)) {
        toast.error('Cannot generate unique numbers: count exceeds range');
        return;
      }

      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (!allowDuplicates && used.has(num));

      if (!allowDuplicates) used.add(num);
      nums.push(num);
    }

    setResults(nums);
    toast.success(`Generated ${count} random number${count > 1 ? 's' : ''}!`);
  };

  const copyToClipboard = (text: string) => {
    if (!text.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setResults([]);
    toast.info('Cleared');
  };

  const stats = {
    min: results.length > 0 ? Math.min(...results) : null,
    max: results.length > 0 ? Math.max(...results) : null,
    avg: results.length > 0 ? (results.reduce((a, b) => a + b, 0) / results.length).toFixed(2) : null,
  };

  return (
    <ToolBase
      title="Random Number Generator"
      description="Generate random numbers within a range"
      icon="🎲"
      helpText="Generate random numbers between a minimum and maximum value. Supports multiple numbers, duplicates option, and statistics."
      tips={[
        'Set minimum and maximum range',
        'Generate multiple numbers at once',
        'Option to allow or prevent duplicates',
        'View statistics (min, max, average)',
        'Copy all numbers to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum:</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum:</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value) || 100)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Count:</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              min="1"
              max="1000"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDuplicates}
              onChange={(e) => setAllowDuplicates(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Allow duplicate numbers</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={generate} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {stats.min !== null && stats.max !== null && stats.avg !== null && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">Min</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.min}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">Max</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.max}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">Average</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.avg}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Results ({results.length}):
              </h3>
              <button
                onClick={() => copyToClipboard(results.join(', '))}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                Copy All
              </button>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {results.map((num, i) => (
                  <span
                    key={i}
                    className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-mono text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer"
                    onClick={() => copyToClipboard(num.toString())}
                    title="Click to copy"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


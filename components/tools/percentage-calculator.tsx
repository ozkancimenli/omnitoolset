'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function PercentageCalculator() {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const num = parseFloat(value);
    const perc = parseFloat(percentage);
    if (isNaN(num) || isNaN(perc)) {
      toast.error('Please enter valid numbers');
      return;
    }
    const calculated = (num * perc) / 100;
    setResult(calculated);
    toast.success('Percentage calculated!');
  };

  useEffect(() => {
    if (value && percentage) {
      const num = parseFloat(value);
      const perc = parseFloat(percentage);
      if (!isNaN(num) && !isNaN(perc)) {
        setResult((num * perc) / 100);
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [value, percentage]);

  const clear = () => {
    setValue('');
    setPercentage('');
    setResult(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Percentage Calculator"
      description="Calculate percentage of a value"
      icon="%"
      helpText="Calculate what percentage of a value is. Enter a value and percentage to get the result. Real-time calculation as you type."
      tips={[
        'Enter the base value',
        'Enter the percentage',
        'Real-time calculation as you type',
        'Formula: value × percentage ÷ 100',
        'Useful for discounts, tips, taxes'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Value:</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              step="0.01"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter value..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Percentage:</label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              step="0.01"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter percentage..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={calculate} 
            disabled={!value || !percentage}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Calculate
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {result !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{result.toFixed(2)}</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {percentage}% of {value} = {result.toFixed(2)}
            </div>
            {value && percentage && (
              <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700 text-xs text-gray-500 dark:text-gray-400">
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div>
                    <span className="font-semibold">Original:</span> {parseFloat(value).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Percentage:</span> {parseFloat(percentage).toFixed(2)}%
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Result:</span> {result.toFixed(2)} ({((result / parseFloat(value)) * 100).toFixed(2)}% of original)
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolBase>
  );
}


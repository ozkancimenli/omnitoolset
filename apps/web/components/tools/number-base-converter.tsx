'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter a number first');
      return;
    }

    try {
      const num = parseInt(input, fromBase);
      if (isNaN(num)) {
        toast.error(`Invalid number for base ${fromBase}. Please check your input.`);
        setOutput('');
        return;
      }
      const result = num.toString(toBase).toUpperCase();
      setOutput(result);
      toast.success('Number converted!');
    } catch (error) {
      toast.error('Error converting: ' + (error as Error).message);
      setOutput('');
    }
  };

  useEffect(() => {
    if (input.trim()) {
      try {
        const num = parseInt(input, fromBase);
        if (!isNaN(num)) {
          const result = num.toString(toBase).toUpperCase();
          setOutput(result);
        } else {
          setOutput('');
        }
      } catch {
        setOutput('');
      }
    } else {
      setOutput('');
    }
  }, [input, fromBase, toBase]);

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

  const isValid = input.trim() ? !isNaN(parseInt(input, fromBase)) : false;

  return (
    <ToolBase
      title="Number Base Converter"
      description="Convert numbers between different number bases (binary, octal, decimal, hexadecimal)"
      icon="🔢"
      helpText="Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Real-time conversion as you type."
      tips={[
        'Binary: uses 0 and 1 (base 2)',
        'Octal: uses 0-7 (base 8)',
        'Decimal: uses 0-9 (base 10)',
        'Hexadecimal: uses 0-9 and A-F (base 16)',
        'Real-time conversion as you type'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number:</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Enter number..."
            />
            {input && !isValid && (
              <p className="text-red-600 dark:text-red-400 text-xs mt-1">Invalid for base {fromBase}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From Base:</label>
            <select
              value={fromBase}
              onChange={(e) => setFromBase(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>Binary (2)</option>
              <option value={8}>Octal (8)</option>
              <option value={10}>Decimal (10)</option>
              <option value={16}>Hexadecimal (16)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To Base:</label>
            <select
              value={toBase}
              onChange={(e) => setToBase(parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>Binary (2)</option>
              <option value={8}>Octal (8)</option>
              <option value={10}>Decimal (10)</option>
              <option value={16}>Hexadecimal (16)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input || !isValid}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Result:</label>
              <button 
                onClick={copyToClipboard} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <input
                type="text"
                value={output}
                readOnly
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-2xl text-center font-bold focus:outline-none"
              />
            </div>
          </div>
        )}

        {input && isValid && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">All Bases:</div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>Binary: {parseInt(input, fromBase).toString(2)}</div>
              <div>Octal: {parseInt(input, fromBase).toString(8)}</div>
              <div>Decimal: {parseInt(input, fromBase).toString(10)}</div>
              <div>Hex: {parseInt(input, fromBase).toString(16).toUpperCase()}</div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


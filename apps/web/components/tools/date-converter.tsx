'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function DateConverter() {
  const [inputDate, setInputDate] = useState('');
  const [inputFormat, setInputFormat] = useState('YYYY-MM-DD');
  const [outputFormat, setOutputFormat] = useState('DD/MM/YYYY');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const formatDate = (date: Date, format: string): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
      .replace('DDDD', dayName)
      .replace('MMMM', monthName)
      .replace('dd', day)
      .replace('MMM', date.toLocaleDateString('en-US', { month: 'short' }));
  };

  const parseDate = (dateString: string, format: string): Date | null => {
    try {
      // Common format patterns
      if (format === 'YYYY-MM-DD' || format === 'ISO') {
        return new Date(dateString);
      }
      
      if (format === 'DD/MM/YYYY') {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
      
      if (format === 'MM/DD/YYYY') {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
      }
      
      if (format === 'DD-MM-YYYY') {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
      
      // Try default Date parsing
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const convert = () => {
    if (!inputDate.trim()) {
      setError('Please enter a date');
      setResult('');
      toast.warning('Please enter a date');
      return;
    }

    setError('');
    const parsedDate = parseDate(inputDate, inputFormat);
    
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      const errorMsg = 'Invalid date format. Please check your input.';
      setError(errorMsg);
      setResult('');
      toast.error(errorMsg);
      return;
    }

    const formatted = formatDate(parsedDate, outputFormat);
    setResult(formatted);
    toast.success('Date converted successfully!');
  };

  const copyToClipboard = () => {
    if (!result.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  };

  const useCurrentDate = () => {
    const now = new Date();
    setInputDate(formatDate(now, inputFormat));
    setResult(formatDate(now, outputFormat));
    setError('');
    toast.info('Current date set');
  };

  const clear = () => {
    setInputDate('');
    setResult('');
    setError('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Date Converter"
      description="Convert dates between different formats"
      icon="📅"
      helpText="Convert dates between various formats including ISO, Unix timestamp, and custom formats. Supports multiple input and output formats."
      tips={[
        'Select input and output formats',
        'Enter date in input format',
        'Converts to selected output format',
        'Shows Unix timestamp and ISO',
        'Use current date button'
      ]}
    >
      <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Input Format:
          </label>
          <select
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            <option value="ISO">ISO String</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format:
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            <option value="DDDD, MMMM DD, YYYY">Day, Month DD, YYYY</option>
            <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
            <option value="DD/MM/YYYY HH:mm">DD/MM/YYYY HH:mm</option>
            <option value="Unix Timestamp">Unix Timestamp</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input Date:
        </label>
        <input
          type="text"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
          placeholder="Enter date (e.g., 2024-01-15 or 15/01/2024)"
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                   text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button 
          onClick={convert} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Convert
        </button>
        <button 
          onClick={useCurrentDate} 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Current Date
        </button>
        <button 
          onClick={clear}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Converted Date:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={outputFormat === 'Unix Timestamp' 
                  ? Math.floor(parseDate(inputDate, inputFormat)!.getTime() / 1000).toString()
                  : result}
                readOnly
                className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg 
                         text-blue-600 dark:text-blue-400 font-mono focus:outline-none"
              />
              <button 
                onClick={copyToClipboard} 
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {outputFormat !== 'Unix Timestamp' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Additional Formats:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Unix Timestamp:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">
                    {Math.floor(parseDate(inputDate, inputFormat)!.getTime() / 1000)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ISO String:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-xs break-all">
                    {parseDate(inputDate, inputFormat)!.toISOString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">UTC:</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                    {parseDate(inputDate, inputFormat)!.toUTCString()}
                  </span>
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

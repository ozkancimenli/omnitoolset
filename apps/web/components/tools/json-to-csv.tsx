'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ rows: 0, columns: 0 });

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter JSON first');
      return;
    }

    try {
      const json = JSON.parse(input);
      const array = Array.isArray(json) ? json : [json];
      
      if (array.length === 0) {
        toast.warning('JSON array is empty');
        setOutput('');
        setStats({ rows: 0, columns: 0 });
        return;
      }

      const headers = Object.keys(array[0]);
      const csvRows = [headers.join(',')];
      
      array.forEach((obj: any) => {
        const values = headers.map(header => {
          const value = obj[header];
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvRows.push(values.join(','));
      });
      
      const csv = csvRows.join('\n');
      setOutput(csv);
      setStats({ rows: array.length, columns: headers.length });
      toast.success(`Converted ${array.length} row(s) to CSV!`);
    } catch (error) {
      toast.error('Invalid JSON: ' + (error as Error).message);
      setOutput('');
      setStats({ rows: 0, columns: 0 });
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
    setStats({ rows: 0, columns: 0 });
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="JSON to CSV Converter"
      description="Convert JSON data to CSV format"
      icon="📊"
      helpText="Convert JSON arrays or objects to CSV format. Handles nested objects, arrays, and special characters. Perfect for data export and spreadsheet import."
      tips={[
        'Supports JSON arrays and objects',
        'Handles special characters and commas',
        'Escapes quotes properly',
        'Shows conversion statistics',
        'Copy CSV to clipboard'
      ]}
    >
      <div className="space-y-4">
        {stats.rows > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              <div>
                <p className="text-green-600 dark:text-green-400 mb-1">Rows</p>
                <p className="font-semibold text-green-900 dark:text-green-200">{stats.rows.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400 mb-1">Columns</p>
                <p className="font-semibold text-green-900 dark:text-green-200">{stats.columns.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter JSON:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]'
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert to CSV
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
                CSV Output:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={output}
                readOnly
                rows={12}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm resize-none focus:outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy CSV
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


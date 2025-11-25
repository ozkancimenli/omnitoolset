'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ rows: 0, columns: 0 });

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter CSV first');
      return;
    }

    try {
      const lines = input.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast.warning('CSV must have at least a header and one data row');
        setOutput('');
        setStats({ rows: 0, columns: 0 });
        return;
      }

      const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
      const json = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
        const obj: any = {};
        headers.forEach((header, index) => {
          let value: any = values[index] || '';
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(Number(value)) && value !== '') value = Number(value);
          obj[header] = value;
        });
        json.push(obj);
      }

      const jsonString = JSON.stringify(json, null, 2);
      setOutput(jsonString);
      setStats({ rows: json.length, columns: headers.length });
      toast.success(`Converted ${json.length} row(s) to JSON!`);
    } catch (error) {
      toast.error('Error converting CSV: ' + (error as Error).message);
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
      title="CSV to JSON Converter"
      description="Convert CSV data to JSON format"
      icon="📊"
      helpText="Convert CSV (Comma-Separated Values) to JSON format. Handles quoted values, commas in fields, and automatically detects data types."
      tips={[
        'Handles quoted values with commas',
        'Auto-detects numbers and booleans',
        'Preserves CSV structure',
        'Shows conversion statistics',
        'Copy JSON to clipboard'
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
              Enter CSV:
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
            placeholder='name,age,city\n"John",30,"New York"\n"Jane",25,"London"'
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert to JSON
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
                JSON Output:
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
              Copy JSON
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


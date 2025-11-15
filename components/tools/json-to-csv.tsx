'use client';

import { useState } from 'react';

export default function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const json = JSON.parse(input);
      const array = Array.isArray(json) ? json : [json];
      
      if (array.length === 0) {
        alert('JSON array is empty');
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
      
      setOutput(csvRows.join('\n'));
    } catch (error) {
      alert('Invalid JSON: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter JSON:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]'
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to CSV
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">CSV:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


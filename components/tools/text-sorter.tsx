'use client';

import { useState } from 'react';

export default function TextSorter() {
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [output, setOutput] = useState('');

  const sort = () => {
    if (!input.trim()) {
      alert('Please enter text to sort');
      return;
    }

    const lines = input.split('\n').filter(line => line.trim());
    const sorted = order === 'asc' 
      ? [...lines].sort((a, b) => a.localeCompare(b))
      : [...lines].sort((a, b) => b.localeCompare(a));
    
    setOutput(sorted.join('\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Sort Order:
        </label>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
        >
          <option value="asc">A-Z (Ascending)</option>
          <option value="desc">Z-A (Descending)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enter text (one line per item):
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text lines to sort..."
        />
      </div>

      <button onClick={sort} className="btn w-full" disabled={!input}>
        Sort
      </button>

      {output && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sorted Result:
            </label>
            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                       text-slate-100"
            />
          </div>

          <button onClick={copyToClipboard} className="btn w-full">
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

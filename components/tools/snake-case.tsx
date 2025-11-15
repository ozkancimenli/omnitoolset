'use client';

import { useState } from 'react';

export default function SnakeCase() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    const snake = input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setOutput(snake);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter text:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text to convert to snake_case..."
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to snake_case
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">snake_case:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <input
            type="text"
            value={output}
            readOnly
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
          />
        </div>
      )}
    </div>
  );
}


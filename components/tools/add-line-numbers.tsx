'use client';

import { useState } from 'react';

export default function AddLineNumbers() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [startNumber, setStartNumber] = useState(1);

  const addNumbers = () => {
    const lines = input.split('\n');
    const numbered = lines.map((line, i) => `${startNumber + i}. ${line}`).join('\n');
    setOutput(numbered);
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
          rows={10}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text (each line will be numbered)..."
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Start number:</label>
        <input
          type="number"
          value={startNumber}
          onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
          min="1"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button onClick={addNumbers} className="btn w-full" disabled={!input}>
        Add Line Numbers
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Numbered text:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={10}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


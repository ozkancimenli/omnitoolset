'use client';

import { useState } from 'react';

export default function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [toBase, setToBase] = useState(16);
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const num = parseInt(input, fromBase);
      if (isNaN(num)) {
        alert('Invalid number for the selected base');
        return;
      }
      setOutput(num.toString(toBase).toUpperCase());
    } catch (error) {
      alert('Error converting: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Number:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            placeholder="Enter number..."
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">From Base:</label>
          <select
            value={fromBase}
            onChange={(e) => setFromBase(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value={2}>Binary (2)</option>
            <option value={8}>Octal (8)</option>
            <option value={10}>Decimal (10)</option>
            <option value={16}>Hexadecimal (16)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">To Base:</label>
          <select
            value={toBase}
            onChange={(e) => setToBase(parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value={2}>Binary (2)</option>
            <option value={8}>Octal (8)</option>
            <option value={10}>Decimal (10)</option>
            <option value={16}>Hexadecimal (16)</option>
          </select>
        </div>
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Result:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <input
            type="text"
            value={output}
            readOnly
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-lg text-center"
          />
        </div>
      )}
    </div>
  );
}


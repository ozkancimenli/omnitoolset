'use client';

import { useState } from 'react';

export default function TextReverseLines() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const reverse = () => {
    const lines = input.split('\n');
    setOutput(lines.reverse().join('\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter text (one line per item):</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text lines..."
        />
      </div>

      <button onClick={reverse} className="btn w-full" disabled={!input}>
        Reverse Lines
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Reversed lines:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={10}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
          />
        </div>
      )}
    </div>
  );
}


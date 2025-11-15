'use client';

import { useState } from 'react';

export default function JavascriptFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    try {
      // Basic JavaScript formatting
      let formatted = input;
      formatted = formatted.replace(/;\s*/g, ';\n');
      formatted = formatted.replace(/\{\s*/g, ' {\n  ');
      formatted = formatted.replace(/\}\s*/g, '\n}\n');
      formatted = formatted.replace(/,\s*/g, ',\n  ');
      setOutput(formatted);
    } catch (error) {
      alert('Error formatting JavaScript. For better results, use a proper JS formatter library.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter JavaScript:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="Enter JavaScript code..."
        />
      </div>

      <button onClick={format} className="btn w-full" disabled={!input}>
        Format JavaScript
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Formatted JavaScript:</label>
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


'use client';

import { useState } from 'react';

export default function BinaryToText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const binary = input.replace(/\s/g, '');
      if (!/^[01]+$/.test(binary)) {
        alert('Invalid binary input. Only 0s and 1s are allowed.');
        return;
      }
      
      const text = binary
        .match(/.{1,8}/g)
        ?.map(byte => String.fromCharCode(parseInt(byte, 2)))
        .join('') || '';
      setOutput(text);
    } catch (error) {
      alert('Error converting binary to text: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter binary:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="Enter binary code (e.g., 01001000 01100101 01101100 01101100 01101111)..."
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to Text
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Text:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
          />
        </div>
      )}
    </div>
  );
}


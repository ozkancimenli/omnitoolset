'use client';

import { useState } from 'react';

export default function Base64Encode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (error) {
      alert('An error occurred during encoding!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enter your text:
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value) encode();
          }}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Paste the text you want to encode here..."
        />
      </div>

      <button onClick={encode} className="btn w-full" disabled={!input}>
        Encode
      </button>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Base64 Result:
        </label>
        <textarea
          value={output}
          readOnly
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 font-mono"
        />
      </div>

      <button onClick={copyToClipboard} className="btn w-full" disabled={!output}>
        Copy
      </button>
    </div>
  );
}

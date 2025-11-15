'use client';

import { useState } from 'react';

export default function Base64Decode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch (error) {
      alert('Invalid Base64 format! Please check.');
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
          Base64 kodunu girin:
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim()) decode();
          }}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Paste the Base64 code you want to decode here..."
        />
      </div>

      <button onClick={decode} className="btn w-full" disabled={!input}>
        Decode
      </button>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Decoded Result:
        </label>
        <textarea
          value={output}
          readOnly
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100"
        />
      </div>

      <button onClick={copyToClipboard} className="btn w-full" disabled={!output}>
        Copy
      </button>
    </div>
  );
}

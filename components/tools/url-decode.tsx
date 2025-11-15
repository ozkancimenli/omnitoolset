'use client';

import { useState } from 'react';

export default function UrlDecode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const decode = () => {
    try {
      const decoded = decodeURIComponent(input);
      setOutput(decoded);
    } catch (error) {
      alert('Invalid URL encoded format! Please check.');
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
          Enter URL encoded text:
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim()) {
              try {
                setOutput(decodeURIComponent(e.target.value));
              } catch {
                setOutput('');
              }
            } else {
              setOutput('');
            }
          }}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter URL encoded text to decode..."
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

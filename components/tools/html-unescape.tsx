'use client';

import { useState } from 'react';

export default function HtmlUnescape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const unescape = () => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    setOutput(textarea.value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter HTML entities:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="&lt;div&gt;Hello&lt;/div&gt;"
        />
      </div>
      <button onClick={unescape} className="btn w-full" disabled={!input}>Unescape HTML</button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Unescaped:</label>
            <button onClick={copyToClipboard} className="btn">Copy</button>
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


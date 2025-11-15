'use client';

import { useState } from 'react';

export default function SlugGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const generate = () => {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setOutput(slug);
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
          placeholder="Enter text to convert to slug..."
        />
      </div>

      <button onClick={generate} className="btn w-full" disabled={!input}>
        Generate Slug
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Slug:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <input
            type="text"
            value={output}
            readOnly
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
          />
        </div>
      )}
    </div>
  );
}


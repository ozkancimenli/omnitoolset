'use client';

import { useState } from 'react';

export default function TextReplace() {
  const [input, setInput] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [output, setOutput] = useState('');

  const handleReplace = () => {
    if (!find) {
      alert('Please enter text to find');
      return;
    }
    setOutput(input.replaceAll(find, replace));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Text:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Find:</label>
          <input
            type="text"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Text to find..."
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Replace with:</label>
          <input
            type="text"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Replacement text..."
          />
        </div>
      </div>

      <button onClick={handleReplace} className="btn w-full" disabled={!input || !find}>
        Replace
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Result:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={6}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
          />
        </div>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';

export default function JsonMinify() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const minify = () => {
    try {
      const json = JSON.parse(input);
      const minified = JSON.stringify(json);
      setOutput(minified);
    } catch (error) {
      alert('Invalid JSON: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter JSON:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder='{"name":"John","age":30}'
        />
      </div>
      <button onClick={minify} className="btn w-full" disabled={!input}>Minify JSON</button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Minified JSON:</label>
            <button onClick={copyToClipboard} className="btn">Copy</button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={6}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
          <p className="text-sm text-slate-400 mt-2">
            Size: {input.length} → {output.length} bytes ({Math.round((1 - output.length / input.length) * 100)}% reduction)
          </p>
        </div>
      )}
    </div>
  );
}


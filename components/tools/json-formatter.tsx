'use client';

import { useState } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
      setError('');
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message);
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setError('');
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message);
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError('');
      alert('✓ Valid JSON!');
    } catch (err) {
      setError('✗ Invalid JSON: ' + (err as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={format} className="btn">Format</button>
        <button onClick={minify} className="btn">Minify</button>
        <button onClick={validate} className="btn">Validate</button>
        <button onClick={copyToClipboard} className="btn" disabled={!input}>Copy</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          JSON Code:
        </label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          rows={15}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500"
          placeholder='{"name": "example", "value": 123}'
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

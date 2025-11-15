'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
      setError('');
      toast.success('JSON formatted successfully!');
    } catch (err) {
      const errorMsg = 'Invalid JSON: ' + (err as Error).message;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setError('');
      toast.success('JSON minified successfully!');
    } catch (err) {
      const errorMsg = 'Invalid JSON: ' + (err as Error).message;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      setError('');
      toast.success('✓ Valid JSON!');
    } catch (err) {
      const errorMsg = '✗ Invalid JSON: ' + (err as Error).message;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const copyToClipboard = () => {
    if (!input.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(input);
    toast.success('Copied to clipboard!');
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

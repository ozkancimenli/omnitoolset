'use client';

import { useState } from 'react';

export default function RemoveDuplicates() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removedCount, setRemovedCount] = useState(0);

  const removeDuplicates = () => {
    if (!input.trim()) {
      alert('Please enter text');
      return;
    }

    const lines = input.split('\n');
    const unique = Array.from(new Set(lines));
    const removed = lines.length - unique.length;
    
    setRemovedCount(removed);
    setOutput(unique.join('\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enter text (one line per item):
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text lines (duplicates will be removed)..."
        />
      </div>

      <button onClick={removeDuplicates} className="btn w-full" disabled={!input}>
        Remove Duplicates
      </button>

      {output && (
        <div className="space-y-4">
          {removedCount > 0 && (
            <div className="bg-indigo-500/10 border border-indigo-500 text-indigo-400 p-3 rounded-lg text-sm">
              Removed {removedCount} duplicate line{removedCount !== 1 ? 's' : ''}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Result (unique lines):
            </label>
            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                       text-slate-100"
            />
          </div>

          <button onClick={copyToClipboard} className="btn w-full">
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

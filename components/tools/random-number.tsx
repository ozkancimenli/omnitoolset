'use client';

import { useState } from 'react';

export default function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<number[]>([]);

  const generate = () => {
    const nums: number[] = [];
    for (let i = 0; i < count; i++) {
      nums.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    setResults(nums);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Minimum:</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Maximum:</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(parseInt(e.target.value) || 100)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Count:</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="100"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <button onClick={generate} className="btn w-full">
        Generate Random Numbers
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Results:</h3>
            <button
              onClick={() => copyToClipboard(results.join(', '))}
              className="btn"
            >
              Copy All
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {results.map((num, i) => (
                <span
                  key={i}
                  className="px-3 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg font-mono"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


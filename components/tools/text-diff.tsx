'use client';

import { useState } from 'react';

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<{ added: string[]; removed: string[] }>({ added: [], removed: [] });

  const compare = () => {
    if (!text1.trim() || !text2.trim()) {
      alert('Please enter both texts to compare');
      return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const set1 = new Set(lines1);
    const set2 = new Set(lines2);

    const added = lines2.filter(line => !set1.has(line));
    const removed = lines1.filter(line => !set2.has(line));

    setDiff({ added, removed });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Text 1:
          </label>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                     text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Enter first text..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Text 2:
          </label>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                     text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Enter second text..."
          />
        </div>
      </div>

      <button onClick={compare} className="btn w-full" disabled={!text1 || !text2}>
        Compare Texts
      </button>

      {(diff.added.length > 0 || diff.removed.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diff.removed.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-red-400 mb-2">
                Removed ({diff.removed.length}):
              </label>
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 max-h-64 overflow-y-auto">
                {diff.removed.map((line, index) => (
                  <div key={index} className="text-red-400 text-sm mb-1">
                    - {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {diff.added.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Added ({diff.added.length}):
              </label>
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 max-h-64 overflow-y-auto">
                {diff.added.map((line, index) => (
                  <div key={index} className="text-green-400 text-sm mb-1">
                    + {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {diff.added.length === 0 && diff.removed.length === 0 && text1 && text2 && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-lg text-center">
          Texts are identical!
        </div>
      )}
    </div>
  );
}

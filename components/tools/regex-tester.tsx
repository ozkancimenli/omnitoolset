'use client';

import { useState } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ global: true, ignoreCase: false, multiline: false });
  const [matches, setMatches] = useState<{ match: string; index: number }[]>([]);
  const [error, setError] = useState('');

  const test = () => {
    if (!pattern.trim()) {
      alert('Please enter a regex pattern');
      return;
    }

    setError('');
    setMatches([]);

    try {
      let flagsString = '';
      if (flags.global) flagsString += 'g';
      if (flags.ignoreCase) flagsString += 'i';
      if (flags.multiline) flagsString += 'm';

      const regex = new RegExp(pattern, flagsString);
      const matchesArray: { match: string; index: number }[] = [];
      let match;

      if (flags.global) {
        while ((match = regex.exec(testString)) !== null) {
          matchesArray.push({ match: match[0], index: match.index });
          if (!regex.global) break; // Prevent infinite loop
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matchesArray.push({ match: match[0], index: match.index });
        }
      }

      setMatches(matchesArray);
    } catch (err) {
      setError('Invalid regex pattern: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Regex Pattern:
        </label>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="/pattern/flags or just pattern"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Flags:
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.global}
              onChange={(e) => setFlags({ ...flags, global: e.target.checked })}
            />
            <span className="text-slate-300">Global (g)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.ignoreCase}
              onChange={(e) => setFlags({ ...flags, ignoreCase: e.target.checked })}
            />
            <span className="text-slate-300">Ignore Case (i)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flags.multiline}
              onChange={(e) => setFlags({ ...flags, multiline: e.target.checked })}
            />
            <span className="text-slate-300">Multiline (m)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Test String:
        </label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text to test against the regex pattern..."
        />
      </div>

      <button onClick={test} className="btn w-full" disabled={!pattern || !testString}>
        Test Regex
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded-lg">
            Found {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Matches:
            </label>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-64 overflow-y-auto">
              {matches.map((m, index) => (
                <div key={index} className="mb-2 p-2 bg-slate-800 rounded">
                  <div className="text-slate-300 text-sm">
                    <span className="text-indigo-400">Match {index + 1}:</span> "{m.match}"
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    Position: {m.index}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 && pattern && testString && !error && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-400 p-4 rounded-lg text-center">
          No matches found
        </div>
      )}
    </div>
  );
}

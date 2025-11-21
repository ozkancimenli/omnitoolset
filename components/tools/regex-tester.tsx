'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ global: true, ignoreCase: false, multiline: false });
  const [matches, setMatches] = useState<{ match: string; index: number; groups?: string[] }[]>([]);
  const [error, setError] = useState('');

  const test = () => {
    if (!pattern.trim()) {
      toast.warning('Please enter a regex pattern');
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
      const matchesArray: { match: string; index: number; groups?: string[] }[] = [];
      let match;
      const regexCopy = new RegExp(regex.source, regex.flags);

      if (flags.global) {
        while ((match = regexCopy.exec(testString)) !== null) {
          matchesArray.push({ 
            match: match[0], 
            index: match.index,
            groups: match.length > 1 ? Array.from(match).slice(1) : undefined
          });
          if (match[0].length === 0) regexCopy.lastIndex++;
          if (!regexCopy.global) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matchesArray.push({ 
            match: match[0], 
            index: match.index,
            groups: match.length > 1 ? Array.from(match).slice(1) : undefined
          });
        }
      }

      setMatches(matchesArray);
      if (matchesArray.length > 0) {
        toast.success(`Found ${matchesArray.length} match${matchesArray.length > 1 ? 'es' : ''}!`);
      } else {
        toast.info('No matches found');
      }
    } catch (err) {
      const errorMsg = 'Invalid regex pattern: ' + (err as Error).message;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (pattern.trim() && testString.trim()) {
      try {
        let flagsString = '';
        if (flags.global) flagsString += 'g';
        if (flags.ignoreCase) flagsString += 'i';
        if (flags.multiline) flagsString += 'm';

        const regex = new RegExp(pattern, flagsString);
        const matchesArray: { match: string; index: number }[] = [];
        let match;
        const regexCopy = new RegExp(regex.source, regex.flags);

        if (flags.global) {
          while ((match = regexCopy.exec(testString)) !== null) {
            matchesArray.push({ match: match[0], index: match.index });
            if (match[0].length === 0) regexCopy.lastIndex++;
            if (!regexCopy.global) break;
          }
        } else {
          match = regex.exec(testString);
          if (match) {
            matchesArray.push({ match: match[0], index: match.index });
          }
        }

        setMatches(matchesArray);
        setError('');
      } catch {
        setError('');
        setMatches([]);
      }
    } else {
      setMatches([]);
      setError('');
    }
  }, [pattern, testString, flags]);

  const copyToClipboard = (text: string) => {
    if (!text.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setError('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Regex Tester"
      description="Test and debug regular expressions"
      icon="🔍"
      helpText="Test regular expressions against text. See matches, groups, and positions. Supports global, case-insensitive, and multiline flags."
      tips={[
        'Test regex patterns in real-time',
        'Global flag: find all matches',
        'Ignore case: case-insensitive matching',
        'Multiline: ^ and $ match line boundaries',
        'View match positions and groups'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Regex Pattern:
          </label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="/pattern/flags or just pattern"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Flags:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.global}
                onChange={(e) => setFlags({ ...flags, global: e.target.checked })}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Global (g)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.ignoreCase}
                onChange={(e) => setFlags({ ...flags, ignoreCase: e.target.checked })}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Ignore Case (i)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flags.multiline}
                onChange={(e) => setFlags({ ...flags, multiline: e.target.checked })}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Multiline (m)</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Test String:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {testString.length} characters
            </span>
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text to test against the regex pattern..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={test} 
            disabled={!pattern || !testString}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Test Regex
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-3 rounded-lg text-center font-semibold">
              Found {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Matches:
                </label>
                <button
                  onClick={() => copyToClipboard(matches.map(m => m.match).join(', '))}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Copy All
                </button>
              </div>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
                {matches.map((m, index) => (
                  <div key={index} className="mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-gray-900 dark:text-gray-100 text-sm">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">Match {index + 1}:</span> 
                      <span className="font-mono ml-2">"{m.match}"</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                      Position: {m.index} - {m.index + m.match.length - 1}
                    </div>
                    {m.groups && m.groups.length > 0 && (
                      <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        Groups: {m.groups.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {matches.length === 0 && pattern && testString && !error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 p-4 rounded-lg text-center">
            No matches found
          </div>
        )}
      </div>
    </ToolBase>
  );
}

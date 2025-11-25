'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TextReplace() {
  const [input, setInput] = useState('');
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [output, setOutput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [replaceAll, setReplaceAll] = useState(true);

  const handleReplace = () => {
    if (!input.trim()) {
      toast.error('Please enter some text first');
      return;
    }

    if (!find.trim()) {
      toast.error('Please enter text to find');
      return;
    }

    let result = input;
    const searchText = caseSensitive ? find : find.toLowerCase();
    const inputText = caseSensitive ? input : input.toLowerCase();

    if (replaceAll) {
      if (caseSensitive) {
        result = input.replaceAll(find, replace);
      } else {
        // Case-insensitive replace all
        const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = input.replace(regex, replace);
      }
    } else {
      if (caseSensitive) {
        result = input.replace(find, replace);
      } else {
        const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        result = input.replace(regex, replace);
      }
    }

    setOutput(result);
    
    const matches = caseSensitive 
      ? (input.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      : (input.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
    
    toast.success(`Replaced ${replaceAll ? matches : Math.min(matches, 1)} occurrence(s)!`);
  };

  const copyToClipboard = () => {
    if (!output.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setInput('');
    setFind('');
    setReplace('');
    setOutput('');
    toast.info('Cleared');
  };

  const matches = find ? (
    caseSensitive 
      ? (input.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      : (input.match(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
  ) : 0;

  return (
    <ToolBase
      title="Find & Replace Text"
      description="Find and replace text with advanced options"
      icon="🔍"
      helpText="Find and replace text in your content. Supports case-sensitive search, replace all occurrences, or replace first occurrence only."
      tips={[
        'Case sensitive: Match exact case',
        'Replace all: Replace all occurrences',
        'Replace first: Replace only first occurrence',
        'Supports special characters',
        'Real-time match count'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Text:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Find:
              </label>
              {find && matches > 0 && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {matches} match{matches > 1 ? 'es' : ''}
                </span>
              )}
            </div>
            <input
              type="text"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Text to find..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Replace with:
            </label>
            <input
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Replacement text..."
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Case sensitive</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceAll}
              onChange={(e) => setReplaceAll(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Replace all occurrences</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleReplace} 
            disabled={!input || !find}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>🔍</span>
            <span>Replace</span>
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Result:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <textarea
              value={output}
              readOnly
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100"
            />
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy Result
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


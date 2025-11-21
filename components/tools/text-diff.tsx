'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<{ added: string[]; removed: string[] }>({ added: [], removed: [] });

  const compare = () => {
    if (!text1.trim() || !text2.trim()) {
      toast.warning('Please enter both texts to compare');
      return;
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const set1 = new Set(lines1);
    const set2 = new Set(lines2);

    const added = lines2.filter(line => !set1.has(line));
    const removed = lines1.filter(line => !set2.has(line));

    setDiff({ added, removed });
    
    if (added.length === 0 && removed.length === 0) {
      toast.success('Texts are identical!');
    } else {
      toast.success(`Found ${added.length} added and ${removed.length} removed line${(added.length + removed.length) > 1 ? 's' : ''}!`);
    }
  };

  useEffect(() => {
    if (text1.trim() && text2.trim()) {
      const lines1 = text1.split('\n');
      const lines2 = text2.split('\n');
      const set1 = new Set(lines1);
      const set2 = new Set(lines2);

      const added = lines2.filter(line => !set1.has(line));
      const removed = lines1.filter(line => !set2.has(line));

      setDiff({ added, removed });
    } else {
      setDiff({ added: [], removed: [] });
    }
  }, [text1, text2]);

  const copyToClipboard = (text: string) => {
    if (!text.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setText1('');
    setText2('');
    setDiff({ added: [], removed: [] });
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Text Diff"
      description="Compare two texts and find differences"
      icon="🔍"
      helpText="Compare two texts line by line and find what was added or removed. Perfect for comparing versions, code changes, or document revisions."
      tips={[
        'Compares texts line by line',
        'Shows added and removed lines',
        'Highlights differences',
        'Real-time comparison',
        'Useful for version control'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text 1:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {text1.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first text..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Text 2:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {text2.split('\n').length} lines
              </span>
            </div>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter second text..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={compare} 
            disabled={!text1 || !text2}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Compare
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {diff.added.length === 0 && diff.removed.length === 0 && text1 && text2 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 p-4 rounded-lg text-center font-semibold">
            ✓ Texts are identical!
          </div>
        )}

        {(diff.added.length > 0 || diff.removed.length > 0) && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <p className="text-blue-600 dark:text-blue-400 mb-1">Added</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">{diff.added.length}</p>
                </div>
                <div>
                  <p className="text-blue-600 dark:text-blue-400 mb-1">Removed</p>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">{diff.removed.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diff.removed.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-red-600 dark:text-red-400">
                      Removed ({diff.removed.length}):
                    </label>
                    <button
                      onClick={() => copyToClipboard(diff.removed.join('\n'))}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {diff.removed.map((line, index) => (
                      <div key={index} className="text-red-600 dark:text-red-400 text-sm mb-1 font-mono">
                        - {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.added.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-green-600 dark:text-green-400">
                      Added ({diff.added.length}):
                    </label>
                    <button
                      onClick={() => copyToClipboard(diff.added.join('\n'))}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {diff.added.map((line, index) => (
                      <div key={index} className="text-green-600 dark:text-green-400 text-sm mb-1 font-mono">
                        + {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function HtmlUnescape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input.trim()) {
      try {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        setOutput(textarea.value);
      } catch (error) {
        setOutput('');
      }
    } else {
      setOutput('');
    }
  }, [input]);

  const unescape = () => {
    if (!input.trim()) {
      toast.warning('Please enter HTML entities first');
      return;
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = input;
      setOutput(textarea.value);
      toast.success('HTML unescaped successfully!');
    } catch (error) {
      toast.error('Error unescaping HTML: ' + (error as Error).message);
      setOutput('');
    }
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
    setOutput('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="HTML Unescape"
      description="Convert HTML entities back to regular text"
      icon="🔓"
      helpText="Convert HTML entities (like &lt;, &gt;, &amp;) back to their original characters. Real-time conversion as you type."
      tips={[
        'Converts &lt; to <',
        'Converts &gt; to >',
        'Converts &amp; to &',
        'Converts &quot; to "',
        'Real-time conversion'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter HTML entities:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="&lt;div&gt;Hello&lt;/div&gt;"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={unescape} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Unescape HTML
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
                Unescaped text:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={output}
                readOnly
                rows={8}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm resize-none focus:outline-none"
              />
            </div>
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


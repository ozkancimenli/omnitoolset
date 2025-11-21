'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function HtmlMinify() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const minify = () => {
    if (!input.trim()) {
      toast.warning('Please enter HTML code first');
      return;
    }

    try {
      const minified = input
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
      setOutput(minified);
      toast.success('HTML minified!');
    } catch (error) {
      toast.error('Error minifying HTML: ' + (error as Error).message);
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

  const stats = {
    inputLength: input.length,
    outputLength: output.length,
    reduction: input.length > 0 && output.length > 0 
      ? (1 - output.length / input.length) * 100 
      : 0,
  };

  return (
    <ToolBase
      title="HTML Minifier"
      description="Minify and compress HTML code"
      icon="🗜️"
      helpText="Minify your HTML code by removing comments, whitespace, and unnecessary characters. Reduces file size for faster loading."
      tips={[
        'Removes HTML comments',
        'Removes unnecessary whitespace',
        'Compresses code for production',
        'Reduces file size significantly',
        'Copy minified code to clipboard'
      ]}
    >
      <div className="space-y-4">
        {stats.inputLength > 0 && stats.outputLength > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-green-600 dark:text-green-400 mb-1">Input</p>
                <p className="font-semibold text-green-900 dark:text-green-200">{stats.inputLength.toLocaleString()} bytes</p>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400 mb-1">Output</p>
                <p className="font-semibold text-green-900 dark:text-green-200">{stats.outputLength.toLocaleString()} bytes</p>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400 mb-1">Reduction</p>
                <p className="font-semibold text-green-900 dark:text-green-200">{stats.reduction.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter HTML:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter HTML code..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={minify} 
            disabled={!input}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Minify HTML
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
                Minified HTML:
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
                       text-gray-900 dark:text-gray-100 font-mono text-sm"
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


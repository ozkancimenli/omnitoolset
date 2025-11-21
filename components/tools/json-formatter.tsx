'use client';

import { useState, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<{ lines: number; size: number; keys: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateStats = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      const lines = jsonText.split('\n').length;
      const size = new Blob([jsonText]).size;
      const keys = Object.keys(parsed).length;
      setStats({ lines, size, keys });
    } catch {
      setStats(null);
    }
  };

  const format = () => {
    if (!input.trim()) {
      toast.warning('Please enter JSON code first');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setInput(formatted);
      setError('');
      updateStats(formatted);
      toast.success('JSON formatted successfully!');
    } catch (err) {
      const errorMsg = 'Invalid JSON: ' + (err as Error).message;
      setError(errorMsg);
      setStats(null);
      toast.error(errorMsg);
    }
  };

  const minify = () => {
    if (!input.trim()) {
      toast.warning('Please enter JSON code first');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      setError('');
      updateStats(minified);
      toast.success('JSON minified successfully!');
    } catch (err) {
      const errorMsg = 'Invalid JSON: ' + (err as Error).message;
      setError(errorMsg);
      setStats(null);
      toast.error(errorMsg);
    }
  };

  const validate = () => {
    if (!input.trim()) {
      toast.warning('Please enter JSON code first');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setError('');
      updateStats(input);
      toast.success('✓ Valid JSON!');
    } catch (err) {
      const errorMsg = '✗ Invalid JSON: ' + (err as Error).message;
      setError(errorMsg);
      setStats(null);
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

  const clear = () => {
    setInput('');
    setError('');
    setStats(null);
    toast.info('Cleared');
  };

  const beautify = () => {
    format();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setError('');
    if (value.trim()) {
      updateStats(value);
    } else {
      setStats(null);
    }
  };

  return (
    <ToolBase
      title="JSON Formatter & Validator"
      description="Format, validate, and beautify JSON code"
      icon="📋"
      helpText="Paste your JSON code and format it, minify it, or validate it. All processing happens in your browser."
      tips={[
        'Paste JSON code directly into the textarea',
        'Click "Format" to beautify with proper indentation',
        'Click "Minify" to remove all whitespace',
        'Click "Validate" to check if JSON is valid',
        'Use "Copy" to copy formatted JSON to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={format}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Format
          </button>
          <button
            onClick={minify}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Minify
          </button>
          <button
            onClick={validate}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Validate
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!input.trim()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Copy
          </button>
          <button
            onClick={clear}
            disabled={!input.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => textareaRef.current?.focus()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Focus
          </button>
        </div>

        {stats && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Lines</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.lines}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Size</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  {(stats.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Top-level Keys</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.keys}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              JSON Code:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            rows={18}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                     resize-y"
            placeholder='{"name": "example", "value": 123}'
            spellCheck={false}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">❌</span>
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-200 mb-1">Error</p>
                <p className="text-sm text-red-800 dark:text-red-300 font-mono">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!error && input.trim() && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <p className="text-sm text-green-800 dark:text-green-200">
                JSON appears to be valid
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Keyboard Shortcuts</h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>• <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">Ctrl/Cmd + A</kbd> - Select all</li>
            <li>• <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">Tab</kbd> - Indent (when selected)</li>
            <li>• <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">Ctrl/Cmd + Enter</kbd> - Format JSON</li>
          </ul>
        </div>
      </div>
    </ToolBase>
  );
}

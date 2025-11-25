'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JavascriptFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const format = () => {
    if (!input.trim()) {
      toast.warning('Please enter JavaScript code first');
      return;
    }

    try {
      const indentStr = ' '.repeat(indentSize);
      let formatted = input;
      formatted = formatted.replace(/;\s*/g, ';\n');
      formatted = formatted.replace(/\{\s*/g, ` {\n${indentStr}`);
      formatted = formatted.replace(/\}\s*/g, '\n}\n');
      formatted = formatted.replace(/,\s*/g, ',\n' + indentStr);
      formatted = formatted.split('\n').map(line => line.trim()).filter(line => line).join('\n');
      setOutput(formatted);
      toast.success('JavaScript formatted!');
    } catch (error) {
      toast.error('Error formatting JavaScript. For better results, use a proper JS formatter library.');
      setOutput('');
    }
  };

  const minify = () => {
    if (!input.trim()) {
      toast.warning('Please enter JavaScript code first');
      return;
    }

    try {
      const minified = input
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .trim();
      setOutput(minified);
      toast.success('JavaScript minified!');
    } catch (error) {
      toast.error('Error minifying JavaScript: ' + (error as Error).message);
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
      title="JavaScript Formatter"
      description="Format and beautify JavaScript code"
      icon="⚡"
      helpText="Format and beautify your JavaScript code with proper indentation. Also includes minify option to compress JavaScript."
      tips={[
        'Formats JavaScript with proper indentation',
        'Adjustable indent size (spaces)',
        'Minify option to compress JavaScript',
        'Removes comments when minifying',
        'Copy formatted code to clipboard'
      ]}
    >
      <div className="space-y-4">
        {stats.inputLength > 0 && stats.outputLength > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Input</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.inputLength.toLocaleString()} chars</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Output</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.outputLength.toLocaleString()} chars</p>
              </div>
              <div>
                <p className="text-blue-600 dark:text-blue-400 mb-1">Change</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  {stats.reduction > 0 ? '-' : '+'}{Math.abs(stats.reduction).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Indent Size: {indentSize} spaces
          </label>
          <input
            type="range"
            min="1"
            max="4"
            value={indentSize}
            onChange={(e) => setIndentSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter JavaScript:
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
            placeholder="Enter JavaScript code..."
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={format} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Format
          </button>
          <button 
            onClick={minify}
            disabled={!input}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Minify
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
                Formatted JavaScript:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <textarea
              value={output}
              readOnly
              rows={12}
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


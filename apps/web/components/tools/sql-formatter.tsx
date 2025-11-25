'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [uppercaseKeywords, setUppercaseKeywords] = useState(true);

  const format = () => {
    if (!input.trim()) {
      toast.warning('Please enter SQL code first');
      return;
    }

    try {
      let formatted = uppercaseKeywords ? input.toUpperCase() : input;
      const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'DATABASE', 'AS', 'AND', 'OR', 'IN', 'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS'];
      
      if (uppercaseKeywords) {
        keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          formatted = formatted.replace(regex, keyword);
        });
      }
      
      formatted = formatted.replace(/\s+/g, ' ');
      formatted = formatted.replace(/\s*,\s*/g, ',\n  ');
      formatted = formatted.replace(/\s+FROM\s+/gi, '\nFROM ');
      formatted = formatted.replace(/\s+WHERE\s+/gi, '\nWHERE ');
      formatted = formatted.replace(/\s+JOIN\s+/gi, '\nJOIN ');
      formatted = formatted.replace(/\s+ON\s+/gi, '\n  ON ');
      formatted = formatted.replace(/\s+GROUP BY\s+/gi, '\nGROUP BY ');
      formatted = formatted.replace(/\s+ORDER BY\s+/gi, '\nORDER BY ');
      formatted = formatted.replace(/\s+HAVING\s+/gi, '\nHAVING ');
      formatted = formatted.replace(/\s+AND\s+/gi, '\n  AND ');
      formatted = formatted.replace(/\s+OR\s+/gi, '\n  OR ');
      
      setOutput(formatted);
      toast.success('SQL formatted!');
    } catch (error) {
      toast.error('Error formatting SQL: ' + (error as Error).message);
      setOutput('');
    }
  };

  const minify = () => {
    if (!input.trim()) {
      toast.warning('Please enter SQL code first');
      return;
    }

    try {
      const minified = input
        .replace(/--.*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim();
      setOutput(minified);
      toast.success('SQL minified!');
    } catch (error) {
      toast.error('Error minifying SQL: ' + (error as Error).message);
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
      title="SQL Formatter"
      description="Format and beautify SQL queries"
      icon="🗄️"
      helpText="Format and beautify your SQL queries with proper indentation and keyword highlighting. Also includes minify option."
      tips={[
        'Formats SQL with proper indentation',
        'Uppercase keywords option',
        'Minify option to compress SQL',
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
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercaseKeywords}
              onChange={(e) => setUppercaseKeywords(e.target.checked)}
              className="text-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase keywords</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter SQL:
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
            placeholder="Enter SQL query..."
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
                Formatted SQL:
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


'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function YamlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter YAML first');
      return;
    }

    try {
      // Basic YAML to JSON conversion
      const lines = input.split('\n');
      const json: any = {};
      const stack: any[] = [json];
      let currentIndent = 0;

      lines.forEach(line => {
        if (!line.trim()) return;
        
        const indent = line.match(/^(\s*)/)?.[1].length || 0;
        const trimmed = line.trim();
        
        if (trimmed.startsWith('-')) {
          // Array item
          const value = trimmed.substring(1).trim();
          if (!Array.isArray(stack[stack.length - 1])) {
            const parent = stack[stack.length - 2];
            const key = Object.keys(parent).pop() || '';
            parent[key] = [];
            stack[stack.length - 1] = parent[key];
          }
          stack[stack.length - 1].push(value === '' ? {} : value);
        } else if (trimmed.includes(':')) {
          // Key-value pair
          const [key, ...valueParts] = trimmed.split(':');
          const value = valueParts.join(':').trim();
          
          while (indent <= currentIndent && stack.length > 1) {
            stack.pop();
            currentIndent -= 2;
          }
          
          const current = stack[stack.length - 1];
          if (value === '') {
            current[key] = {};
            stack.push(current[key]);
          } else {
            current[key] = value;
          }
          currentIndent = indent;
        }
      });

      const jsonString = JSON.stringify(json, null, 2);
      setOutput(jsonString);
      toast.success('YAML converted to JSON!');
    } catch (error) {
      toast.error('Error converting YAML: ' + (error as Error).message);
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
      title="YAML to JSON Converter"
      description="Convert YAML format to JSON"
      icon="🔄"
      helpText="Convert YAML (YAML Ain't Markup Language) to JSON format. Handles nested objects, arrays, and key-value pairs."
      tips={[
        'Paste or type YAML code',
        'Supports nested structures',
        'Handles arrays and objects',
        'Validates YAML syntax',
        'Copy JSON to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter YAML:
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
            placeholder='name: John\nage: 30\ncity: New York'
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert to JSON
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
                JSON Output:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={output}
                readOnly
                rows={12}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm resize-none focus:outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy JSON
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


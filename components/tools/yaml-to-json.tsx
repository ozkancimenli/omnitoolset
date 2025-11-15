'use client';

import { useState } from 'react';

export default function YamlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
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

      setOutput(JSON.stringify(json, null, 2));
    } catch (error) {
      alert('Error converting YAML: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter YAML:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder='name: John\nage: 30'
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to JSON
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">JSON:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


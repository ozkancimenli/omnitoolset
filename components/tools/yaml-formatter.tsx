'use client';

import { useState } from 'react';

export default function YamlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    try {
      const lines = input.split('\n');
      let formatted = '';
      let indent = 0;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          formatted += '\n';
          return;
        }
        
        if (trimmed.startsWith('-')) {
          formatted += '  '.repeat(indent) + trimmed + '\n';
        } else if (trimmed.includes(':')) {
          formatted += '  '.repeat(indent) + trimmed + '\n';
          if (trimmed.endsWith(':')) indent++;
        } else {
          if (indent > 0 && !trimmed.startsWith('  ')) indent--;
          formatted += '  '.repeat(indent) + trimmed + '\n';
        }
      });
      
      setOutput(formatted);
    } catch (error) {
      alert('Error formatting YAML: ' + (error as Error).message);
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
          placeholder="Enter YAML code..."
        />
      </div>

      <button onClick={format} className="btn w-full" disabled={!input}>
        Format YAML
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Formatted YAML:</label>
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


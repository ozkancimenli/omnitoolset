'use client';

import { useState } from 'react';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    try {
      let formatted = '';
      let indent = 0;
      const regex = /(>)(<)(\/*)/g;
      const xml = input.replace(regex, '$1\r\n$2$3');
      const parts = xml.split('\r\n');
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.match(/.+<\/\w[^>]*>$/)) {
          formatted += '  '.repeat(indent) + part + '\n';
        } else if (part.match(/^<\/\w/) && indent > 0) {
          indent--;
          formatted += '  '.repeat(indent) + part + '\n';
        } else if (part.match(/^<\w[^>]*[^\/]>.*$/)) {
          formatted += '  '.repeat(indent) + part + '\n';
          indent++;
        } else {
          formatted += '  '.repeat(indent) + part + '\n';
        }
      }
      setOutput(formatted);
    } catch (error) {
      alert('Error formatting XML: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter XML:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="Enter XML code..."
        />
      </div>

      <button onClick={format} className="btn w-full" disabled={!input}>
        Format XML
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Formatted XML:</label>
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


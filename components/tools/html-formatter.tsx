'use client';

import { useState } from 'react';

export default function HtmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    try {
      let formatted = input;
      let indent = 0;
      const lines = formatted.split(/>\s*</);
      formatted = lines.map((line, i) => {
        if (line.match(/^\/\w/)) indent--;
        const padding = '  '.repeat(Math.max(0, indent));
        const formattedLine = padding + '<' + line + '>';
        if (line.match(/^<?\w[^>]*[^\/]$/) && !line.startsWith('input') && !line.startsWith('img') && !line.startsWith('br') && !line.startsWith('hr')) indent++;
        return formattedLine;
      }).join('\n');
      setOutput(formatted);
    } catch (error) {
      alert('Error formatting HTML: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter HTML:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="Enter HTML code..."
        />
      </div>

      <button onClick={format} className="btn w-full" disabled={!input}>
        Format HTML
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Formatted HTML:</label>
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


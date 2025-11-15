'use client';

import { useState } from 'react';

export default function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    let html = input;
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    html = html.replace(/\n/gim, '<br>');
    setOutput(html);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter Markdown:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="# Heading\n**Bold** and *italic* text"
        />
      </div>
      <button onClick={convert} className="btn w-full" disabled={!input}>Convert to HTML</button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">HTML:</label>
            <button onClick={copyToClipboard} className="btn">Copy</button>
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


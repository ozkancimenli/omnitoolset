'use client';

import { useState } from 'react';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is **bold** and this is *italic*.');

  const convertToHTML = (md: string): string => {
    let html = md;
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');
    // Line breaks
    html = html.replace(/\n/gim, '<br>');
    return html;
  };

  const html = convertToHTML(markdown);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-300 mb-2">Markdown:</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={20}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
            placeholder="# Your Markdown here..."
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Preview:</label>
          <div
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 min-h-[400px] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';

export default function ExtractUrls() {
  const [input, setInput] = useState('');
  const [urls, setUrls] = useState<string[]>([]);

  const extract = () => {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const found = input.match(urlRegex) || [];
    setUrls([...new Set(found)]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter text:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Paste text containing URLs..."
        />
      </div>

      <button onClick={extract} className="btn w-full" disabled={!input}>
        Extract URLs
      </button>

      {urls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">
              Found {urls.length} {urls.length === 1 ? 'URL' : 'URLs'}:
            </h3>
            <button
              onClick={() => copyToClipboard(urls.join('\n'))}
              className="btn"
            >
              Copy All
            </button>
          </div>
          <div className="bg-slate-900 rounded-xl p-4 space-y-2 max-h-96 overflow-y-auto">
            {urls.map((url, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-slate-800 p-3 rounded-lg"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-mono text-sm break-all"
                >
                  {url}
                </a>
                <button
                  onClick={() => copyToClipboard(url)}
                  className="text-indigo-400 hover:text-indigo-300 ml-2"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


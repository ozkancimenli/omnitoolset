'use client';

import { useState } from 'react';

export default function UrlParser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<any>(null);

  const parse = () => {
    try {
      const url = new URL(input);
      setParsed({
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 'default',
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        href: url.href,
        params: Object.fromEntries(url.searchParams),
      });
    } catch (error) {
      alert('Invalid URL: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter URL:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/path?param=value"
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button onClick={parse} className="btn w-full" disabled={!input}>
        Parse URL
      </button>

      {parsed && (
        <div className="bg-slate-900 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Parsed URL Components:</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="text-slate-100 font-mono">{parsed.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hostname:</span>
              <span className="text-slate-100 font-mono">{parsed.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Port:</span>
              <span className="text-slate-100 font-mono">{parsed.port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pathname:</span>
              <span className="text-slate-100 font-mono">{parsed.pathname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Search:</span>
              <span className="text-slate-100 font-mono">{parsed.search || '(none)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hash:</span>
              <span className="text-slate-100 font-mono">{parsed.hash || '(none)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Origin:</span>
              <span className="text-slate-100 font-mono">{parsed.origin}</span>
            </div>
            {Object.keys(parsed.params).length > 0 && (
              <div className="mt-4">
                <span className="text-slate-400 block mb-2">Query Parameters:</span>
                <div className="bg-slate-800 rounded-lg p-3 space-y-1">
                  {Object.entries(parsed.params).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-indigo-400 font-mono">{key}:</span>
                      <span className="text-slate-100 font-mono">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


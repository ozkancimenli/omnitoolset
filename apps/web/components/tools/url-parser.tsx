'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function UrlParser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState('');

  const parse = () => {
    if (!input.trim()) {
      toast.warning('Please enter a URL first');
      return;
    }

    try {
      let urlString = input.trim();
      if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        urlString = 'https://' + urlString;
      }

      const url = new URL(urlString);
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
        username: url.username || '',
        password: url.password || '',
      });
      setError('');
      toast.success('URL parsed successfully!');
    } catch (error) {
      const errorMsg = 'Invalid URL: ' + (error as Error).message;
      setError(errorMsg);
      setParsed(null);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (input.trim()) {
      try {
        let urlString = input.trim();
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
          urlString = 'https://' + urlString;
        }
        const url = new URL(urlString);
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
          username: url.username || '',
          password: url.password || '',
        });
        setError('');
      } catch {
        setParsed(null);
        setError('');
      }
    } else {
      setParsed(null);
      setError('');
    }
  }, [input]);

  const copyToClipboard = (text: string) => {
    if (!text.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setInput('');
    setParsed(null);
    setError('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="URL Parser"
      description="Parse and analyze URL components"
      icon="🔗"
      helpText="Parse URLs to extract components like protocol, hostname, path, query parameters, and hash. Real-time parsing as you type."
      tips={[
        'Automatically adds https:// if missing',
        'Extracts all URL components',
        'Shows query parameters separately',
        'Real-time parsing',
        'Copy any component to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter URL:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="https://example.com/path?param=value"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={parse} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Parse URL
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        {parsed && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Parsed URL Components:</h3>
              <button
                onClick={() => copyToClipboard(parsed.href)}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
              >
                Copy All
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Protocol:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-mono">{parsed.protocol}</span>
                  <button
                    onClick={() => copyToClipboard(parsed.protocol)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-mono">{parsed.hostname}</span>
                  <button
                    onClick={() => copyToClipboard(parsed.hostname)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Port:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono">{parsed.port}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pathname:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-mono break-all">{parsed.pathname || '/'}</span>
                  <button
                    onClick={() => copyToClipboard(parsed.pathname)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Search:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-mono">{parsed.search || '(none)'}</span>
                  {parsed.search && (
                    <button
                      onClick={() => copyToClipboard(parsed.search)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-mono">{parsed.hash || '(none)'}</span>
                  {parsed.hash && (
                    <button
                      onClick={() => copyToClipboard(parsed.hash)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Origin:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-gray-100 font-mono">{parsed.origin}</span>
                  <button
                    onClick={() => copyToClipboard(parsed.origin)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
              {Object.keys(parsed.params).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400 font-semibold">Query Parameters:</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Object.keys(parsed.params).length} param{Object.keys(parsed.params).length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                    {Object.entries(parsed.params).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">{key}:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{value as string}</span>
                          <button
                            onClick={() => copyToClipboard(`${key}=${value}`)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


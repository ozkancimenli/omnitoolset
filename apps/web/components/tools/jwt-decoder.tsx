'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<{ header: any; payload: any } | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    if (!token.trim()) {
      toast.warning('Please enter a JWT token');
      return;
    }

    setError('');
    setDecoded(null);

    try {
      const parts = token.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT should have 3 parts separated by dots.');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      setDecoded({ header, payload });
      toast.success('JWT decoded successfully!');
    } catch (err) {
      const errorMsg = 'Invalid JWT token: ' + (err as Error).message;
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (token.trim()) {
      try {
        const parts = token.trim().split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          setDecoded({ header, payload });
          setError('');
        } else {
          setDecoded(null);
          setError('');
        }
      } catch {
        setDecoded(null);
        setError('');
      }
    } else {
      setDecoded(null);
      setError('');
    }
  }, [token]);

  const copyToClipboard = (text: string) => {
    if (!text.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setToken('');
    setDecoded(null);
    setError('');
    toast.info('Cleared');
  };

  const isExpired = decoded?.payload?.exp ? new Date(decoded.payload.exp * 1000) < new Date() : false;

  return (
    <ToolBase
      title="JWT Decoder"
      description="Decode and inspect JWT tokens"
      icon="🔓"
      helpText="Decode JWT (JSON Web Token) tokens to view header and payload. See token expiration, issued date, and other claims. Real-time decoding as you type."
      tips={[
        'Decodes JWT header and payload',
        'Shows token expiration status',
        'Displays all token claims',
        'Real-time decoding',
        'Copy decoded JSON to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              JWT Token:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {token.length} characters
            </span>
          </div>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter JWT token (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={decode} 
            disabled={!token}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Decode JWT
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

        {decoded && (
          <div className="space-y-4">
            {isExpired && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-center font-semibold">
                ⚠ Token is expired
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Header:
                </label>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-sm text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payload:
                </label>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto text-sm text-gray-900 dark:text-gray-100 font-mono">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {decoded.payload.exp && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Token Info:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono">
                      {new Date(decoded.payload.exp * 1000).toLocaleString()}
                    </span>
                  </div>
                  {decoded.payload.iat && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Issued At:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-mono">
                        {new Date(decoded.payload.iat * 1000).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {decoded.payload.iss && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Issuer:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-mono">{decoded.payload.iss}</span>
                    </div>
                  )}
                  {decoded.payload.sub && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                      <span className="text-gray-900 dark:text-gray-100 font-mono">{decoded.payload.sub}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolBase>
  );
}

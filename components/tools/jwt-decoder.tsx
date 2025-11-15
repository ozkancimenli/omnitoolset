'use client';

import { useState } from 'react';

export default function JwtDecoder() {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<{ header: any; payload: any } | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    if (!token.trim()) {
      alert('Please enter a JWT token');
      return;
    }

    setError('');
    setDecoded(null);

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. JWT should have 3 parts separated by dots.');
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      setDecoded({ header, payload });
    } catch (err) {
      setError('Invalid JWT token: ' + (err as Error).message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          JWT Token:
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="Enter JWT token (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
        />
      </div>

      <button onClick={decode} className="btn w-full" disabled={!token}>
        Decode JWT
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {decoded && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Header:
              </label>
              <button
                onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                className="text-xs btn px-3 py-1"
              >
                Copy
              </button>
            </div>
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto text-sm text-slate-100">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Payload:
              </label>
              <button
                onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                className="text-xs btn px-3 py-1"
              >
                Copy
              </button>
            </div>
            <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto text-sm text-slate-100">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>

          {decoded.payload.exp && (
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Token Info:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Expires:</span>
                <span className="text-slate-200">
                  {new Date(decoded.payload.exp * 1000).toLocaleString()}
                </span>
              </div>
              {decoded.payload.iat && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Issued At:</span>
                  <span className="text-slate-200">
                    {new Date(decoded.payload.iat * 1000).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

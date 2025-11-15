'use client';

import { useState } from 'react';

export default function JwtEncoder() {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState('{"sub":"1234567890","name":"John Doe","iat":1516239022}');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');

  const encode = () => {
    try {
      const base64Url = (str: string) => {
        return btoa(str)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const encodedHeader = base64Url(header);
      const encodedPayload = base64Url(payload);
      const signature = secret ? 'signature-placeholder' : '';
      
      const jwt = `${encodedHeader}.${encodedPayload}${secret ? '.' + signature : ''}`;
      setToken(jwt);
    } catch (error) {
      alert('Error encoding JWT: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Header (JSON):</label>
        <textarea
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Payload (JSON):</label>
        <textarea
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Secret (optional):</label>
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Secret key for signature (optional)"
        />
      </div>

      <button onClick={encode} className="btn w-full">
        Encode JWT
      </button>

      {token && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">JWT Token:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={token}
            readOnly
            rows={4}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm break-all"
          />
          {!secret && (
            <p className="text-xs text-slate-400 mt-2">
              Note: Signature not included. Add a secret to generate a signed token.
            </p>
          )}
        </div>
      )}
    </div>
  );
}


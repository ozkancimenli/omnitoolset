'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JwtEncoder() {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [payload, setPayload] = useState('{"sub":"1234567890","name":"John Doe","iat":1516239022}');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');

  const encode = () => {
    try {
      JSON.parse(header);
      JSON.parse(payload);
    } catch {
      toast.error('Invalid JSON in header or payload');
      return;
    }

    try {
      const base64Url = (str: string) => {
        return btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };

      const encodedHeader = base64Url(header);
      const encodedPayload = base64Url(payload);
      const signature = secret ? 'signature-placeholder' : '';
      
      const jwt = `${encodedHeader}.${encodedPayload}${secret ? '.' + signature : ''}`;
      setToken(jwt);
      toast.success('JWT encoded successfully!');
    } catch (error) {
      toast.error('Error encoding JWT: ' + (error as Error).message);
    }
  };

  useEffect(() => {
    try {
      JSON.parse(header);
      JSON.parse(payload);
      const base64Url = (str: string) => {
        return btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
      };
      const encodedHeader = base64Url(header);
      const encodedPayload = base64Url(payload);
      const signature = secret ? 'signature-placeholder' : '';
      setToken(`${encodedHeader}.${encodedPayload}${secret ? '.' + signature : ''}`);
    } catch {
      setToken('');
    }
  }, [header, payload, secret]);

  const copyToClipboard = () => {
    if (!token.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(token);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setHeader('{"alg":"HS256","typ":"JWT"}');
    setPayload('{"sub":"1234567890","name":"John Doe","iat":1516239022}');
    setSecret('');
    setToken('');
    toast.info('Cleared');
  };

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ToolBase
      title="JWT Encoder"
      description="Encode JWT tokens from header and payload"
      icon="🔐"
      helpText="Encode JWT (JSON Web Token) from header and payload JSON. Optionally add a secret for signature. Real-time encoding as you type."
      tips={[
        'Enter header and payload as JSON',
        'Secret is optional (for signature)',
        'Real-time encoding',
        'Copy encoded token to clipboard',
        'Use JWT Decoder to verify'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Header (JSON):
            </label>
            {!isValidJson(header) && (
              <span className="text-xs text-red-600 dark:text-red-400">Invalid JSON</span>
            )}
          </div>
          <textarea
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payload (JSON):
            </label>
            {!isValidJson(payload) && (
              <span className="text-xs text-red-600 dark:text-red-400">Invalid JSON</span>
            )}
          </div>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secret (optional):
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Secret key for signature (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={encode} 
            disabled={!isValidJson(header) || !isValidJson(payload)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Encode JWT
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {token && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                JWT Token:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {token.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={token}
                readOnly
                rows={4}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm break-all resize-none focus:outline-none"
              />
            </div>
            {!secret && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-2">
                ⚠ Note: Signature not included. Add a secret to generate a signed token.
              </p>
            )}
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy Token
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


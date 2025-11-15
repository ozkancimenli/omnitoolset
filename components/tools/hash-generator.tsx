'use client';

import { useState } from 'react';

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<'MD5' | 'SHA1' | 'SHA256' | 'SHA512'>('SHA256');
  const [output, setOutput] = useState('');

  const generateHash = async () => {
    if (!input.trim()) {
      alert('Please enter text to hash');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      let hashBuffer: ArrayBuffer;

      switch (algorithm) {
        case 'SHA1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data);
          break;
        case 'SHA256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
          break;
        case 'SHA512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data);
          break;
        case 'MD5':
          // MD5 is not supported by Web Crypto API, use a simple implementation
          setOutput('MD5 is not supported by browser crypto API. Please use SHA256 or SHA1.');
          return;
        default:
          hashBuffer = await crypto.subtle.digest('SHA-256', data);
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
    } catch (error) {
      alert('An error occurred during hashing: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Hash Algorithm:
        </label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as 'MD5' | 'SHA1' | 'SHA256' | 'SHA512')}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
        >
          <option value="SHA256">SHA-256</option>
          <option value="SHA1">SHA-1</option>
          <option value="SHA512">SHA-512</option>
          <option value="MD5">MD5 (Not supported in browser)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enter text to hash:
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter text to generate hash..."
        />
      </div>

      <button onClick={generateHash} className="btn w-full" disabled={!input}>
        Generate Hash
      </button>

      {output && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hash Result ({algorithm}):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={output}
                readOnly
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                         text-slate-100 font-mono text-sm"
              />
              <button onClick={copyToClipboard} className="btn">
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

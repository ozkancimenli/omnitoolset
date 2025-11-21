'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function HmacGenerator() {
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    if (!message || !secret) {
      toast.warning('Please enter both message and secret');
      return;
    }

    setIsGenerating(true);
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const messageData = encoder.encode(message);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
      toast.success('HMAC generated successfully!');
    } catch (error) {
      toast.error('Error generating HMAC: ' + (error as Error).message);
      setOutput('');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!output.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setMessage('');
    setSecret('');
    setOutput('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="HMAC Generator"
      description="Generate HMAC signatures for message authentication"
      icon="🔐"
      helpText="Generate HMAC (Hash-based Message Authentication Code) signatures. Uses cryptographic hash functions to create secure message authentication codes."
      tips={[
        'Enter message and secret key',
        'Choose hash algorithm (SHA-1, SHA-256, SHA-384, SHA-512)',
        'HMAC provides message authentication',
        'Commonly used in APIs and security',
        'Copy signature to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Message:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.length} characters
            </span>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter message..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secret Key:
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter secret key..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Algorithm:
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={generate} 
            disabled={!message || !secret || isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate HMAC'}
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                HMAC Signature:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <input
                type="text"
                value={output}
                readOnly
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm focus:outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy Signature
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


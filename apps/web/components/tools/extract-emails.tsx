'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function ExtractEmails() {
  const [input, setInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);

  const extract = () => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const found = input.match(emailRegex) || [];
    const uniqueEmails = [...new Set(found)];
    
    setEmails(uniqueEmails);
    
    if (uniqueEmails.length === 0) {
      toast.info('No email addresses found');
    } else {
      toast.success(`Found ${uniqueEmails.length} email${uniqueEmails.length > 1 ? 's' : ''}!`);
    }
  };

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
    setEmails([]);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Email Extractor"
      description="Extract email addresses from text"
      icon="📧"
      helpText="Extract all email addresses from any text. Perfect for finding contact information, cleaning up data, or extracting email lists."
      tips={[
        'Automatically finds all email addresses',
        'Removes duplicates automatically',
        'Supports standard email formats',
        'Copy individual or all emails',
        'All processing happens in your browser'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste text containing email addresses..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={extract} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>📧</span>
            <span>Extract Emails</span>
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {emails.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    Found {emails.length} {emails.length === 1 ? 'email' : 'emails'}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(emails.join('\n'))}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Copy All
                </button>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
              {emails.map((email, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-900 dark:text-gray-100 font-mono text-sm break-all">{email}</span>
                  <button
                    onClick={() => copyToClipboard(email)}
                    className="ml-3 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


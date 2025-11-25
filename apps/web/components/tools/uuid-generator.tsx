'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function UuidGenerator() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<'v4' | 'v1'>('v4');

  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const generateUUIDv1 = () => {
    // Simplified v1 UUID (timestamp-based)
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 14);
    return `${timestamp.toString(16).substring(0, 8)}-${timestamp.toString(16).substring(8, 12)}-1${random.substring(0, 3)}-${(Math.random() * 4 | 0).toString(16)}${random.substring(3, 6)}-${random.substring(6)}`;
  };

  const generate = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(version === 'v4' ? generateUUIDv4() : generateUUIDv1());
    }
    setUuids(newUuids);
    toast.success(`Generated ${count} UUID${count > 1 ? 's' : ''}!`);
  };

  const copyToClipboard = (uuid?: string) => {
    const text = uuid || uuids.join('\n');
    if (!text) {
      toast.warning('No UUIDs to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(uuid ? 'UUID copied!' : 'All UUIDs copied!');
  };

  const clear = () => {
    setUuids([]);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="UUID Generator"
      description="Generate unique identifiers (UUIDs) for your applications"
      icon="🆔"
      helpText="Generate UUIDs (Universally Unique Identifiers) for your applications, databases, or any use case. UUIDs are guaranteed to be unique."
      tips={[
        'UUID v4: Random UUIDs (most common)',
        'UUID v1: Time-based UUIDs',
        'Each UUID is guaranteed to be unique',
        'Perfect for database IDs, API keys, and more',
        'Copy individual UUIDs or all at once'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UUID Version:
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as 'v4' | 'v1')}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="v4">UUID v4 (Random)</option>
              <option value="v1">UUID v1 (Time-based)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Count: {count}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {count} UUID{count > 1 ? 's' : ''}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        </div>

        <button 
          onClick={generate} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🆔</span>
          <span>Generate UUID{count > 1 ? 's' : ''}</span>
        </button>

        {uuids.length > 0 && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-green-800 dark:text-green-200 font-medium">
                  ✓ {uuids.length} UUID{uuids.length > 1 ? 's' : ''} generated
                </span>
                <button
                  onClick={() => copyToClipboard()}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
                >
                  Copy All
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {uuids.map((uuid, index) => (
                <div 
                  key={index} 
                  className="flex gap-2 items-center bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium text-sm">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={uuid}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded 
                             text-gray-900 dark:text-gray-100 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(uuid)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={clear}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

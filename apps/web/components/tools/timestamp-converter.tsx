'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const timestampToDate = () => {
    if (!timestamp.trim()) {
      toast.warning('Please enter a timestamp first');
      return;
    }

    const ts = parseInt(timestamp);
    if (isNaN(ts)) {
      toast.error('Invalid timestamp. Please enter a valid Unix timestamp (seconds since epoch)');
      return;
    }

    const d = new Date(ts * 1000);
    if (isNaN(d.getTime())) {
      toast.error('Invalid timestamp. Date is out of range');
      return;
    }

    setResult({
      type: 'timestamp',
      date: d.toLocaleString(),
      iso: d.toISOString(),
      unix: ts,
      utc: d.toUTCString(),
      local: d.toLocaleString(),
    });
    toast.success('Timestamp converted to date!');
  };

  const dateToTimestamp = () => {
    if (!date.trim()) {
      toast.warning('Please enter a date first');
      return;
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      toast.error('Invalid date. Please enter a valid date and time');
      return;
    }

    setResult({
      type: 'date',
      timestamp: Math.floor(d.getTime() / 1000),
      date: d.toLocaleString(),
      iso: d.toISOString(),
      utc: d.toUTCString(),
      local: d.toLocaleString(),
    });
    toast.success('Date converted to timestamp!');
  };

  const useCurrent = () => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 16));
    setTimestamp(Math.floor(now.getTime() / 1000).toString());
    toast.info('Current time loaded');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setTimestamp('');
    setDate('');
    setResult(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Timestamp Converter"
      description="Convert between Unix timestamps and dates"
      icon="⏰"
      helpText="Convert Unix timestamps (seconds since January 1, 1970) to readable dates and vice versa. Supports multiple date formats."
      tips={[
        'Unix timestamp: seconds since Jan 1, 1970',
        'Supports milliseconds (divide by 1000)',
        'Use current time for quick reference',
        'Copy any format to clipboard',
        'All conversions happen in your browser'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unix Timestamp:</label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="1640995200"
            />
            <button 
              onClick={timestampToDate} 
              className="btn w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Convert to Date
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time:</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={dateToTimestamp} 
              className="btn w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Convert to Timestamp
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={useCurrent} 
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Use Current Time
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-3">
            {result.type === 'timestamp' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Unix Timestamp:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-lg font-bold">{result.unix}</span>
                    <button
                      onClick={() => copyToClipboard(result.unix.toString())}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Local Date:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{result.local}</span>
                    <button
                      onClick={() => copyToClipboard(result.local)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">UTC Date:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{result.utc}</span>
                    <button
                      onClick={() => copyToClipboard(result.utc)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ISO 8601:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{result.iso}</span>
                    <button
                      onClick={() => copyToClipboard(result.iso)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </>
            )}
            {result.type === 'date' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Unix Timestamp:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-mono text-xl font-bold">{result.timestamp}</span>
                    <button
                      onClick={() => copyToClipboard(result.timestamp.toString())}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Local Date:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{result.local}</span>
                    <button
                      onClick={() => copyToClipboard(result.local)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">UTC Date:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-sm">{result.utc}</span>
                    <button
                      onClick={() => copyToClipboard(result.utc)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ISO 8601:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{result.iso}</span>
                    <button
                      onClick={() => copyToClipboard(result.iso)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </ToolBase>
  );
}


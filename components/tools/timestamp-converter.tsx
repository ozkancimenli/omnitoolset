'use client';

import { useState } from 'react';

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<any>(null);

  const timestampToDate = () => {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) {
      alert('Invalid timestamp');
      return;
    }
    const d = new Date(ts * 1000);
    setResult({
      type: 'timestamp',
      date: d.toLocaleString(),
      iso: d.toISOString(),
      unix: ts,
    });
  };

  const dateToTimestamp = () => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      alert('Invalid date');
      return;
    }
    setResult({
      type: 'date',
      timestamp: Math.floor(d.getTime() / 1000),
      date: d.toLocaleString(),
      iso: d.toISOString(),
    });
  };

  const useCurrent = () => {
    const now = new Date();
    setDate(now.toISOString().slice(0, 16));
    setTimestamp(Math.floor(now.getTime() / 1000).toString());
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Unix Timestamp:</label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            placeholder="1640995200"
          />
          <button onClick={timestampToDate} className="btn w-full mt-2">Convert to Date</button>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Date & Time:</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button onClick={dateToTimestamp} className="btn w-full mt-2">Convert to Timestamp</button>
        </div>
      </div>
      <button onClick={useCurrent} className="btn w-full bg-slate-700 hover:bg-slate-600">Use Current Time</button>
      {result && (
        <div className="bg-slate-900 rounded-xl p-6 space-y-2">
          {result.type === 'timestamp' && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="text-slate-100 font-mono">{result.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ISO:</span>
                <span className="text-slate-100 font-mono text-sm">{result.iso}</span>
              </div>
            </>
          )}
          {result.type === 'date' && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-400">Unix Timestamp:</span>
                <span className="text-indigo-400 font-mono text-xl">{result.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ISO:</span>
                <span className="text-slate-100 font-mono text-sm">{result.iso}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}


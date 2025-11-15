'use client';

import { useState } from 'react';

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

export default function TimezoneConverter() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('America/New_York');
  const [result, setResult] = useState('');

  const convert = () => {
    try {
      const inputDate = new Date(date);
      const fromDate = new Date(inputDate.toLocaleString('en-US', { timeZone: fromTz }));
      const toDate = new Date(inputDate.toLocaleString('en-US', { timeZone: toTz }));
      
      const fromStr = fromDate.toLocaleString('en-US', { 
        timeZone: fromTz,
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      const toStr = toDate.toLocaleString('en-US', { 
        timeZone: toTz,
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      setResult(`${fromStr}\n\n→\n\n${toStr}`);
    } catch (error) {
      alert('Error converting timezone: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Date & Time:</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">From Timezone:</label>
          <select
            value={fromTz}
            onChange={(e) => setFromTz(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">To Timezone:</label>
          <select
            value={toTz}
            onChange={(e) => setToTz(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={convert} className="btn w-full">
        Convert
      </button>

      {result && (
        <div className="bg-slate-900 rounded-xl p-6">
          <div className="text-slate-100 whitespace-pre-line text-center">{result}</div>
        </div>
      )}
    </div>
  );
}


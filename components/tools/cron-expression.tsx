'use client';

import { useState } from 'react';

export default function CronExpression() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [expression, setExpression] = useState('');

  const generate = () => {
    const cron = `${minute} ${hour} ${day} ${month} ${weekday}`;
    setExpression(cron);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    alert('Copied!');
  };

  const presets = [
    { name: 'Every minute', value: '* * * * *' },
    { name: 'Every hour', value: '0 * * * *' },
    { name: 'Every day at midnight', value: '0 0 * * *' },
    { name: 'Every week (Monday)', value: '0 0 * * 1' },
    { name: 'Every month (1st)', value: '0 0 1 * *' },
  ];

  const applyPreset = (value: string) => {
    const parts = value.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDay(parts[2]);
    setMonth(parts[3]);
    setWeekday(parts[4]);
    setExpression(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Presets:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {presets.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPreset(preset.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors text-sm"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Minute (0-59):</label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="*"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Hour (0-23):</label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="*"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Day (1-31):</label>
          <input
            type="text"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="*"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Month (1-12):</label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="*"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Weekday (0-7):</label>
          <input
            type="text"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            placeholder="*"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      <button onClick={generate} className="btn w-full">
        Generate Cron Expression
      </button>

      {expression && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Cron Expression:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <input
            type="text"
            value={expression}
            readOnly
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-lg text-center"
          />
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function CronExpression() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [expression, setExpression] = useState('');

  const presets = [
    { name: 'Every minute', value: '* * * * *', desc: 'Runs every minute' },
    { name: 'Every hour', value: '0 * * * *', desc: 'Runs at minute 0 of every hour' },
    { name: 'Every day at midnight', value: '0 0 * * *', desc: 'Runs at 00:00 every day' },
    { name: 'Every week (Monday)', value: '0 0 * * 1', desc: 'Runs at 00:00 every Monday' },
    { name: 'Every month (1st)', value: '0 0 1 * *', desc: 'Runs at 00:00 on the 1st of every month' },
    { name: 'Every 5 minutes', value: '*/5 * * * *', desc: 'Runs every 5 minutes' },
    { name: 'Every 30 minutes', value: '*/30 * * * *', desc: 'Runs every 30 minutes' },
    { name: 'Every weekday', value: '0 9 * * 1-5', desc: 'Runs at 09:00 on weekdays' },
  ];

  useEffect(() => {
    const cron = `${minute} ${hour} ${day} ${month} ${weekday}`;
    setExpression(cron);
  }, [minute, hour, day, month, weekday]);

  const generate = () => {
    const cron = `${minute} ${hour} ${day} ${month} ${weekday}`;
    setExpression(cron);
    toast.success('Cron expression generated!');
  };

  const copyToClipboard = () => {
    if (!expression.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(expression);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setMinute('*');
    setHour('*');
    setDay('*');
    setMonth('*');
    setWeekday('*');
    setExpression('* * * * *');
    toast.info('Cleared');
  };

  const applyPreset = (value: string) => {
    const parts = value.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDay(parts[2]);
    setMonth(parts[3]);
    setWeekday(parts[4]);
    setExpression(value);
    toast.success('Preset applied!');
  };

  return (
    <ToolBase
      title="Cron Expression Generator"
      description="Generate cron expressions for scheduling tasks"
      icon="⏰"
      helpText="Generate cron expressions for scheduling tasks. Cron uses 5 fields: minute, hour, day of month, month, and day of week."
      tips={[
        'Use * for any value',
        'Use */n for every n units',
        'Use comma for multiple values (1,3,5)',
        'Use dash for ranges (1-5)',
        'Weekday: 0-7 (0 and 7 = Sunday)'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Presets:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => applyPreset(preset.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-left"
                title={preset.desc}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{preset.value}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minute (0-59):
            </label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="*"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hour (0-23):
            </label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="*"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day (1-31):
            </label>
            <input
              type="text"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="*"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Month (1-12):
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="*"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weekday (0-7):
            </label>
            <input
              type="text"
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
              placeholder="*"
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={generate} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Generate Expression
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {expression && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cron Expression:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {expression.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <input
                type="text"
                value={expression}
                readOnly
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-lg text-center focus:outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy Expression
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


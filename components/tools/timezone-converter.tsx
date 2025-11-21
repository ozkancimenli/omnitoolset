'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
];

export default function TimezoneConverter() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('America/New_York');
  const [result, setResult] = useState('');

  useEffect(() => {
    if (date) {
      convert();
    }
  }, [date, fromTz, toTz]);

  const convert = () => {
    try {
      const inputDate = new Date(date);
      if (isNaN(inputDate.getTime())) {
        toast.warning('Please enter a valid date');
        return;
      }

      const fromStr = inputDate.toLocaleString('en-US', { 
        timeZone: fromTz,
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      const toDate = new Date(inputDate.toLocaleString('en-US', { timeZone: toTz }));
      const toStr = toDate.toLocaleString('en-US', { 
        timeZone: toTz,
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      setResult(`${fromStr}\n\n→\n\n${toStr}`);
      toast.success('Timezone converted!');
    } catch (error) {
      toast.error('Error converting timezone: ' + (error as Error).message);
      setResult('');
    }
  };

  const swapTimezones = () => {
    const temp = fromTz;
    setFromTz(toTz);
    setToTz(temp);
    toast.info('Timezones swapped');
  };

  const useCurrentTime = () => {
    setDate(new Date().toISOString().slice(0, 16));
    toast.info('Current time set');
  };

  return (
    <ToolBase
      title="Timezone Converter"
      description="Convert date and time between different timezones"
      icon="🌍"
      helpText="Convert date and time between different timezones. Real-time conversion as you change timezones or date."
      tips={[
        'Select source and target timezones',
        'Enter date and time',
        'Real-time conversion',
        'Swap timezones quickly',
        'Use current time button'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date & Time:
            </label>
            <button
              onClick={useCurrentTime}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Use Current
            </button>
          </div>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Timezone:
            </label>
            <select
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                To Timezone:
              </label>
              <button
                onClick={swapTimezones}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                title="Swap timezones"
              >
                ↕ Swap
              </button>
            </div>
            <select
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button 
          onClick={convert} 
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Convert
        </button>

        {result && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line text-center font-medium">
              {result}
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function CstToEst() {
  const [cstTime, setCstTime] = useState('');
  const [estTime, setEstTime] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (cstTime) {
      convertTime();
    }
  }, [cstTime, date]);

  const convertTime = () => {
    if (!cstTime) {
      setEstTime('');
      return;
    }

    try {
      // CST is UTC-6, EST is UTC-5 (1 hour difference)
      const [hours, minutes] = cstTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        setEstTime('');
        return;
      }

      // Create date object
      const cstDate = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      
      // CST is UTC-6, EST is UTC-5, so add 1 hour
      const estDate = new Date(cstDate.getTime() + 1 * 60 * 60 * 1000);
      
      const estHours = estDate.getHours();
      const estMinutes = estDate.getMinutes();
      setEstTime(`${String(estHours).padStart(2, '0')}:${String(estMinutes).padStart(2, '0')}`);
    } catch (error) {
      toast.error('Error converting time: ' + (error as Error).message);
      setEstTime('');
    }
  };

  const useCurrentTime = () => {
    const now = new Date();
    const cstTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    setCstTime(`${String(cstTime.getHours()).padStart(2, '0')}:${String(cstTime.getMinutes()).padStart(2, '0')}`);
    setDate(now.toISOString().split('T')[0]);
  };

  const clear = () => {
    setCstTime('');
    setEstTime('');
    setDate(new Date().toISOString().split('T')[0]);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="CST to EST Converter"
      description="Convert Central Standard Time to Eastern Standard Time"
      icon="🕐"
      helpText="Convert Central Standard Time (CST) to Eastern Standard Time (EST). CST is UTC-6, EST is UTC-5, so EST is 1 hour ahead of CST."
      tips={[
        'Enter CST time',
        'Select date',
        'Real-time conversion',
        '1 hour difference',
        'Use current time button'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date:
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CST Time (HH:MM):
          </label>
          <input
            type="time"
            value={cstTime}
            onChange={(e) => setCstTime(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={useCurrentTime}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Use Current CST Time
        </button>

        {estTime && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Eastern Standard Time (EST)</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{estTime}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {cstTime} CST = {estTime} EST
              </p>
            </div>
          </div>
        )}

        <button
          onClick={clear}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>
    </ToolBase>
  );
}


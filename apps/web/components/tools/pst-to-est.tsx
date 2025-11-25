'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function PstToEst() {
  const [pstTime, setPstTime] = useState('');
  const [estTime, setEstTime] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (pstTime) {
      convertTime();
    }
  }, [pstTime, date]);

  const convertTime = () => {
    if (!pstTime) {
      setEstTime('');
      return;
    }

    try {
      // PST is UTC-8, EST is UTC-5 (3 hours difference)
      const [hours, minutes] = pstTime.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        setEstTime('');
        return;
      }

      // Create date object
      const pstDate = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      
      // PST is UTC-8, EST is UTC-5, so add 3 hours
      const estDate = new Date(pstDate.getTime() + 3 * 60 * 60 * 1000);
      
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
    const pstTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
    setPstTime(`${String(pstTime.getHours()).padStart(2, '0')}:${String(pstTime.getMinutes()).padStart(2, '0')}`);
    setDate(now.toISOString().split('T')[0]);
  };

  const clear = () => {
    setPstTime('');
    setEstTime('');
    setDate(new Date().toISOString().split('T')[0]);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="PST to EST Converter"
      description="Convert Pacific Standard Time to Eastern Standard Time"
      icon="🕐"
      helpText="Convert Pacific Standard Time (PST) to Eastern Standard Time (EST). PST is UTC-8, EST is UTC-5, so EST is 3 hours ahead of PST."
      tips={[
        'Enter PST time',
        'Select date',
        'Real-time conversion',
        '3 hours difference',
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
            PST Time (HH:MM):
          </label>
          <input
            type="time"
            value={pstTime}
            onChange={(e) => setPstTime(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={useCurrentTime}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Use Current PST Time
        </button>

        {estTime && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Eastern Standard Time (EST)</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{estTime}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {pstTime} PST = {estTime} EST
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


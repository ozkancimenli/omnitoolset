'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function LbsToKg() {
  const [lbs, setLbs] = useState('');
  const [kg, setKg] = useState<number | null>(null);

  useEffect(() => {
    if (lbs) {
      const pounds = parseFloat(lbs);
      if (!isNaN(pounds)) {
        setKg(pounds * 0.453592);
      } else {
        setKg(null);
      }
    } else {
      setKg(null);
    }
  }, [lbs]);

  const clear = () => {
    setLbs('');
    setKg(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Lbs to Kg Converter"
      description="Convert pounds to kilograms"
      icon="⚖️"
      helpText="Convert pounds (lbs) to kilograms (kg). 1 pound = 0.453592 kilograms. Real-time conversion as you type."
      tips={[
        'Enter weight in pounds',
        'Real-time conversion',
        'Accurate conversion factor',
        '1 lb = 0.453592 kg',
        'Supports decimals'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pounds (lbs):
          </label>
          <input
            type="number"
            value={lbs}
            onChange={(e) => setLbs(e.target.value)}
            placeholder="Enter weight in pounds"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {kg !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Kilograms (kg)</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {kg.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {lbs} lbs = {kg.toFixed(4)} kg
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


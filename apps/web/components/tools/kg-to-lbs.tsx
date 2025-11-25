'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function KgToLbs() {
  const [kg, setKg] = useState('');
  const [lbs, setLbs] = useState<number | null>(null);

  useEffect(() => {
    if (kg) {
      const kilograms = parseFloat(kg);
      if (!isNaN(kilograms)) {
        setLbs(kilograms * 2.20462);
      } else {
        setLbs(null);
      }
    } else {
      setLbs(null);
    }
  }, [kg]);

  const clear = () => {
    setKg('');
    setLbs(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Kg to Lbs Converter"
      description="Convert kilograms to pounds"
      icon="⚖️"
      helpText="Convert kilograms (kg) to pounds (lbs). 1 kilogram = 2.20462 pounds. Real-time conversion as you type."
      tips={[
        'Enter weight in kilograms',
        'Real-time conversion',
        'Accurate conversion factor',
        '1 kg = 2.20462 lbs',
        'Supports decimals'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kilograms (kg):
          </label>
          <input
            type="number"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="Enter weight in kilograms"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {lbs !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pounds (lbs)</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {lbs.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {kg} kg = {lbs.toFixed(4)} lbs
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


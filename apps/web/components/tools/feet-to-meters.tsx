'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function FeetToMeters() {
  const [feet, setFeet] = useState('');
  const [meters, setMeters] = useState<number | null>(null);

  useEffect(() => {
    if (feet) {
      const feetValue = parseFloat(feet);
      if (!isNaN(feetValue)) {
        setMeters(feetValue * 0.3048);
      } else {
        setMeters(null);
      }
    } else {
      setMeters(null);
    }
  }, [feet]);

  const clear = () => {
    setFeet('');
    setMeters(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Feet to Meters Converter"
      description="Convert feet to meters"
      icon="📏"
      helpText="Convert feet (ft) to meters (m). 1 foot = 0.3048 meters. Real-time conversion as you type."
      tips={[
        'Enter length in feet',
        'Real-time conversion',
        'Accurate conversion factor',
        '1 ft = 0.3048 m',
        'Supports decimals'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feet (ft):
          </label>
          <input
            type="number"
            value={feet}
            onChange={(e) => setFeet(e.target.value)}
            placeholder="Enter length in feet"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {meters !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Meters (m)</p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {meters.toFixed(4)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                {feet} ft = {meters.toFixed(4)} m
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


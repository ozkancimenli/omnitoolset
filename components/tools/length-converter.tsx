'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

const lengthUnits = {
  meter: { name: 'Meter (m)', toMeter: 1 },
  kilometer: { name: 'Kilometer (km)', toMeter: 1000 },
  centimeter: { name: 'Centimeter (cm)', toMeter: 0.01 },
  millimeter: { name: 'Millimeter (mm)', toMeter: 0.001 },
  mile: { name: 'Mile (mi)', toMeter: 1609.34 },
  yard: { name: 'Yard (yd)', toMeter: 0.9144 },
  foot: { name: 'Foot (ft)', toMeter: 0.3048 },
  inch: { name: 'Inch (in)', toMeter: 0.0254 },
  nauticalMile: { name: 'Nautical Mile (nmi)', toMeter: 1852 },
};

export default function LengthConverter() {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [result, setResult] = useState<number | null>(null);

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      toast.error('Please enter a valid number');
      return;
    }

    const fromMeters = num * lengthUnits[fromUnit as keyof typeof lengthUnits].toMeter;
    const toMeters = lengthUnits[toUnit as keyof typeof lengthUnits].toMeter;
    const converted = fromMeters / toMeters;
    setResult(converted);
    toast.success('Length converted!');
  };

  useEffect(() => {
    if (value && !isNaN(parseFloat(value))) {
      const num = parseFloat(value);
      const fromMeters = num * lengthUnits[fromUnit as keyof typeof lengthUnits].toMeter;
      const toMeters = lengthUnits[toUnit as keyof typeof lengthUnits].toMeter;
      const converted = fromMeters / toMeters;
      setResult(converted);
    } else {
      setResult(null);
    }
  }, [value, fromUnit, toUnit]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result !== null) {
      setValue(result.toFixed(6));
    }
  };

  const clear = () => {
    setValue('');
    setResult(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Length Converter"
      description="Convert between different length units"
      icon="📏"
      helpText="Convert length between meters, kilometers, centimeters, millimeters, miles, yards, feet, inches, and nautical miles. Real-time conversion as you type."
      tips={[
        'Supports metric and imperial units',
        'Real-time conversion as you type',
        'Swap units with the swap button',
        'High precision calculations',
        'Common units: meter, kilometer, mile, foot, inch'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From:</label>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {Object.entries(lengthUnits).map(([key, unit]) => (
                <option key={key} value={key}>{unit.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To:</label>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              {Object.entries(lengthUnits).map(([key, unit]) => (
                <option key={key} value={key}>{unit.name}</option>
              ))}
            </select>
            <div className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 min-h-[52px] flex items-center">
              {result !== null ? (
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Result will appear here</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={convert} 
            disabled={!value}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert
          </button>
          <button
            onClick={swapUnits}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            title="Swap units"
          >
            ⇄
          </button>
          <button
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {result !== null && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
            <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">
              {value} {lengthUnits[fromUnit as keyof typeof lengthUnits].name} =
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
              {lengthUnits[toUnit as keyof typeof lengthUnits].name}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Common Conversions:</div>
          <div>1 meter = 3.28084 feet = 39.3701 inches</div>
          <div>1 kilometer = 0.621371 miles = 1000 meters</div>
          <div>1 mile = 1.60934 kilometers = 5280 feet</div>
          <div>1 inch = 2.54 centimeters = 0.0254 meters</div>
        </div>
      </div>
    </ToolBase>
  );
}


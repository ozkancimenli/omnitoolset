'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

const temperatureUnits = {
  celsius: { name: 'Celsius (°C)', symbol: '°C' },
  fahrenheit: { name: 'Fahrenheit (°F)', symbol: '°F' },
  kelvin: { name: 'Kelvin (K)', symbol: 'K' },
};

export default function TemperatureConverter() {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('celsius');
  const [toUnit, setToUnit] = useState('fahrenheit');
  const [result, setResult] = useState<number | null>(null);

  const convert = () => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      toast.error('Please enter a valid number');
      return;
    }

    let converted: number;

    // Convert to Celsius first
    let celsius: number;
    if (fromUnit === 'celsius') {
      celsius = num;
    } else if (fromUnit === 'fahrenheit') {
      celsius = (num - 32) * (5 / 9);
    } else {
      celsius = num - 273.15;
    }

    // Convert from Celsius to target unit
    if (toUnit === 'celsius') {
      converted = celsius;
    } else if (toUnit === 'fahrenheit') {
      converted = (celsius * 9) / 5 + 32;
    } else {
      converted = celsius + 273.15;
    }

    setResult(converted);
    toast.success('Temperature converted!');
  };

  useEffect(() => {
    if (value && !isNaN(parseFloat(value))) {
      const num = parseFloat(value);
      let celsius: number;
      if (fromUnit === 'celsius') {
        celsius = num;
      } else if (fromUnit === 'fahrenheit') {
        celsius = (num - 32) * (5 / 9);
      } else {
        celsius = num - 273.15;
      }

      let converted: number;
      if (toUnit === 'celsius') {
        converted = celsius;
      } else if (toUnit === 'fahrenheit') {
        converted = (celsius * 9) / 5 + 32;
      } else {
        converted = celsius + 273.15;
      }

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
      setValue(result.toFixed(2));
    }
  };

  const clear = () => {
    setValue('');
    setResult(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Temperature Converter"
      description="Convert between Celsius, Fahrenheit, and Kelvin"
      icon="🌡️"
      helpText="Convert temperature between Celsius (°C), Fahrenheit (°F), and Kelvin (K). Real-time conversion as you type."
      tips={[
        'Celsius: Water freezes at 0°C, boils at 100°C',
        'Fahrenheit: Water freezes at 32°F, boils at 212°F',
        'Kelvin: Absolute zero is 0K, no negative values',
        'Real-time conversion as you type',
        'Swap units with the swap button'
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
              {Object.entries(temperatureUnits).map(([key, unit]) => (
                <option key={key} value={key}>{unit.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter temperature..."
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
              {Object.entries(temperatureUnits).map(([key, unit]) => (
                <option key={key} value={key}>{unit.name}</option>
              ))}
            </select>
            <div className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 min-h-[52px] flex items-center">
              {result !== null ? (
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                  {temperatureUnits[toUnit as keyof typeof temperatureUnits].symbol}
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
              {value} {temperatureUnits[fromUnit as keyof typeof temperatureUnits].symbol} =
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
              {temperatureUnits[toUnit as keyof typeof temperatureUnits].symbol}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Common Conversions:</div>
          <div>0°C = 32°F = 273.15K (Freezing point of water)</div>
          <div>100°C = 212°F = 373.15K (Boiling point of water)</div>
          <div>37°C = 98.6°F = 310.15K (Human body temperature)</div>
          <div>-40°C = -40°F = 233.15K (Celsius and Fahrenheit equal)</div>
        </div>
      </div>
    </ToolBase>
  );
}


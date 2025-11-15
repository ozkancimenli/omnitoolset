'use client';

import { useState } from 'react';

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
      alert('Please enter a valid number');
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
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result !== null) {
      setValue(result.toString());
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">From:</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 mb-2"
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
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">To:</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 mb-2"
          >
            {Object.entries(temperatureUnits).map(([key, unit]) => (
              <option key={key} value={key}>{unit.name}</option>
            ))}
          </select>
          <div className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 min-h-[52px] flex items-center">
            {result !== null ? (
              <span className="text-2xl font-bold text-indigo-400">
                {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                {temperatureUnits[toUnit as keyof typeof temperatureUnits].symbol}
              </span>
            ) : (
              <span className="text-slate-500">Result will appear here</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={convert} className="btn flex-1" disabled={!value}>
          Convert
        </button>
        <button
          onClick={swapUnits}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
          title="Swap units"
        >
          ⇄
        </button>
      </div>

      {result !== null && (
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-slate-300 text-sm mb-1">
            {value} {temperatureUnits[fromUnit as keyof typeof temperatureUnits].symbol} =
          </div>
          <div className="text-3xl font-bold text-indigo-400">
            {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
            {temperatureUnits[toUnit as keyof typeof temperatureUnits].symbol}
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl p-4 space-y-2 text-sm text-slate-400">
        <div className="font-semibold text-slate-300 mb-2">Common Conversions:</div>
        <div>0°C = 32°F = 273.15K (Freezing point of water)</div>
        <div>100°C = 212°F = 373.15K (Boiling point of water)</div>
        <div>37°C = 98.6°F = 310.15K (Human body temperature)</div>
      </div>
    </div>
  );
}


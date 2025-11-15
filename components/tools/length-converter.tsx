'use client';

import { useState } from 'react';

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
      alert('Please enter a valid number');
      return;
    }

    const fromMeters = num * lengthUnits[fromUnit as keyof typeof lengthUnits].toMeter;
    const toMeters = lengthUnits[toUnit as keyof typeof lengthUnits].toMeter;
    const converted = fromMeters / toMeters;
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
            {Object.entries(lengthUnits).map(([key, unit]) => (
              <option key={key} value={key}>{unit.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter value..."
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
            {Object.entries(lengthUnits).map(([key, unit]) => (
              <option key={key} value={key}>{unit.name}</option>
            ))}
          </select>
          <div className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 min-h-[52px] flex items-center">
            {result !== null ? (
              <span className="text-2xl font-bold text-indigo-400">
                {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
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
            {value} {lengthUnits[fromUnit as keyof typeof lengthUnits].name} =
          </div>
          <div className="text-3xl font-bold text-indigo-400">
            {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}{' '}
            {lengthUnits[toUnit as keyof typeof lengthUnits].name}
          </div>
        </div>
      )}
    </div>
  );
}


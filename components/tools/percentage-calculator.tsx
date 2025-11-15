'use client';

import { useState } from 'react';

export default function PercentageCalculator() {
  const [value, setValue] = useState('');
  const [percentage, setPercentage] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const num = parseFloat(value);
    const perc = parseFloat(percentage);
    if (isNaN(num) || isNaN(perc)) {
      alert('Please enter valid numbers');
      return;
    }
    setResult((num * perc) / 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Value:</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Enter value..."
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Percentage:</label>
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Enter percentage..."
          />
        </div>
      </div>

      <button onClick={calculate} className="btn w-full" disabled={!value || !percentage}>
        Calculate
      </button>

      {result !== null && (
        <div className="bg-slate-900 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-indigo-400 mb-2">{result.toFixed(2)}</div>
          <div className="text-slate-400">
            {percentage}% of {value} = {result.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}


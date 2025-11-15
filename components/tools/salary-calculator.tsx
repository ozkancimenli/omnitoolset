'use client';

import { useState } from 'react';

export default function SalaryCalculator() {
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      alert('Please enter a valid hourly rate');
      return;
    }

    const weekly = rate * hoursPerWeek;
    const monthly = weekly * 4.33; // Average weeks per month
    const yearly = weekly * 52;

    setResults({
      hourly: rate,
      weekly: weekly.toFixed(2),
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
      hoursPerWeek,
    });
  };

  const presets = [20, 30, 40, 50, 60];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-2">Hourly Rate ($):</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="Enter hourly rate..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-2xl text-center"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-2">Hours per Week:</label>
          <div className="flex gap-2 mb-2">
            {presets.map(hours => (
              <button
                key={hours}
                onClick={() => setHoursPerWeek(hours)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  hoursPerWeek === hours
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {hours}h
              </button>
            ))}
          </div>
          <input
            type="number"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="168"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <button onClick={calculate} className="btn w-full" disabled={!hourlyRate}>
        Calculate Salary
      </button>

      {results && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Hourly</div>
                <div className="text-3xl font-bold text-indigo-400">
                  ${parseFloat(results.hourly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Weekly</div>
                <div className="text-3xl font-bold text-indigo-400">
                  ${parseFloat(results.weekly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Monthly</div>
                <div className="text-3xl font-bold text-indigo-400">
                  ${parseFloat(results.monthly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Yearly</div>
                <div className="text-3xl font-bold text-indigo-400">
                  ${parseFloat(results.yearly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 space-y-2 text-sm text-slate-400">
            <div className="font-semibold text-slate-300 mb-2">Calculation Details:</div>
            <div>• Weekly: ${results.hourly} × {results.hoursPerWeek} hours = ${results.weekly}</div>
            <div>• Monthly: ${results.weekly} × 4.33 weeks = ${results.monthly}</div>
            <div>• Yearly: ${results.weekly} × 52 weeks = ${results.yearly}</div>
            <div className="text-xs text-slate-500 mt-2">
              Note: Monthly calculation uses 4.33 weeks per month (average)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


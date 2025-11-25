'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function SalaryCalculator() {
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      toast.warning('Please enter a valid hourly rate');
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
    toast.success('Salary calculated!');
  };

  const presets = [20, 30, 40, 50, 60];

  const clear = () => {
    setHourlyRate('');
    setHoursPerWeek(40);
    setResults(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Salary Calculator"
      description="Calculate salary from hourly rate"
      icon="💰"
      helpText="Calculate weekly, monthly, and yearly salary from an hourly rate. Adjustable hours per week with quick presets."
      tips={[
        'Enter hourly rate',
        'Select hours per week',
        'Calculates weekly, monthly, yearly',
        'Monthly uses 4.33 weeks average',
        'Yearly uses 52 weeks'
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hourly Rate ($):
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="Enter hourly rate..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl text-center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hours per Week:
            </label>
            <div className="flex gap-2 mb-2">
              {presets.map(hours => (
                <button
                  key={hours}
                  onClick={() => setHoursPerWeek(hours)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    hoursPerWeek === hours
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={calculate} 
            disabled={!hourlyRate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Calculate Salary
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Hourly</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${parseFloat(results.hourly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Weekly</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${parseFloat(results.weekly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Monthly</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${parseFloat(results.monthly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Yearly</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${parseFloat(results.yearly).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2 text-sm">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Calculation Details:</div>
              <div className="text-gray-700 dark:text-gray-300">
                • Weekly: ${results.hourly} × {results.hoursPerWeek} hours = ${results.weekly}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                • Monthly: ${results.weekly} × 4.33 weeks = ${results.monthly}
              </div>
              <div className="text-gray-700 dark:text-gray-300">
                • Yearly: ${results.weekly} × 52 weeks = ${results.yearly}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Note: Monthly calculation uses 4.33 weeks per month (average)
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


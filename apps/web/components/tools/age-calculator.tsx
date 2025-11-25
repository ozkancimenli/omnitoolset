'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function AgeCalculator() {
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState<any>(null);

  const calculate = () => {
    if (!birthdate) {
      toast.warning('Please enter a birthdate first');
      return;
    }

    const birth = new Date(birthdate);
    const today = new Date();
    
    if (isNaN(birth.getTime())) {
      toast.error('Please enter a valid date');
      return;
    }

    if (birth > today) {
      toast.error('Birthdate cannot be in the future');
      return;
    }

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalMonths = years * 12 + months;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    setAge({
      years,
      months,
      days,
      totalDays,
      totalMonths,
      totalWeeks,
      totalHours,
      totalMinutes,
    });
    toast.success('Age calculated!');
  };

  useEffect(() => {
    if (birthdate) {
      const birth = new Date(birthdate);
      const today = new Date();
      if (!isNaN(birth.getTime()) && birth <= today) {
        let years = today.getFullYear() - birth.getFullYear();
        let months = today.getMonth() - birth.getMonth();
        let days = today.getDate() - birth.getDate();

        if (days < 0) {
          months--;
          const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          days += lastMonth.getDate();
        }

        if (months < 0) {
          years--;
          months += 12;
        }

        const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        const totalMonths = years * 12 + months;
        const totalWeeks = Math.floor(totalDays / 7);
        const totalHours = totalDays * 24;
        const totalMinutes = totalHours * 60;

        setAge({
          years,
          months,
          days,
          totalDays,
          totalMonths,
          totalWeeks,
          totalHours,
          totalMinutes,
        });
      } else {
        setAge(null);
      }
    } else {
      setAge(null);
    }
  }, [birthdate]);

  const clear = () => {
    setBirthdate('');
    setAge(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Age Calculator"
      description="Calculate your age in years, months, days, and more"
      icon="🎂"
      helpText="Calculate your exact age from birthdate. Shows age in years, months, days, and total time units."
      tips={[
        'Enter your birthdate',
        'Real-time calculation as you select date',
        'Shows detailed breakdown',
        'Includes total days, weeks, months, hours',
        'Birthdate cannot be in the future'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Birthdate:</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={calculate} 
            disabled={!birthdate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Calculate Age
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {age && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">{age.years}</div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">Years Old</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{age.months}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Months</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{age.days}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
              </div>
            </div>
            <div className="pt-4 border-t border-blue-200 dark:border-blue-700 space-y-2 text-sm bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Days:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{age.totalDays.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Weeks:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{age.totalWeeks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Months:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{age.totalMonths.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Hours:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{age.totalHours.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Minutes:</span>
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{age.totalMinutes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


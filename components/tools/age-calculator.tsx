'use client';

import { useState } from 'react';

export default function AgeCalculator() {
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState<any>(null);

  const calculate = () => {
    const birth = new Date(birthdate);
    const today = new Date();
    
    if (isNaN(birth.getTime())) {
      alert('Please enter a valid date');
      return;
    }

    if (birth > today) {
      alert('Birthdate cannot be in the future');
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

    setAge({
      years,
      months,
      days,
      totalDays,
      totalMonths,
      totalWeeks,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Birthdate:</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <button onClick={calculate} className="btn w-full" disabled={!birthdate}>
        Calculate Age
      </button>

      {age && (
        <div className="bg-slate-900 rounded-xl p-6 space-y-4">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-indigo-400 mb-2">{age.years}</div>
            <div className="text-slate-400">Years Old</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-400">{age.months}</div>
              <div className="text-sm text-slate-400">Months</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">{age.days}</div>
              <div className="text-sm text-slate-400">Days</div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-700 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Days:</span>
              <span className="text-slate-300 font-mono">{age.totalDays.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Months:</span>
              <span className="text-slate-300 font-mono">{age.totalMonths}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Weeks:</span>
              <span className="text-slate-300 font-mono">{age.totalWeeks}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


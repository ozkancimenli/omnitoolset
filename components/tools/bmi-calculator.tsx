'use client';

import { useState } from 'react';

export default function BmiCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      alert('Please enter valid height and weight');
      return;
    }

    let bmiValue: number;
    if (unit === 'metric') {
      // kg / (m^2)
      bmiValue = w / ((h / 100) ** 2);
    } else {
      // (lbs * 703) / (inches^2)
      bmiValue = (w * 703) / (h ** 2);
    }

    setBmi(bmiValue);
  };

  const getCategory = (bmiValue: number): { label: string; color: string } => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'blue' };
    if (bmiValue < 25) return { label: 'Normal', color: 'green' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'yellow' };
    return { label: 'Obese', color: 'red' };
  };

  const category = bmi ? getCategory(bmi) : null;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Unit System:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              unit === 'metric'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Metric (kg, cm)
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              unit === 'imperial'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Imperial (lbs, inches)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">
            Height ({unit === 'metric' ? 'cm' : 'inches'}):
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder={unit === 'metric' ? '175' : '70'}
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">
            Weight ({unit === 'metric' ? 'kg' : 'lbs'}):
          </label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder={unit === 'metric' ? '70' : '154'}
          />
        </div>
      </div>

      <button onClick={calculate} className="btn w-full" disabled={!height || !weight}>
        Calculate BMI
      </button>

      {bmi !== null && category && (
        <div className="bg-slate-900 rounded-xl p-6 text-center">
          <div className="text-5xl font-bold text-indigo-400 mb-2">{bmi.toFixed(1)}</div>
          <div className={`text-xl font-semibold text-${category.color}-400 mb-4`}>
            {category.label}
          </div>
          <div className="text-sm text-slate-400 space-y-1">
            <div>Underweight: &lt; 18.5</div>
            <div>Normal: 18.5 - 24.9</div>
            <div>Overweight: 25 - 29.9</div>
            <div>Obese: ≥ 30</div>
          </div>
        </div>
      )}
    </div>
  );
}


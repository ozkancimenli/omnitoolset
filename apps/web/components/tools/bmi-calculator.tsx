'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function BmiCalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      toast.error('Please enter valid height and weight');
      return;
    }

    let bmiValue: number;
    if (unit === 'metric') {
      bmiValue = w / ((h / 100) ** 2);
    } else {
      bmiValue = (w * 703) / (h ** 2);
    }

    setBmi(bmiValue);
    toast.success('BMI calculated!');
  };

  useEffect(() => {
    if (height && weight) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
        let bmiValue: number;
        if (unit === 'metric') {
          bmiValue = w / ((h / 100) ** 2);
        } else {
          bmiValue = (w * 703) / (h ** 2);
        }
        setBmi(bmiValue);
      } else {
        setBmi(null);
      }
    } else {
      setBmi(null);
    }
  }, [height, weight, unit]);

  const getCategory = (bmiValue: number): { label: string; color: string; bgColor: string } => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' };
    if (bmiValue < 25) return { label: 'Normal', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' };
    if (bmiValue < 30) return { label: 'Overweight', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' };
    return { label: 'Obese', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' };
  };

  const category = bmi ? getCategory(bmi) : null;

  const clear = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="BMI Calculator"
      description="Calculate your Body Mass Index (BMI)"
      icon="⚖️"
      helpText="Calculate your Body Mass Index (BMI) using metric (kg, cm) or imperial (lbs, inches) units. BMI is a measure of body fat based on height and weight."
      tips={[
        'Metric: weight in kg, height in cm',
        'Imperial: weight in lbs, height in inches',
        'BMI categories: Underweight, Normal, Overweight, Obese',
        'Real-time calculation as you type',
        'BMI is a screening tool, not a diagnostic'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit System:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setUnit('metric')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                unit === 'metric'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setUnit('imperial')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                unit === 'imperial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Imperial (lbs, in)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height ({unit === 'metric' ? 'cm' : 'inches'}):
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={unit === 'metric' ? '175' : '70'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'}):
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={unit === 'metric' ? '70' : '154'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={calculate} 
            disabled={!height || !weight}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Calculate BMI
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {bmi !== null && category && (
          <div className={`${category.bgColor} border rounded-lg p-6 text-center`}>
            <div className={`text-5xl font-bold ${category.color} mb-2`}>{bmi.toFixed(1)}</div>
            <div className={`text-xl font-semibold ${category.color} mb-4`}>
              {category.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 bg-white dark:bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between">
                <span>Underweight:</span>
                <span className="font-mono">&lt; 18.5</span>
              </div>
              <div className="flex justify-between">
                <span>Normal:</span>
                <span className="font-mono">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between">
                <span>Overweight:</span>
                <span className="font-mono">25 - 29.9</span>
              </div>
              <div className="flex justify-between">
                <span>Obese:</span>
                <span className="font-mono">≥ 30</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


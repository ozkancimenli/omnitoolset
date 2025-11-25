'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [people, setPeople] = useState(1);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const billAmount = parseFloat(bill);
    if (isNaN(billAmount) || billAmount <= 0) {
      toast.error('Please enter a valid bill amount');
      return;
    }

    const tipAmount = (billAmount * tipPercent) / 100;
    const total = billAmount + tipAmount;
    const perPerson = total / people;

    setResults({
      tipAmount: tipAmount.toFixed(2),
      total: total.toFixed(2),
      perPerson: perPerson.toFixed(2),
    });
    toast.success('Tip calculated!');
  };

  useEffect(() => {
    if (bill) {
      const billAmount = parseFloat(bill);
      if (!isNaN(billAmount) && billAmount > 0) {
        const tipAmount = (billAmount * tipPercent) / 100;
        const total = billAmount + tipAmount;
        const perPerson = total / people;
        setResults({
          tipAmount: tipAmount.toFixed(2),
          total: total.toFixed(2),
          perPerson: perPerson.toFixed(2),
        });
      } else {
        setResults(null);
      }
    } else {
      setResults(null);
    }
  }, [bill, tipPercent, people]);

  const clear = () => {
    setBill('');
    setTipPercent(15);
    setPeople(1);
    setResults(null);
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Tip Calculator"
      description="Calculate tip amount and split bill among people"
      icon="💰"
      helpText="Calculate tip amount based on bill total and tip percentage. Split the total bill among multiple people."
      tips={[
        'Enter bill amount in dollars',
        'Select tip percentage or enter custom',
        'Split bill among multiple people',
        'Real-time calculation as you type',
        'Common tip percentages: 15%, 18%, 20%'
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bill Amount ($):</label>
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            step="0.01"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tip Percentage:</label>
          <div className="flex gap-2 mb-2">
            {[10, 15, 18, 20, 25].map(perc => (
              <button
                key={perc}
                onClick={() => setTipPercent(perc)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tipPercent === perc
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {perc}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={tipPercent}
            onChange={(e) => setTipPercent(Math.max(0, Math.min(100, parseInt(e.target.value) || 15)))}
            min="0"
            max="100"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of People:</label>
          <input
            type="number"
            value={people}
            onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          onClick={calculate} 
          disabled={!bill}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          Calculate
        </button>

        {results && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">Tip Amount:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">${results.tipAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Total:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold text-2xl">${results.total}</span>
            </div>
            {people > 1 && (
              <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-gray-700 dark:text-gray-300">Per Person:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">${results.perPerson}</span>
              </div>
            )}
          </div>
        )}

        <button 
          onClick={clear}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>
    </ToolBase>
  );
}


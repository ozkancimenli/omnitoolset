'use client';

import { useState } from 'react';

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [people, setPeople] = useState(1);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const billAmount = parseFloat(bill);
    if (isNaN(billAmount) || billAmount <= 0) {
      alert('Please enter a valid bill amount');
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
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-2">Bill Amount ($):</label>
          <input
            type="number"
            value={bill}
            onChange={(e) => setBill(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Tip Percentage:</label>
          <div className="flex gap-2 mb-2">
            {[10, 15, 18, 20, 25].map(perc => (
              <button
                key={perc}
                onClick={() => setTipPercent(perc)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  tipPercent === perc
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {perc}%
              </button>
            ))}
          </div>
          <input
            type="number"
            value={tipPercent}
            onChange={(e) => setTipPercent(parseInt(e.target.value) || 15)}
            min="0"
            max="100"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Number of People:</label>
          <input
            type="number"
            value={people}
            onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <button onClick={calculate} className="btn w-full" disabled={!bill}>
        Calculate
      </button>

      {results && (
        <div className="bg-slate-900 rounded-xl p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-slate-300">Tip Amount:</span>
            <span className="text-indigo-400 font-bold">${results.tipAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Total:</span>
            <span className="text-indigo-400 font-bold text-xl">${results.total}</span>
          </div>
          {people > 1 && (
            <div className="flex justify-between pt-4 border-t border-slate-700">
              <span className="text-slate-300">Per Person:</span>
              <span className="text-indigo-400 font-bold">${results.perPerson}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


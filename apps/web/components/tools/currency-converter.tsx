'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch exchange rate
  const fetchExchangeRate = async () => {
    if (fromCurrency === toCurrency) {
      setResult(parseFloat(amount) || 0);
      setExchangeRate(1);
      return;
    }

    setIsLoading(true);
    try {
      // Using a free API (you can replace with your preferred API)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const data = await response.json();
      
      if (data.rates && data.rates[toCurrency]) {
        const rate = data.rates[toCurrency];
        setExchangeRate(rate);
        setResult((parseFloat(amount) || 0) * rate);
        setLastUpdated(new Date().toLocaleString());
      } else {
        throw new Error('Exchange rate not found');
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      toast.error('Failed to fetch exchange rate. Using approximate values.');
      // Fallback: Use approximate rates (for demo purposes)
      const approximateRates: Record<string, Record<string, number>> = {
        USD: { EUR: 0.92, GBP: 0.79, JPY: 149, AUD: 1.52, CAD: 1.35, CHF: 0.88, CNY: 7.24, INR: 83, BRL: 4.95, MXN: 17.2, RUB: 92, KRW: 1320, TRY: 32, ZAR: 18.5 },
        EUR: { USD: 1.09, GBP: 0.86, JPY: 162, AUD: 1.65, CAD: 1.47, CHF: 0.96, CNY: 7.88, INR: 90, BRL: 5.38, MXN: 18.7, RUB: 100, KRW: 1435, TRY: 35, ZAR: 20.1 },
      };
      
      const rate = approximateRates[fromCurrency]?.[toCurrency] || 1;
      setExchangeRate(rate);
      setResult((parseFloat(amount) || 0) * rate);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (amount) {
      fetchExchangeRate();
    }
  }, [fromCurrency, toCurrency, amount]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <ToolBase
      title="Currency Converter"
      description="Convert between different currencies"
      icon="💱"
      helpText="Convert between different currencies using real-time exchange rates. Fetches rates from a free API. For production use, consider using a paid API service for accurate, real-time rates."
      tips={[
        'Enter amount to convert',
        'Select source and target currencies',
        'Real-time exchange rates',
        'Swap currencies quickly',
        'Supports 15+ currencies'
      ]}
      isProcessing={isLoading}
    >
      <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 text-lg"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Currency
          </label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Swap currencies"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          To Currency
        </label>
        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Fetching exchange rate...</p>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Converted Amount</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {result !== null ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {CURRENCIES.find(c => c.code === toCurrency)?.symbol} {result !== null ? result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </p>
            {exchangeRate && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </p>
            )}
            {lastUpdated && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
        </div>
      )}

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠ <strong>Note:</strong> Exchange rates are fetched from a free API and may not reflect real-time market rates. 
            For production use, consider using a paid API service for accurate, real-time rates.
          </p>
        </div>
      </div>
    </ToolBase>
  );
}


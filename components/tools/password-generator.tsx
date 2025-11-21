'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const generatePassword = () => {
    let charset = '';
    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      toast.error('Please select at least one character type!');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
    toast.success('Password generated!');
  };

  useEffect(() => {
    generatePassword();
  }, []);

  const copyPassword = () => {
    if (!password) {
      toast.warning('No password to copy!');
      return;
    }
    navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard!');
  };

  const getStrength = () => {
    let strength = 0;
    if (length >= 8) strength += 1;
    if (length >= 12) strength += 1;
    if (length >= 16) strength += 1;
    if (length >= 20) strength += 1;
    if (includeUppercase) strength += 1;
    if (includeLowercase) strength += 1;
    if (includeNumbers) strength += 1;
    if (includeSymbols) strength += 1;

    if (strength <= 3) return { level: 'Weak', color: 'red', bgColor: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' };
    if (strength <= 5) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' };
    if (strength <= 7) return { level: 'Strong', color: 'green', bgColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400' };
    return { level: 'Very Strong', color: 'green', bgColor: 'bg-green-600', textColor: 'text-green-700 dark:text-green-300' };
  };

  const strength = getStrength();
  const strengthWidth = Math.min((getStrength().level === 'Weak' ? 33 : getStrength().level === 'Medium' ? 66 : getStrength().level === 'Strong' ? 90 : 100), 100);

  return (
    <ToolBase
      title="Password Generator"
      description="Generate secure, random passwords with customizable options"
      icon="🔐"
      helpText="Create strong, secure passwords with customizable length and character types. Perfect for accounts, applications, and security."
      tips={[
        'Longer passwords are more secure (16+ recommended)',
        'Include multiple character types for better security',
        'Avoid using personal information in passwords',
        'Use different passwords for different accounts',
        'Consider using a password manager'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password Length: {length}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {length < 8 ? 'Weak' : length < 12 ? 'Medium' : length < 16 ? 'Good' : 'Strong'}
              </span>
            </div>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Uppercase Letters (A-Z)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Lowercase Letters (a-z)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700 dark:text-gray-300">Special Characters (!@#$%^&*)</span>
            </label>
          </div>
        </div>

        <button 
          onClick={generatePassword} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🔐</span>
          <span>Generate Password</span>
        </button>

        {password && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Generated Password:
              </label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg 
                           text-gray-900 dark:text-gray-100 font-mono text-lg"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                <button 
                  onClick={copyPassword} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Strength</span>
                <span className={`text-sm font-semibold ${strength.textColor}`}>
                  {strength.level}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`${strength.bgColor} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${strengthWidth}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Length: {length} • Types: {[includeUppercase, includeLowercase, includeNumbers, includeSymbols].filter(Boolean).length}/4
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

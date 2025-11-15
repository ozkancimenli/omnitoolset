'use client';

import { useState, useEffect } from 'react';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');

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
      alert('Please select at least one character type!');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  useEffect(() => {
    generatePassword();
  }, []);

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    alert('Password copied!');
  };

  const getStrength = () => {
    let strength = 0;
    if (length >= 8) strength += 1;
    if (length >= 12) strength += 1;
    if (length >= 16) strength += 1;
    if (includeUppercase) strength += 1;
    if (includeLowercase) strength += 1;
    if (includeNumbers) strength += 1;
    if (includeSymbols) strength += 1;

    if (strength <= 3) return { level: 'Weak', color: 'red', width: '33%' };
    if (strength <= 5) return { level: 'Medium', color: 'yellow', width: '66%' };
    return { level: 'Strong', color: 'green', width: '100%' };
  };

  const strength = getStrength();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
            Password Length: {length}
        </label>
        <input
          type="range"
          min="4"
          max="128"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <span className="text-slate-300">Uppercase Letters (A-Z)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={(e) => setIncludeLowercase(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <span className="text-slate-300">Lowercase Letters (a-z)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <span className="text-slate-300">Numbers (0-9)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="w-5 h-5 rounded"
          />
          <span className="text-slate-300">Special Characters (!@#$%^&*)</span>
        </label>
      </div>

      <button onClick={generatePassword} className="btn w-full">
        Generate Password
      </button>

      {password && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Generated Password:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                readOnly
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                         text-slate-100 font-mono text-lg"
              />
              <button onClick={copyPassword} className="btn">
                Copy
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Şifre Güvenliği</span>
              <span className={`text-sm font-semibold text-${strength.color}-400`}>
                {strength.level}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`bg-${strength.color}-500 h-2 rounded-full transition-all`}
                style={{ width: strength.width }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

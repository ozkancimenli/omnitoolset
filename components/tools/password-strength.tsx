'use client';

import { useState, useMemo } from 'react';

export default function PasswordStrength() {
  const [password, setPassword] = useState('');

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['red', 'orange', 'yellow', 'lime', 'green', 'emerald'];
    
    return {
      score,
      label: labels[Math.min(score, 5)],
      color: colors[Math.min(score, 5)],
    };
  }, [password]);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      lime: 'bg-lime-500',
      green: 'bg-green-500',
      emerald: 'bg-emerald-500',
    };
    return colors[color] || 'bg-slate-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Enter password to check..."
        />
      </div>

      {password && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300">Strength:</span>
              <span className={`font-semibold text-${strength.color}-400`}>
                {strength.label}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${getColorClass(strength.color)}`}
                style={{ width: `${(strength.score / 6) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 space-y-2">
            <h3 className="text-slate-300 font-semibold mb-2">Requirements:</h3>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-400' : 'text-slate-400'}`}>
                {password.length >= 8 ? '✓' : '○'} At least 8 characters
              </div>
              <div className={`flex items-center gap-2 ${password.length >= 12 ? 'text-green-400' : 'text-slate-400'}`}>
                {password.length >= 12 ? '✓' : '○'} At least 12 characters
              </div>
              <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                {/[a-z]/.test(password) ? '✓' : '○'} Lowercase letter
              </div>
              <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase letter
              </div>
              <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                {/[0-9]/.test(password) ? '✓' : '○'} Number
              </div>
              <div className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} Special character
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


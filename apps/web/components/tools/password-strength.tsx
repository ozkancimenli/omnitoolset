'use client';

import { useState, useMemo } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function PasswordStrength() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '', percentage: 0 };

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
      percentage: (score / 6) * 100,
    };
  }, [password]);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      red: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
      lime: { bg: 'bg-lime-500', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-200 dark:border-lime-800' },
      green: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    };
    return colors[color] || { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' };
  };

  const copyToClipboard = () => {
    if (!password.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(password);
    toast.success('Password copied to clipboard!');
  };

  const clear = () => {
    setPassword('');
    toast.info('Cleared');
  };

  const colorClasses = password ? getColorClasses(strength.color) : { bg: 'bg-gray-500', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' };

  return (
    <ToolBase
      title="Password Strength Checker"
      description="Check password strength and security requirements"
      icon="🔒"
      helpText="Check the strength of your password. Analyzes length, character types, and provides security recommendations."
      tips={[
        'Real-time strength analysis',
        'Checks 6 security criteria',
        'Shows detailed requirements',
        'Strong passwords are harder to crack',
        'Use a mix of character types'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter password:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {password.length} characters
            </span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password to check..."
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {password && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Strength:</span>
                <span className={`font-semibold ${colorClasses.text}`}>
                  {strength.label || 'Very Weak'}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${colorClasses.bg}`}
                  style={{ width: `${strength.percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {strength.score}/6 criteria met
              </div>
            </div>

            <div className={`bg-white dark:bg-gray-900 border ${colorClasses.border} rounded-lg p-4`}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Requirements:</h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="font-bold">{password.length >= 8 ? '✓' : '○'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${password.length >= 12 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="font-bold">{password.length >= 12 ? '✓' : '○'}</span>
                  <span>At least 12 characters (recommended)</span>
                </div>
                <div className={`flex items-center gap-2 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="font-bold">{/[a-z]/.test(password) ? '✓' : '○'}</span>
                  <span>Lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="font-bold">{/[A-Z]/.test(password) ? '✓' : '○'}</span>
                  <span>Uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="font-bold">{/[0-9]/.test(password) ? '✓' : '○'}</span>
                  <span>Number (0-9)</span>
                </div>
                <div className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="font-bold">{/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'}</span>
                  <span>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Copy Password
              </button>
              <button 
                onClick={clear}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


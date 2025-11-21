'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function ContrastChecker() {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [ratio, setRatio] = useState<number | null>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  useEffect(() => {
    calculateContrast();
  }, [foreground, background]);

  const calculateContrast = () => {
    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);
    if (!fg || !bg) {
      setRatio(null);
      return;
    }
    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const r = (lighter + 0.05) / (darker + 0.05);
    setRatio(r);
  };

  const getRating = (r: number) => {
    if (r >= 7) return { label: 'AAA (Large)', color: 'green', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800', textColor: 'text-green-600 dark:text-green-400' };
    if (r >= 4.5) return { label: 'AA (Large) / AAA (Normal)', color: 'green', bgColor: 'bg-green-50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800', textColor: 'text-green-600 dark:text-green-400' };
    if (r >= 3) return { label: 'AA (Normal)', color: 'yellow', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20', borderColor: 'border-yellow-200 dark:border-yellow-800', textColor: 'text-yellow-600 dark:text-yellow-400' };
    return { label: 'Fail', color: 'red', bgColor: 'bg-red-50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800', textColor: 'text-red-600 dark:text-red-400' };
  };

  const swapColors = () => {
    const temp = foreground;
    setForeground(background);
    setBackground(temp);
    toast.info('Colors swapped');
  };

  return (
    <ToolBase
      title="Contrast Checker"
      description="Check color contrast ratio for accessibility"
      icon="🎨"
      helpText="Check the contrast ratio between foreground and background colors. Ensures WCAG accessibility compliance (AA/AAA standards)."
      tips={[
        'Select foreground and background colors',
        'Real-time contrast calculation',
        'WCAG AA/AAA compliance check',
        'Visual preview of colors',
        'Swap colors quickly'
      ]}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Foreground Color:
            </label>
            <input 
              type="color" 
              value={foreground} 
              onChange={(e) => setForeground(e.target.value)} 
              className="w-full h-16 rounded-lg cursor-pointer"
            />
            <input 
              type="text" 
              value={foreground} 
              onChange={(e) => setForeground(e.target.value)} 
              className="w-full mt-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Color:
            </label>
            <input 
              type="color" 
              value={background} 
              onChange={(e) => setBackground(e.target.value)} 
              className="w-full h-16 rounded-lg cursor-pointer"
            />
            <input 
              type="text" 
              value={background} 
              onChange={(e) => setBackground(e.target.value)} 
              className="w-full mt-2 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button 
          onClick={swapColors}
          className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          ↕ Swap Colors
        </button>

        {ratio !== null && (
          <div className="space-y-4">
            <div 
              className="rounded-lg p-6 text-center border-2"
              style={{ backgroundColor: background, color: foreground }}
            >
              <div className="text-4xl font-bold mb-2">{ratio.toFixed(2)}:1</div>
              <div className="text-lg font-semibold">{getRating(ratio).label}</div>
            </div>
            <div className={`${getRating(ratio).bgColor} ${getRating(ratio).borderColor} border rounded-lg p-4`}>
              <div className="text-sm space-y-1">
                <p className={`font-semibold ${getRating(ratio).textColor}`}>
                  WCAG Compliance: {getRating(ratio).label}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Contrast Ratio: <span className="font-mono font-semibold">{ratio.toFixed(2)}:1</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {ratio >= 7 && '✅ Meets AAA standards for large text'}
                  {ratio >= 4.5 && ratio < 7 && '✅ Meets AA standards for large text and AAA for normal text'}
                  {ratio >= 3 && ratio < 4.5 && '⚠️ Meets AA standards for normal text only'}
                  {ratio < 3 && '❌ Does not meet WCAG standards'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


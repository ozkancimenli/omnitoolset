'use client';

import { useState } from 'react';

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

  const calculateContrast = () => {
    const fg = hexToRgb(foreground);
    const bg = hexToRgb(background);
    if (!fg || !bg) return;
    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const r = (lighter + 0.05) / (darker + 0.05);
    setRatio(r);
  };

  const getRating = (r: number) => {
    if (r >= 7) return { label: 'AAA (Large)', color: 'green' };
    if (r >= 4.5) return { label: 'AA (Large) / AAA (Normal)', color: 'green' };
    if (r >= 3) return { label: 'AA (Normal)', color: 'yellow' };
    return { label: 'Fail', color: 'red' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Foreground Color:</label>
          <input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="w-full h-16 rounded-xl" />
          <input type="text" value={foreground} onChange={(e) => setForeground(e.target.value)} className="w-full mt-2 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono" />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Background Color:</label>
          <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full h-16 rounded-xl" />
          <input type="text" value={background} onChange={(e) => setBackground(e.target.value)} className="w-full mt-2 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono" />
        </div>
      </div>
      <button onClick={calculateContrast} className="btn w-full">Check Contrast</button>
      {ratio !== null && (
        <div className="bg-slate-900 rounded-xl p-6 text-center" style={{ backgroundColor: background, color: foreground }}>
          <div className="text-4xl font-bold mb-2">{ratio.toFixed(2)}:1</div>
          <div className={`text-lg font-semibold text-${getRating(ratio).color}-400`}>{getRating(ratio).label}</div>
        </div>
      )}
    </div>
  );
}


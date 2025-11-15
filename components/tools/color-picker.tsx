'use client';

import { useState } from 'react';

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    setRgb(hexToRgb(newColor));
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [component]: Math.max(0, Math.min(255, value)) };
    setRgb(newRgb);
    setColor(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div
          className="w-full h-32 rounded-lg border-4 border-slate-700 mx-auto"
          style={{ backgroundColor: color }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Color Picker:
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-20 h-12 rounded cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => {
              if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                setColor(e.target.value);
                setRgb(hexToRgb(e.target.value));
              }
            }}
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg 
                     text-slate-100 font-mono"
            placeholder="#000000"
          />
          <button onClick={() => copyToClipboard(color)} className="btn">
            Copy Hex
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          RGB Values:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['r', 'g', 'b'] as const).map((component) => (
            <div key={component}>
              <label className="block text-xs text-slate-400 mb-1 uppercase">
                {component}
              </label>
              <input
                type="number"
                min="0"
                max="255"
                value={rgb[component]}
                onChange={(e) => handleRgbChange(component, parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg 
                         text-slate-100"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
            readOnly
            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg 
                     text-slate-100 font-mono text-sm"
          />
          <button onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="btn">
            Copy RGB
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Color Formats:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Hex:</span>
            <div className="flex gap-2 items-center">
              <span className="text-slate-200 font-mono">{color}</span>
              <button onClick={() => copyToClipboard(color)} className="text-xs btn px-2 py-1">
                Copy
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">RGB:</span>
            <div className="flex gap-2 items-center">
              <span className="text-slate-200 font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
              <button onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} className="text-xs btn px-2 py-1">
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

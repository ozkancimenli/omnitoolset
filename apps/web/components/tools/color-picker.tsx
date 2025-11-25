'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

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

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
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
    if (!text.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return (
    <ToolBase
      title="Color Picker"
      description="Pick colors and convert between formats"
      icon="🎨"
      helpText="Pick colors using a visual color picker or enter hex/RGB values. Convert between hex, RGB, and HSL formats."
      tips={[
        'Visual color picker',
        'Enter hex or RGB values',
        'Convert between formats',
        'Copy any format to clipboard',
        'Real-time conversion'
      ]}
    >
      <div className="space-y-4">
        <div className="text-center">
          <div
            className="w-full h-32 rounded-lg border-4 border-gray-300 dark:border-gray-700 mx-auto shadow-lg"
            style={{ backgroundColor: color }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Picker:
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="w-20 h-12 rounded cursor-pointer border border-gray-300 dark:border-gray-700"
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
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
            <button 
              onClick={() => copyToClipboard(color)} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Copy Hex
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            RGB Values:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['r', 'g', 'b'] as const).map((component) => (
              <div key={component}>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 uppercase font-semibold">
                  {component}
                </label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb[component]}
                  onChange={(e) => handleRgbChange(component, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                           text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
              readOnly
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 font-mono text-sm"
            />
            <button 
              onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Copy RGB
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Color Formats:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Hex:</span>
              <div className="flex gap-2 items-center">
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">{color.toUpperCase()}</span>
                <button 
                  onClick={() => copyToClipboard(color)} 
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">RGB:</span>
              <div className="flex gap-2 items-center">
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
                <button 
                  onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} 
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">HSL:</span>
              <div className="flex gap-2 items-center">
                <span className="text-gray-900 dark:text-gray-100 font-mono font-semibold">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
                <button 
                  onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)} 
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolBase>
  );
}

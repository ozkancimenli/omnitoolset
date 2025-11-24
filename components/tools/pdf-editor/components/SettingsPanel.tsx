'use client';

import React from 'react';
import { toast } from '@/components/Toast';

interface Settings {
  autoSave: boolean;
  autoSaveInterval: number;
  defaultZoom: string;
  defaultFontSize: number;
  defaultFontFamily: string;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showTooltips: boolean;
  enableAnimations: boolean;
  exportQuality: string;
  exportFormat: string;
}

interface SettingsPanelProps {
  show: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  show,
  onClose,
  settings,
  setSettings,
}) => {
  if (!show) return null;

  const handleReset = () => {
    setSettings({
      autoSave: false,
      autoSaveInterval: 30,
      defaultZoom: 'fit-page',
      defaultFontSize: 16,
      defaultFontFamily: 'Arial',
      showGrid: false,
      snapToGrid: false,
      gridSize: 20,
      showRulers: false,
      showTooltips: true,
      enableAnimations: true,
      exportQuality: 'high',
      exportFormat: 'pdf',
    });
    toast.success('Settings reset to defaults');
  };

  const handleSave = () => {
    onClose();
    toast.success('Settings saved');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Auto-save</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.autoSave} onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Enable auto-save</span>
              </label>
              {settings.autoSave && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-700 dark:text-slate-300">Interval (seconds):</label>
                  <input type="number" value={settings.autoSaveInterval} onChange={(e) => setSettings({ ...settings, autoSaveInterval: Number(e.target.value) })} min="10" max="300" className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" />
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Display</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300 w-32">Default Zoom:</label>
                <select value={settings.defaultZoom} onChange={(e) => setSettings({ ...settings, defaultZoom: e.target.value })} className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm">
                  <option value="fit-page">Fit Page</option>
                  <option value="fit-width">Fit Width</option>
                  <option value="fit-height">Fit Height</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.showGrid} onChange={(e) => setSettings({ ...settings, showGrid: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Show grid</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.showRulers} onChange={(e) => setSettings({ ...settings, showRulers: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Show rulers</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.showTooltips} onChange={(e) => setSettings({ ...settings, showTooltips: e.target.checked })} className="rounded" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Show tooltips</span>
              </label>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Default Values</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300 w-32">Font Size:</label>
                <input type="number" value={settings.defaultFontSize} onChange={(e) => setSettings({ ...settings, defaultFontSize: Number(e.target.value) })} min="8" max="72" className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300 w-32">Font Family:</label>
                <select value={settings.defaultFontFamily} onChange={(e) => setSettings({ ...settings, defaultFontFamily: e.target.value })} className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm">
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-300 dark:border-slate-600"></div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Export</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300 w-32">Quality:</label>
                <select value={settings.exportQuality} onChange={(e) => setSettings({ ...settings, exportQuality: e.target.value })} className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm">
                  <option value="low">Low (Smaller file)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Best quality)</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700 dark:text-slate-300 w-32">Format:</label>
                <select value={settings.exportFormat} onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value })} className="flex-1 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-sm">
                  <option value="pdf">PDF</option>
                  <option value="pdf-a">PDF/A (Archival)</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 dark:border-slate-600">
            <button onClick={handleReset} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
              Reset to Defaults
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};





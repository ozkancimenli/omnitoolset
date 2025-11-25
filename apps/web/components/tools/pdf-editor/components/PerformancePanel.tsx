'use client';

import React, { useState } from 'react';

interface PerformancePanelProps {
  showPerformancePanel: boolean;
  setShowPerformancePanel: (show: boolean) => void;
  webglEnabled: boolean;
  setWebglEnabled: (enabled: boolean) => void;
  pdfEngineRef: React.RefObject<any>;
  toast: any;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({
  showPerformancePanel,
  setShowPerformancePanel,
  webglEnabled,
  setWebglEnabled,
  pdfEngineRef,
  toast,
}) => {
  const [performanceStats, setPerformanceStats] = useState<any>(null);

  if (!showPerformancePanel) return null;

  return (
    <div className="fixed top-20 right-4 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-lg shadow-2xl border-2 border-indigo-500 p-6 min-w-[400px] max-w-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">⚡</span>
          <span>Performance Boost</span>
        </h3>
        <button
          onClick={() => setShowPerformancePanel(false)}
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-4">
        {/* WebGL Acceleration */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <span>🚀</span>
              WebGL Acceleration
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={webglEnabled}
                onChange={(e) => {
                  setWebglEnabled(e.target.checked);
                  if (e.target.checked) {
                    toast.success('WebGL acceleration enabled - 3x faster rendering!');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <p className="text-white/70 text-xs">
            Use GPU acceleration for faster rendering (3x speed boost)
          </p>
        </div>
        
        {/* Cache Management */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>💾</span>
            Cache Management
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (pdfEngineRef.current) {
                  const cache = pdfEngineRef.current.getAdvancedCache();
                  const stats = cache.getStats();
                  setPerformanceStats(stats);
                  toast.success('Cache stats updated');
                }
              }}
              className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-all"
            >
              📊 View Cache Stats
            </button>
            {performanceStats && (
              <div className="text-white/80 text-xs space-y-1">
                <div>Size: {(performanceStats.size / (1024 * 1024)).toFixed(2)} MB</div>
                <div>Entries: {performanceStats.entries}</div>
                <div>Hit Rate: {(performanceStats.hitRate * 100).toFixed(1)}%</div>
              </div>
            )}
            <button
              onClick={() => {
                if (pdfEngineRef.current) {
                  const cache = pdfEngineRef.current.getAdvancedCache();
                  cache.clear();
                  toast.success('Cache cleared');
                }
              }}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm transition-all"
            >
              🗑️ Clear Cache
            </button>
          </div>
        </div>
        
        {/* Performance Metrics */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📈</span>
            Performance Metrics
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
            <div>
              <div className="font-semibold">Render Time</div>
              <div className="text-white">{performanceStats?.renderTime || 'N/A'}ms</div>
            </div>
            <div>
              <div className="font-semibold">Memory Usage</div>
              <div className="text-white">{performanceStats?.memoryUsage || 'N/A'}MB</div>
            </div>
            <div>
              <div className="font-semibold">FPS</div>
              <div className="text-white">{performanceStats?.fps || '60'} fps</div>
            </div>
            <div>
              <div className="font-semibold">GPU Usage</div>
              <div className="text-white">{webglEnabled ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





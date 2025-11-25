// Advanced Performance Monitoring Dashboard
'use client';

import React, { useState, useEffect, memo } from 'react';
import { getMemoryManager } from '../utils/memoryManager';
import { createPerformanceMonitor } from '../utils/performance';

interface PerformanceMetrics {
  memory: {
    heapUsed: number;
    heapTotal: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  render: {
    avg: number;
    min: number;
    max: number;
    count: number;
  };
  fps: number;
  cache: {
    size: number;
    hits: number;
    misses: number;
  };
}

export const PerformanceDashboard: React.FC<{ isOpen: boolean; onClose: () => void }> = memo(({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: { heapUsed: 0, heapTotal: 0, trend: 'stable' },
    render: { avg: 0, min: 0, max: 0, count: 0 },
    fps: 60,
    cache: { size: 0, hits: 0, misses: 0 },
  });

  useEffect(() => {
    if (!isOpen) return;

    const memoryManager = getMemoryManager();
    const performanceMonitor = createPerformanceMonitor();

    const updateMetrics = () => {
      const memoryStats = memoryManager.getMemoryStats();
      const perfMetrics = performanceMonitor.getMetrics();

      setMetrics({
        memory: {
          heapUsed: memoryStats.current?.heapUsed || 0,
          heapTotal: memoryStats.current?.heapTotal || 0,
          trend: memoryStats.trend,
        },
        render: perfMetrics['renderPage'] || { avg: 0, min: 0, max: 0, count: 0 },
        fps: 60, // Calculate from frame times
        cache: {
          size: 0,
          hits: 0,
          misses: 0,
        },
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'increasing': return 'text-red-500';
      case 'decreasing': return 'text-green-500';
      default: return 'text-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="p-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Performance Dashboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Close dashboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Memory Metrics */}
          <div className="bg-gradient-to-br from-violet-50/50 to-indigo-50/50 dark:from-violet-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-violet-200/50 dark:border-violet-800/50">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Memory Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Heap Used:</span>
                <span className="font-mono text-zinc-900 dark:text-white">{formatBytes(metrics.memory.heapUsed)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Heap Total:</span>
                <span className="font-mono text-zinc-900 dark:text-white">{formatBytes(metrics.memory.heapTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-600 dark:text-zinc-400">Trend:</span>
                <span className={`font-semibold ${getTrendColor(metrics.memory.trend)}`}>
                  {metrics.memory.trend.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 w-full bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(metrics.memory.heapUsed / metrics.memory.heapTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Render Metrics */}
          <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-lg p-4 border border-cyan-200/50 dark:border-cyan-800/50">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Render Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Average:</span>
                <p className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                  {metrics.render.avg.toFixed(2)}ms
                </p>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Min:</span>
                <p className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                  {metrics.render.min.toFixed(2)}ms
                </p>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Max:</span>
                <p className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                  {metrics.render.max.toFixed(2)}ms
                </p>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm">Count:</span>
                <p className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                  {metrics.render.count}
                </p>
              </div>
            </div>
          </div>

          {/* FPS */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
            <h3 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white">Frame Rate</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-zinc-900 dark:text-white">{metrics.fps}</div>
              <div className="text-zinc-600 dark:text-zinc-400">FPS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PerformanceDashboard.displayName = 'PerformanceDashboard';

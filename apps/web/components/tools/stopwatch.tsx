'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function Stopwatch() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const toggle = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      toast.success('Stopwatch started!');
    } else {
      toast.info('Stopwatch paused');
    }
  };

  const reset = () => {
    setTime(0);
    setIsRunning(false);
    setLaps([]);
    toast.info('Stopwatch reset');
  };

  const addLap = () => {
    if (isRunning) {
      setLaps([...laps, time]);
      toast.success('Lap recorded!');
    }
  };

  return (
    <ToolBase
      title="Stopwatch"
      description="Precise stopwatch with lap times"
      icon="⏱️"
      helpText="Precise stopwatch with millisecond accuracy. Start, pause, reset, and record lap times."
      tips={[
        'Start and pause stopwatch',
        'Reset to zero',
        'Record lap times',
        'Millisecond precision',
        'Track multiple laps'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <div className="text-7xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-6">
            {formatTime(time)}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={toggle}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={addLap}
              disabled={!isRunning}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Lap
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {laps.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Lap Times:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {laps.map((lap, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Lap {index + 1}</span>
                  <span className="text-gray-900 dark:text-gray-100 font-mono">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


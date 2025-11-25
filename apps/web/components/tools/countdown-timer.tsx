'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function CountdownTimer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            setIsRunning(false);
            toast.warning('⏰ Time\'s Up!');
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
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
  }, [isRunning, timeLeft]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const start = () => {
    const total = (hours * 3600 + minutes * 60 + seconds) * 1000;
    if (total <= 0) {
      toast.warning('Please set a valid time');
      return;
    }
    setTimeLeft(total);
    setIsRunning(true);
    toast.success('Timer started!');
  };

  const pause = () => {
    setIsRunning(false);
    toast.info('Timer paused');
  };

  const reset = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    toast.info('Timer reset');
  };

  return (
    <ToolBase
      title="Countdown Timer"
      description="Set a countdown timer with hours, minutes, and seconds"
      icon="⏰"
      helpText="Set a countdown timer for any duration. Start, pause, and reset the timer. Get notified when time is up."
      tips={[
        'Set hours, minutes, and seconds',
        'Start and pause timer',
        'Reset to clear timer',
        'Visual countdown display',
        'Notification when time is up'
      ]}
    >
      <div className="space-y-4">
        {!isRunning && timeLeft === 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Hours:</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                max="23"
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minutes:</label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                min="0"
                max="59"
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seconds:</label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                min="0"
                max="59"
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100 text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
          <div className={`text-7xl font-mono font-bold mb-6 ${timeLeft === 0 && isRunning ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4 justify-center">
            {!isRunning ? (
              <button 
                onClick={start} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pause}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors"
              >
                Pause
              </button>
            )}
            <button 
              onClick={reset} 
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {timeLeft === 0 && isRunning && (
          <div className="text-center text-2xl text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            ⏰ Time's Up!
          </div>
        )}
      </div>
    </ToolBase>
  );
}


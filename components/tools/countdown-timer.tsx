'use client';

import { useState, useEffect, useRef } from 'react';

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
      alert('Please set a valid time');
      return;
    }
    setTimeLeft(total);
    setIsRunning(true);
  };

  const reset = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  return (
    <div className="space-y-6">
      {!isRunning && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-slate-300 mb-2">Hours:</label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              max="23"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-center text-2xl font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Minutes:</label>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              min="0"
              max="59"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-center text-2xl font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Seconds:</label>
            <input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              min="0"
              max="59"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-center text-2xl font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-xl p-12 text-center">
        <div className={`text-7xl font-mono font-bold mb-6 ${timeLeft === 0 && isRunning ? 'text-red-400' : 'text-indigo-400'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4 justify-center">
          {!isRunning ? (
            <button onClick={start} className="btn">
              Start
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="btn"
            >
              Pause
            </button>
          )}
          <button onClick={reset} className="btn bg-slate-700 hover:bg-slate-600">
            Reset
          </button>
        </div>
      </div>

      {timeLeft === 0 && isRunning && (
        <div className="text-center text-2xl text-red-400 font-bold">
          ⏰ Time's Up!
        </div>
      )}
    </div>
  );
}


'use client';

import { memo, useState, useEffect, useCallback } from 'react';

const ThemeToggle = memo(function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('light', initialTheme === 'light');
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, [theme]);

  if (!mounted) {
    return (
      <button className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
        <span className="text-xl">🌓</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="text-xl">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;


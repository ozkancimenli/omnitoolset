'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-slate-800/80 dark:bg-slate-800/80 light:bg-white/80 backdrop-blur-lg border-b border-slate-700 dark:border-slate-700 light:border-gray-200 sticky top-0 z-50">
      <div className="container py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex flex-col items-start">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              🛠️ OmniToolset
            </h1>
            <p className="text-slate-400 dark:text-slate-400 light:text-gray-600 text-xs mt-0.5">All the tools you need in one place</p>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/pdf-editor" 
              className="px-3 py-1.5 bg-indigo-500/20 dark:bg-indigo-500/20 light:bg-indigo-100 hover:bg-indigo-500/30 dark:hover:bg-indigo-500/30 light:hover:bg-indigo-200 text-indigo-300 dark:text-indigo-300 light:text-indigo-700 rounded-lg text-sm font-medium transition-colors"
            >
              ✏️ PDF Editor
            </Link>
            <Link 
              href="/blog" 
              className="text-slate-300 dark:text-slate-300 light:text-gray-700 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-gray-900 transition-colors font-medium"
            >
              Blog
            </Link>
            <Link 
              href="/categories" 
              className="text-slate-300 dark:text-slate-300 light:text-gray-700 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-gray-900 transition-colors font-medium"
            >
              Categories
            </Link>
            <Link 
              href="/#tools" 
              className="text-slate-300 dark:text-slate-300 light:text-gray-700 hover:text-slate-100 dark:hover:text-slate-100 light:hover:text-gray-900 transition-colors font-medium"
            >
              All Tools
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}

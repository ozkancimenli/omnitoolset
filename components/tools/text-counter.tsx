'use client';

import { useState } from 'react';

export default function TextCounter() {
  const [text, setText] = useState('');

  const stats = {
    characters: text.length,
    charactersNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1 : 0,
    lines: text.split('\n').length,
    sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
  };

  const avgWordLength = stats.words > 0 
    ? (text.replace(/\s/g, '').length / stats.words).toFixed(1)
    : 0;

  const readingTime = Math.ceil(stats.words / 200);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enter your text:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 
                   focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Paste the text you want to count here..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
          <div className="text-3xl font-bold text-indigo-400">{stats.characters}</div>
          <div className="text-sm text-slate-400 mt-1">Characters</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
          <div className="text-3xl font-bold text-indigo-400">{stats.charactersNoSpace}</div>
          <div className="text-sm text-slate-400 mt-1">Characters (No Spaces)</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
          <div className="text-3xl font-bold text-indigo-400">{stats.words}</div>
          <div className="text-sm text-slate-400 mt-1">Words</div>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl text-center border border-slate-700">
          <div className="text-3xl font-bold text-indigo-400">{stats.paragraphs}</div>
          <div className="text-sm text-slate-400 mt-1">Paragraphs</div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong className="text-slate-300">Lines:</strong>
            <span className="text-slate-400 ml-2">{stats.lines}</span>
          </div>
          <div>
            <strong className="text-slate-300">Sentences:</strong>
            <span className="text-slate-400 ml-2">{stats.sentences}</span>
          </div>
          <div>
            <strong className="text-slate-300">Avg Word Length:</strong>
            <span className="text-slate-400 ml-2">{avgWordLength}</span>
          </div>
          <div>
            <strong className="text-slate-300">Reading Time:</strong>
            <span className="text-slate-400 ml-2">{readingTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

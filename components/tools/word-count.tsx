'use client';

import { useState, useMemo } from 'react';

export default function WordCount() {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    if (!text.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
      };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const lines = text.split('\n').length;

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter text:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Paste or type your text here..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.characters}</div>
          <div className="text-sm text-slate-400">Characters</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.charactersNoSpaces}</div>
          <div className="text-sm text-slate-400">Characters (no spaces)</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.words}</div>
          <div className="text-sm text-slate-400">Words</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.sentences}</div>
          <div className="text-sm text-slate-400">Sentences</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.paragraphs}</div>
          <div className="text-sm text-slate-400">Paragraphs</div>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-400 mb-1">{stats.lines}</div>
          <div className="text-sm text-slate-400">Lines</div>
        </div>
      </div>
    </div>
  );
}


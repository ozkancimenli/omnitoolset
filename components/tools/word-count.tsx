'use client';

import { useState, useMemo } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

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
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1;
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

  const avgWordLength = stats.words > 0 
    ? (text.replace(/\s/g, '').length / stats.words).toFixed(1)
    : 0;

  const readingTime = Math.ceil(stats.words / 200);

  const copyStats = () => {
    const statsText = `Word Count Statistics:
Characters: ${stats.characters}
Characters (no spaces): ${stats.charactersNoSpaces}
Words: ${stats.words}
Sentences: ${stats.sentences}
Paragraphs: ${stats.paragraphs}
Lines: ${stats.lines}
Average word length: ${avgWordLength} characters
Reading time: ${readingTime} minute${readingTime > 1 ? 's' : ''}`;
    
    navigator.clipboard.writeText(statsText);
    toast.success('Statistics copied to clipboard!');
  };

  const clear = () => {
    setText('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Word Counter"
      description="Count words, characters, sentences, and get detailed text statistics"
      icon="📝"
      helpText="Analyze your text with comprehensive word and character counts. Perfect for writers, students, bloggers, and content creators who need to meet word limits."
      tips={[
        'Real-time statistics as you type',
        'Character count includes spaces',
        'Reading time based on 200 words/minute',
        'Word count excludes empty strings',
        'Copy statistics to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter text:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {text.length} characters
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste or type your text here..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.characters.toLocaleString()}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Characters</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stats.charactersNoSpaces.toLocaleString()}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">No Spaces</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.words.toLocaleString()}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Words</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 text-center border border-orange-200 dark:border-orange-800">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{stats.sentences.toLocaleString()}</div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Sentences</div>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 text-center border border-pink-200 dark:border-pink-800">
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">{stats.paragraphs.toLocaleString()}</div>
            <div className="text-sm text-pink-700 dark:text-pink-300">Paragraphs</div>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center border border-indigo-200 dark:border-indigo-800">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{stats.lines.toLocaleString()}</div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300">Lines</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Additional Statistics</h3>
            <button
              onClick={copyStats}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              Copy Stats
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong className="text-gray-700 dark:text-gray-300">Avg Word Length:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-2">{avgWordLength} chars</span>
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300">Reading Time:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-2">{readingTime} min</span>
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300">Words per Sentence:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0}
              </span>
            </div>
            <div>
              <strong className="text-gray-700 dark:text-gray-300">Characters per Word:</strong>
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={clear}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Clear Text
        </button>
      </div>
    </ToolBase>
  );
}


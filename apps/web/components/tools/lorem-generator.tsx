'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function LoremGenerator() {
  const [type, setType] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
    'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'
  ];

  const generate = () => {
    let result = '';

    if (type === 'words') {
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
      }
      result = words.join(' ');
    } else if (type === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        const sentenceLength = Math.floor(Math.random() * 10) + 8;
        const words: string[] = [];
        for (let j = 0; j < sentenceLength; j++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        }
        const sentence = words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
        sentences.push(sentence);
      }
      result = sentences.join(' ');
    } else {
      const paragraphs: string[] = [];
      for (let i = 0; i < count; i++) {
        const sentenceCount = Math.floor(Math.random() * 3) + 3;
        const sentences: string[] = [];
        for (let j = 0; j < sentenceCount; j++) {
          const sentenceLength = Math.floor(Math.random() * 10) + 8;
          const words: string[] = [];
          for (let k = 0; k < sentenceLength; k++) {
            words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
          }
          const sentence = words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
          sentences.push(sentence);
        }
        paragraphs.push(sentences.join(' '));
      }
      result = paragraphs.join('\n\n');
    }

    setOutput(result);
    toast.success(`Generated ${count} ${type}!`);
  };

  const copyToClipboard = () => {
    if (!output.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const clear = () => {
    setOutput('');
    toast.info('Cleared');
  };

  const stats = {
    characters: output.length,
    words: output.trim() ? output.trim().split(/\s+/).filter(w => w.length > 0).length : 0,
    paragraphs: output.trim() ? output.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1 : 0,
  };

  const maxCount = type === 'words' ? 100 : type === 'sentences' ? 20 : 10;

  return (
    <ToolBase
      title="Lorem Ipsum Generator"
      description="Generate placeholder text for your designs and layouts"
      icon="📄"
      helpText="Generate Lorem Ipsum placeholder text for your designs, layouts, and mockups. Choose from words, sentences, or paragraphs."
      tips={[
        'Words: Generate individual words',
        'Sentences: Generate complete sentences',
        'Paragraphs: Generate full paragraphs',
        'Perfect for design mockups and layouts',
        'Copy generated text to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type:
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'words' | 'sentences' | 'paragraphs');
                setOutput('');
              }}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs">Paragraphs</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Count: {count}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Max: {maxCount}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={maxCount}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>{maxCount}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={generate} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>📄</span>
          <span>Generate Lorem Ipsum</span>
        </button>

        {output && (
          <div className="space-y-4">
            {stats.characters > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">Characters</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.characters.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">Words</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.words.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 dark:text-blue-400 mb-1">Paragraphs</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.paragraphs.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generated Text:
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {output.length} characters
                </span>
              </div>
              <textarea
                value={output}
                readOnly
                rows={type === 'paragraphs' ? 12 : 8}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                         text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={copyToClipboard} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Copy
              </button>
              <button 
                onClick={clear}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolBase>
  );
}

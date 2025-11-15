'use client';

import { useState } from 'react';

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
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Type:
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'words' | 'sentences' | 'paragraphs')}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
          >
            <option value="words">Words</option>
            <option value="sentences">Sentences</option>
            <option value="paragraphs">Paragraphs</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Count: {count}
          </label>
          <input
            type="range"
            min="1"
            max={type === 'words' ? 100 : type === 'sentences' ? 20 : 10}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <button onClick={generate} className="btn w-full">
        Generate Lorem Ipsum
      </button>

      {output && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Generated Text:
            </label>
            <textarea
              value={output}
              readOnly
              rows={type === 'paragraphs' ? 12 : 8}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                       text-slate-100"
            />
          </div>

          <button onClick={copyToClipboard} className="btn w-full">
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

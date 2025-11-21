'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function TextCase() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeCase, setActiveCase] = useState<string>('');

  const convert = (type: string) => {
    if (!input.trim()) {
      toast.warning('Please enter some text first');
      return;
    }

    let result = '';
    switch(type) {
      case 'uppercase':
        result = input.toUpperCase();
        break;
      case 'lowercase':
        result = input.toLowerCase();
        break;
      case 'title':
        result = input.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'sentence':
        result = input.toLowerCase().replace(/^\w|\.\s+\w/g, l => l.toUpperCase());
        break;
      case 'alternating':
        result = input.split('').map((char, i) => 
          i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        ).join('');
        break;
      case 'inverse':
        result = input.split('').map(char => {
          if (char === char.toUpperCase()) return char.toLowerCase();
          if (char === char.toLowerCase()) return char.toUpperCase();
          return char;
        }).join('');
        break;
      case 'camel':
        result = input.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
        break;
      case 'pascal':
        result = input.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^./, chr => chr.toUpperCase());
        break;
      case 'snake':
        result = input.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        break;
      case 'kebab':
        result = input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        break;
    }
    setOutput(result);
    setActiveCase(type);
    toast.success('Text converted!');
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
    setInput('');
    setOutput('');
    setActiveCase('');
    toast.info('Cleared');
  };

  const stats = {
    characters: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input.split('\n').length,
  };

  return (
    <ToolBase
      title="Text Case Converter"
      description="Convert text to different case formats instantly"
      icon="🔤"
      helpText="Transform your text to uppercase, lowercase, title case, sentence case, and more. Perfect for formatting text for different purposes."
      tips={[
        'UPPERCASE: All letters in uppercase',
        'lowercase: All letters in lowercase',
        'Title Case: First letter of each word capitalized',
        'Sentence case: First letter of sentence capitalized',
        'AlTeRnAtInG: Alternating case',
        'iNvErSe: Inverted case',
        'camelCase: camelCase format',
        'PascalCase: PascalCase format',
        'snake_case: snake_case format',
        'kebab-case: kebab-case format'
      ]}
    >
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
                <p className="text-blue-600 dark:text-blue-400 mb-1">Lines</p>
                <p className="font-semibold text-blue-900 dark:text-blue-200">{stats.lines.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter your text:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the text you want to convert here..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <button 
            onClick={() => convert('uppercase')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'uppercase' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            UPPERCASE
          </button>
          <button 
            onClick={() => convert('lowercase')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'lowercase' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            lowercase
          </button>
          <button 
            onClick={() => convert('title')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'title' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Title Case
          </button>
          <button 
            onClick={() => convert('sentence')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'sentence' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Sentence case
          </button>
          <button 
            onClick={() => convert('alternating')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'alternating' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            AlTeRnAtInG
          </button>
          <button 
            onClick={() => convert('inverse')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'inverse' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            iNvErSe
          </button>
          <button 
            onClick={() => convert('camel')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'camel' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            camelCase
          </button>
          <button 
            onClick={() => convert('pascal')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'pascal' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            PascalCase
          </button>
          <button 
            onClick={() => convert('snake')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'snake' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            snake_case
          </button>
          <button 
            onClick={() => convert('kebab')} 
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeCase === 'kebab' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            kebab-case
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Result:
            </label>
            {output && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            rows={8}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 font-mono"
            placeholder="Converted text will appear here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={copyToClipboard} 
            disabled={!output}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Copy Result
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </ToolBase>
  );
}

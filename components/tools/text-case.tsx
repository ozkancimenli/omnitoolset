'use client';

import { useState } from 'react';

export default function TextCase() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = (type: string) => {
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
    }
    setOutput(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Enter your text:
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Paste the text you want to convert here..."
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => convert('uppercase')} className="btn">UPPERCASE</button>
            <button onClick={() => convert('lowercase')} className="btn">lowercase</button>
            <button onClick={() => convert('title')} className="btn">Title Case</button>
            <button onClick={() => convert('sentence')} className="btn">Sentence case</button>
            <button onClick={() => convert('alternating')} className="btn">AlTeRnAtInG</button>
            <button onClick={() => convert('inverse')} className="btn">iNvErSe</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Result:
        </label>
        <textarea
          value={output}
          readOnly
          rows={8}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                   text-slate-100"
        />
      </div>

      <button onClick={copyToClipboard} className="btn w-full" disabled={!output}>
        Copy
      </button>
    </div>
  );
}

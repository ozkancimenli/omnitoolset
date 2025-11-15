'use client';

import { useState } from 'react';

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    try {
      let formatted = input.toUpperCase();
      const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TABLE', 'DATABASE'];
      
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, keyword);
      });
      
      formatted = formatted.replace(/\s+/g, ' ');
      formatted = formatted.replace(/\s*,\s*/g, ',\n  ');
      formatted = formatted.replace(/\s+FROM\s+/gi, '\nFROM ');
      formatted = formatted.replace(/\s+WHERE\s+/gi, '\nWHERE ');
      formatted = formatted.replace(/\s+JOIN\s+/gi, '\nJOIN ');
      formatted = formatted.replace(/\s+ON\s+/gi, '\n  ON ');
      formatted = formatted.replace(/\s+GROUP BY\s+/gi, '\nGROUP BY ');
      formatted = formatted.replace(/\s+ORDER BY\s+/gi, '\nORDER BY ');
      formatted = formatted.replace(/\s+HAVING\s+/gi, '\nHAVING ');
      
      setOutput(formatted);
    } catch (error) {
      alert('Error formatting SQL: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter SQL:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder="Enter SQL query..."
        />
      </div>

      <button onClick={format} className="btn w-full" disabled={!input}>
        Format SQL
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Formatted SQL:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


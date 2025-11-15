'use client';

import { useState } from 'react';

export default function JsonToXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const json = JSON.parse(input);
      
      const toXml = (obj: any, rootName = 'root'): string => {
        let xml = '';
        
        if (Array.isArray(obj)) {
          obj.forEach((item, i) => {
            xml += `<${rootName}>${toXml(item, 'item')}</${rootName}>`;
          });
        } else if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
              xml += `<${key}>${toXml(value, key)}</${key}>`;
            } else {
              xml += `<${key}>${value}</${key}>`;
            }
          });
        } else {
          xml += String(obj);
        }
        
        return xml;
      };

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${toXml(json, 'root')}</root>`;
      setOutput(xml);
    } catch (error) {
      alert('Invalid JSON: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter JSON:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder='{"name":"John","age":30}'
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to XML
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">XML:</label>
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


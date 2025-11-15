'use client';

import { useState } from 'react';

export default function XmlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, 'text/xml');
      
      if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid XML');
      }

      const toJson = (node: Element | Document): any => {
        const obj: any = {};
        
        if (node.childNodes.length === 0) {
          return node.textContent || '';
        }
        
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
          return node.textContent || '';
        }
        
        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === 1) {
            const element = child as Element;
            const tagName = element.tagName;
            const value = toJson(element);
            
            if (obj[tagName]) {
              if (!Array.isArray(obj[tagName])) {
                obj[tagName] = [obj[tagName]];
              }
              obj[tagName].push(value);
            } else {
              obj[tagName] = value;
            }
          }
        });
        
        return obj;
      };

      const root = xmlDoc.documentElement;
      const json = toJson(root);
      setOutput(JSON.stringify(json, null, 2));
    } catch (error) {
      alert('Error converting XML: ' + (error as Error).message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-slate-300 mb-2">Enter XML:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          placeholder='<?xml version="1.0"?><root><name>John</name><age>30</age></root>'
        />
      </div>

      <button onClick={convert} className="btn w-full" disabled={!input}>
        Convert to JSON
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">JSON:</label>
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


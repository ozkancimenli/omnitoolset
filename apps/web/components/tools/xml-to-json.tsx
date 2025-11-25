'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function XmlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter XML first');
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, 'text/xml');
      
      if (xmlDoc.querySelector('parsererror')) {
        throw new Error('Invalid XML: ' + xmlDoc.querySelector('parsererror')?.textContent);
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
      const jsonString = JSON.stringify(json, null, 2);
      setOutput(jsonString);
      toast.success('XML converted to JSON!');
    } catch (error) {
      toast.error('Error converting XML: ' + (error as Error).message);
      setOutput('');
    }
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
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="XML to JSON Converter"
      description="Convert XML format to JSON"
      icon="🔄"
      helpText="Convert XML to JSON format. Parses XML structure and converts it to valid JSON with proper nesting."
      tips={[
        'Paste or type XML code',
        'Validates XML syntax',
        'Handles nested elements',
        'Converts attributes and text',
        'Copy JSON to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter XML:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='<?xml version="1.0"?><root><name>John</name><age>30</age></root>'
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert to JSON
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                JSON Output:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {output.length} characters
              </span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <textarea
                value={output}
                readOnly
                rows={12}
                className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm resize-none focus:outline-none"
              />
            </div>
            <button 
              onClick={copyToClipboard} 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Copy JSON
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


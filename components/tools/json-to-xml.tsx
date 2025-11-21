'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JsonToXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter JSON first');
      return;
    }

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
              xml += `<${key}>${escapeXml(String(value))}</${key}>`;
            }
          });
        } else {
          xml += escapeXml(String(obj));
        }
        
        return xml;
      };

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<root>${toXml(json, 'root')}</root>`;
      setOutput(xml);
      toast.success('JSON converted to XML!');
    } catch (error) {
      toast.error('Invalid JSON: ' + (error as Error).message);
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
      title="JSON to XML Converter"
      description="Convert JSON format to XML"
      icon="🔄"
      helpText="Convert JSON to XML format. Handles nested objects, arrays, and properly escapes special characters."
      tips={[
        'Paste or type JSON code',
        'Validates JSON before conversion',
        'Handles nested structures',
        'Escapes XML special characters',
        'Copy XML to clipboard'
      ]}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter JSON:
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
            placeholder='{"name":"John","age":30,"city":"New York"}'
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={convert} 
            disabled={!input}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Convert to XML
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
                XML Output:
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
              Copy XML
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


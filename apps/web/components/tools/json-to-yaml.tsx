'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function JsonToYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      toast.warning('Please enter JSON first');
      return;
    }

    try {
      const json = JSON.parse(input);
      
      const toYaml = (obj: any, indent = 0): string => {
        const spaces = '  '.repeat(indent);
        let yaml = '';
        
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            yaml += spaces + '- ';
            if (typeof item === 'object' && item !== null) {
              yaml += '\n' + toYaml(item, indent + 1);
            } else {
              yaml += String(item) + '\n';
            }
          });
        } else if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach((key, i) => {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
              yaml += spaces + key + ':\n' + toYaml(value, indent + 1);
            } else {
              yaml += spaces + key + ': ' + String(value) + '\n';
            }
          });
        } else {
          yaml += String(obj) + '\n';
        }
        
        return yaml;
      };

      const yaml = toYaml(json);
      setOutput(yaml);
      toast.success('JSON converted to YAML!');
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
      title="JSON to YAML Converter"
      description="Convert JSON format to YAML"
      icon="🔄"
      helpText="Convert JSON to YAML (YAML Ain't Markup Language) format. Preserves structure and formatting with proper indentation."
      tips={[
        'Paste or type JSON code',
        'Validates JSON before conversion',
        'Preserves nested structures',
        'Proper YAML indentation',
        'Copy YAML to clipboard'
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
            Convert to YAML
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
                YAML Output:
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
              Copy YAML
            </button>
          </div>
        )}
      </div>
    </ToolBase>
  );
}


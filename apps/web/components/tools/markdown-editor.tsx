'use client';

import { useState } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is **bold** and this is *italic*.');

  const convertToHTML = (md: string): string => {
    let html = md;
    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p>');
    html = html.replace(/\n/gim, '<br>');
    html = '<p>' + html + '</p>';
    return html;
  };

  const html = convertToHTML(markdown);

  const copyMarkdown = () => {
    if (!markdown.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(markdown);
    toast.success('Markdown copied to clipboard!');
  };

  const copyHTML = () => {
    if (!html.trim()) {
      toast.warning('Nothing to copy!');
      return;
    }
    navigator.clipboard.writeText(html);
    toast.success('HTML copied to clipboard!');
  };

  const clear = () => {
    setMarkdown('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Markdown Editor"
      description="Live Markdown editor with preview"
      icon="📝"
      helpText="Edit Markdown with live preview. Supports headers, bold, italic, links, code blocks, and more. Real-time HTML conversion."
      tips={[
        'Real-time preview',
        'Supports headers (# ## ###)',
        'Bold (**text**) and italic (*text*)',
        'Links [text](url)',
        'Copy Markdown or HTML'
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={copyMarkdown}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Copy Markdown
          </button>
          <button 
            onClick={copyHTML}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Copy HTML
          </button>
          <button 
            onClick={clear}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Markdown:
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {markdown.length} characters
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="# Your Markdown here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview:
            </label>
            <div
              className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                       text-gray-900 dark:text-gray-100 min-h-[400px] overflow-y-auto prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </ToolBase>
  );
}


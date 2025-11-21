'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/Toast';
import ToolBase from './ToolBase';

export default function OpenGraphGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [type, setType] = useState('website');
  const [siteName, setSiteName] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    generate();
  }, [title, description, url, image, type, siteName]);

  const generate = () => {
    const tags = [];
    
    if (title) tags.push(`<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`);
    if (description) tags.push(`<meta property="og:description" content="${description.replace(/"/g, '&quot;')}">`);
    if (url) tags.push(`<meta property="og:url" content="${url}">`);
    if (type) tags.push(`<meta property="og:type" content="${type}">`);
    if (siteName) tags.push(`<meta property="og:site_name" content="${siteName.replace(/"/g, '&quot;')}">`);
    if (image) tags.push(`<meta property="og:image" content="${image}">`);
    if (image) tags.push(`<meta property="og:image:width" content="1200">`);
    if (image) tags.push(`<meta property="og:image:height" content="630">`);
    
    setOutput(tags.join('\n'));
    if (tags.length > 0) {
      toast.success('Open Graph tags generated!');
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
    setTitle('');
    setDescription('');
    setUrl('');
    setImage('');
    setSiteName('');
    setOutput('');
    toast.info('Cleared');
  };

  return (
    <ToolBase
      title="Open Graph Generator"
      description="Generate Open Graph meta tags for social sharing"
      icon="📱"
      helpText="Generate Open Graph meta tags for your website. These tags control how your content appears when shared on Facebook, LinkedIn, and other social platforms."
      tips={[
        'Enter page information',
        'Select content type',
        'Add image URL',
        'Real-time tag generation',
        'Copy generated tags'
      ]}
    >
      <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Page title..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                   text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Page description..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="website">Website</option>
            <option value="article">Article</option>
            <option value="book">Book</option>
            <option value="profile">Profile</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name:</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                     text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Site name..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image URL:</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg 
                   text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={generate} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Generate Tags
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
              Open Graph Tags:
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {output.length} characters
            </span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <textarea
              value={output}
              readOnly
              rows={10}
              className="w-full bg-transparent border-none text-blue-600 dark:text-blue-400 font-mono text-sm resize-none focus:outline-none"
            />
          </div>
          <button 
            onClick={copyToClipboard} 
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Copy Tags
          </button>
        </div>
      )}
      </div>
    </ToolBase>
  );
}


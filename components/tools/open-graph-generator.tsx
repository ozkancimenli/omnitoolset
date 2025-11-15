'use client';

import { useState } from 'react';

export default function OpenGraphGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [type, setType] = useState('website');
  const [siteName, setSiteName] = useState('');
  const [output, setOutput] = useState('');

  const generate = () => {
    const tags = [];
    
    if (title) tags.push(`<meta property="og:title" content="${title}">`);
    if (description) tags.push(`<meta property="og:description" content="${description}">`);
    if (url) tags.push(`<meta property="og:url" content="${url}">`);
    if (type) tags.push(`<meta property="og:type" content="${type}">`);
    if (siteName) tags.push(`<meta property="og:site_name" content="${siteName}">`);
    if (image) tags.push(`<meta property="og:image" content="${image}">`);
    if (image) tags.push(`<meta property="og:image:width" content="1200">`);
    if (image) tags.push(`<meta property="og:image:height" content="630">`);
    
    setOutput(tags.join('\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    alert('Copied!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Page title..."
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="Page description..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-300 mb-2">Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="website">Website</option>
            <option value="article">Article</option>
            <option value="book">Book</option>
            <option value="profile">Profile</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Site Name:</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Site name..."
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 mb-2">Image URL:</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <button onClick={generate} className="btn w-full">
        Generate Open Graph Tags
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Open Graph Tags:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={10}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


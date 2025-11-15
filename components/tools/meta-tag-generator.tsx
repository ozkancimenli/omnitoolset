'use client';

import { useState } from 'react';

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');
  const [output, setOutput] = useState('');

  const generate = () => {
    const tags = [];
    
    if (title) tags.push(`<title>${title}</title>`);
    if (description) tags.push(`<meta name="description" content="${description}">`);
    if (keywords) tags.push(`<meta name="keywords" content="${keywords}">`);
    if (author) tags.push(`<meta name="author" content="${author}">`);
    if (url) tags.push(`<link rel="canonical" href="${url}">`);
    
    // Open Graph
    if (title) tags.push(`<meta property="og:title" content="${title}">`);
    if (description) tags.push(`<meta property="og:description" content="${description}">`);
    if (url) tags.push(`<meta property="og:url" content="${url}">`);
    if (image) tags.push(`<meta property="og:image" content="${image}">`);
    
    // Twitter Card
    if (title) tags.push(`<meta name="twitter:title" content="${title}">`);
    if (description) tags.push(`<meta name="twitter:description" content="${description}">`);
    if (image) tags.push(`<meta name="twitter:image" content="${image}">`);
    
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
          <label className="block text-slate-300 mb-2">Keywords:</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Author:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Author name..."
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-300 mb-2">OG Image URL:</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <button onClick={generate} className="btn w-full">
        Generate Meta Tags
      </button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Generated Meta Tags:</label>
            <button onClick={copyToClipboard} className="btn">
              Copy
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={15}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


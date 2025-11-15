'use client';

import { useState } from 'react';

export default function TwitterCardGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [card, setCard] = useState('summary_large_image');
  const [output, setOutput] = useState('');

  const generate = () => {
    const tags = [];
    tags.push(`<meta name="twitter:card" content="${card}">`);
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
      <div>
        <label className="block text-slate-300 mb-2">Card Type:</label>
        <select
          value={card}
          onChange={(e) => setCard(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
        >
          <option value="summary">Summary</option>
          <option value="summary_large_image">Summary Large Image</option>
        </select>
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-slate-300 mb-2">Image URL:</label>
        <input
          type="text"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <button onClick={generate} className="btn w-full">Generate</button>
      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-slate-300">Twitter Card Tags:</label>
            <button onClick={copyToClipboard} className="btn">Copy</button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={6}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-sm"
          />
        </div>
      )}
    </div>
  );
}


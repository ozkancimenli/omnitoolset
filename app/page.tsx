'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import Link from 'next/link';
import { tools } from '@/data/tools';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    if (!searchQuery) return tools;
    
    const query = searchQuery.toLowerCase();
    return tools.filter(tool => 
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      (tool.keywords && tool.keywords.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const categories = Array.from(new Set(tools.map(t => t.category))).sort();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OmniToolset',
    description: 'Free online tools for PDF, Image, Text, and Developer needs',
    url: 'https://omnitoolset.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://omnitoolset.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-12" id="tools">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {tools.length}+ Free Online Tools
          </h1>
          <p className="text-xl text-slate-400 mb-6">
            All the tools you need in one place
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/categories#${category.toLowerCase()}`}
                className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors text-sm font-medium"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 border-2 border-slate-700 rounded-xl 
                       text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 
                       focus:ring-2 focus:ring-indigo-500/20 transition-all"
              aria-label="Search tools"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-400 mt-2">
              Found {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No tools found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear search
            </button>
          </div>
        )}
      </main>

      <Footer />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}

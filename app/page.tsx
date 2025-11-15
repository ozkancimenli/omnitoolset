'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import AdSense from '@/components/AdSense';
import Link from 'next/link';
import { tools } from '@/data/tools';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    let filtered = tools;
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        (tool.keywords && tool.keywords.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  const categories = Array.from(new Set(tools.map(t => t.category))).sort();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OmniToolset - PDF Converter',
    description: '100% FREE PDF converter tools online. Merge PDF, split PDF, compress PDF, convert PDF to Word, Excel, PowerPoint, JPG, PNG instantly. All PDF tools completely free, no registration, no watermarks, 100% secure. Use unlimited times for free.',
    url: 'https://omnitoolset.com',
    keywords: 'pdf converter, pdf converter online, free pdf converter, pdf converter free, pdf converter no registration, pdf merge free, pdf split free, pdf compress free, pdf to word free, pdf to excel free, pdf to jpg free, pdf to png free, word to pdf free, excel to pdf free, powerpoint to pdf free, online pdf tools, free pdf tools, pdf tools online, instant pdf converter, pdf converter tool, free online pdf converter, pdf converter instant, pdf converter secure, no registration pdf converter, pdf converter unlimited, best pdf converter, how to convert pdf, pdf converter 2024, image converter free, text tools free, developer tools free, online tools free, free online tools, no registration tools, best online tools, free tools online, instant tools, quick tools, secure tools, unlimited tools, no watermark tools, best free tools 2024',
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
            100% FREE PDF Converter & {tools.length}+ Online Tools - No Registration
          </h1>
          <p className="text-xl text-slate-400 mb-6">
            Convert PDF, merge PDF, split PDF, compress PDF instantly. All file converter tools 100% free, no registration, no watermarks, unlimited use!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                selectedCategory === null
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  selectedCategory === category
                    ? 'bg-indigo-500 text-white'
                    : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                }`}
              >
                {category}
              </button>
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
          {(searchQuery || selectedCategory) && (
            <p className="text-sm text-slate-400 mt-2 text-center">
              {selectedCategory && (
                <span className="mr-2">
                  Category: <strong>{selectedCategory}</strong>
                </span>
              )}
              Found {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            </p>
          )}
        </div>

        {/* AdSense Banner - Top (Single ad, less intrusive) */}
        <div className="max-w-7xl mx-auto mb-8">
          <AdSense
            adFormat="auto"
            fullWidthResponsive={true}
            className="min-h-[100px] bg-slate-800 rounded-xl flex items-center justify-center"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* AdSense Banner - Bottom */}
        <div className="max-w-7xl mx-auto mt-8">
          <AdSense
            adFormat="auto"
            fullWidthResponsive={true}
            className="min-h-[100px] bg-slate-800 rounded-xl flex items-center justify-center"
          />
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

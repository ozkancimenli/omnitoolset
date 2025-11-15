'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ToolCard from '@/components/ToolCard';
import AdSense from '@/components/AdSense';
import { HomeHeroAd, HomeBottomAd, HomeSidebarAd } from '@/components/OptimizedAd';
import Link from 'next/link';
import { tools } from '@/data/tools';
import { useKeyboardShortcuts, ShortcutAction } from '@/lib/keyboard-shortcuts';
import { toast } from '@/components/Toast';
import RecentTools from '@/components/RecentTools';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  // Keyboard shortcuts
  useKeyboardShortcuts((action: ShortcutAction) => {
    switch (action) {
      case 'search':
        searchInputRef.current?.focus();
        toast.info('Search focused! Press Esc to clear');
        break;
      case 'home':
        router.push('/');
        break;
      case 'categories':
        router.push('/categories');
        break;
      case 'clear':
        setSearchQuery('');
        setSelectedCategory(null);
        searchInputRef.current?.blur();
        break;
    }
  });
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
      
      <main className="flex-1">
        {/* Hero Section with Stats */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-16 mb-12">
          <div className="container">
            {/* Hero Ad - Above Fold (High Value) */}
            <div className="mb-6 max-w-4xl mx-auto">
              <HomeHeroAd />
            </div>
            
            <div className="text-center text-white mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                100% FREE {tools.length}+ Online Tools
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-indigo-100">
                All the tools you need. No registration. No watermarks. Unlimited use.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{tools.length}+</div>
                  <div className="text-sm text-indigo-100">Free Tools</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-indigo-100">Free Forever</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-indigo-100">Registration</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">∞</div>
                  <div className="text-sm text-indigo-100">Unlimited Use</div>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm">
                  🔒 100% Secure
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm">
                  ⚡ Instant Processing
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm">
                  💯 No Watermarks
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm text-sm">
                  🌐 Works in Browser
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-12" id="tools">
          {/* Tools Grid Top Ad */}
          <div className="mb-8 max-w-7xl mx-auto">
            <HomeBottomAd />
          </div>
          
          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-200">🚀 Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link
                href="/pdf-editor"
                className="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl p-6 text-center text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="text-4xl mb-2">✏️</div>
                <div className="font-semibold">PDF Editor</div>
                <div className="text-xs text-indigo-100 mt-1">Edit PDFs</div>
              </Link>
              <Link
                href="/tools/pdf-merge"
                className="bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl p-6 text-center text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="text-4xl mb-2">📄</div>
                <div className="font-semibold">Merge PDF</div>
                <div className="text-xs text-blue-100 mt-1">Combine files</div>
              </Link>
              <Link
                href="/tools/pdf-to-word"
                className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl p-6 text-center text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="text-4xl mb-2">📝</div>
                <div className="font-semibold">PDF to Word</div>
                <div className="text-xs text-green-100 mt-1">Convert</div>
              </Link>
              <Link
                href="/tools/image-compress"
                className="bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 rounded-xl p-6 text-center text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="text-4xl mb-2">🖼️</div>
                <div className="font-semibold">Compress Image</div>
                <div className="text-xs text-pink-100 mt-1">Reduce size</div>
              </Link>
            </div>
          </div>

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
              ref={searchInputRef}
              type="text"
              placeholder="Search tools... (⌘K or Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-slate-800 dark:bg-slate-800 light:bg-white border-2 border-slate-700 dark:border-slate-700 light:border-gray-300 rounded-xl 
                       text-slate-100 dark:text-slate-100 light:text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-gray-400 focus:outline-none focus:border-indigo-500 
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

          {/* Featured Tools Section */}
          {!searchQuery && !selectedCategory && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-slate-200 flex items-center gap-2">
                ⭐ Most Popular Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tools
                  .filter(t => ['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-to-word', 'pdf-editor'].includes(t.id))
                  .map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
              </div>
            </div>
          )}

          {/* Recent Tools */}
          <RecentTools />

          {/* All Tools Grid */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-200">
              {searchQuery || selectedCategory ? 'Search Results' : 'All Tools'}
            </h2>
            <div className="text-sm text-slate-400">
              {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

        {/* Homepage Bottom Ad */}
        <div className="max-w-7xl mx-auto mt-8">
          <HomeBottomAd />
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

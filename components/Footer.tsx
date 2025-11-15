import Link from 'next/link';
import AdSense from '@/components/AdSense';
import { tools } from '@/data/tools';

export default function Footer() {
  const categories = Array.from(new Set(tools.map(t => t.category))).sort();
  const currentYear = new Date().getFullYear();

      return (
        <footer className="bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 py-12 mt-16">
          {/* AdSense - Above Footer */}
          <div className="container mb-8">
            <AdSense
              adFormat="auto"
              fullWidthResponsive={true}
              className="min-h-[100px] bg-slate-900 rounded-xl"
            />
          </div>
          
          <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              🛠️ OmniToolset
            </h3>
            <p className="text-slate-400 text-sm">
              Free online tools for all your needs. No registration required.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-slate-400 hover:text-slate-200 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/#tools" className="text-slate-400 hover:text-slate-200 transition-colors">
                  All Tools
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <Link 
                    href={`/categories#${category.toLowerCase()}`}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-200 mb-4">About</h4>
            <p className="text-slate-400 text-sm mb-2">
              {tools.length}+ free online tools
            </p>
            <p className="text-slate-400 text-sm">
              All tools are free to use, no registration required.
            </p>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; {currentYear} OmniToolset. All rights reserved.</p>
          <p className="mt-2 text-xs">
            All tools are client-side processed. Your files never leave your device.
          </p>
        </div>
      </div>
    </footer>
  );
}

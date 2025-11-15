'use client';

import Link from 'next/link';

/**
 * Navbar Component for OmniPDF Editor
 * 
 * Clean, minimal navigation bar with calm branding.
 * Designed to feel professional and trustworthy.
 */
export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/pdf-editor" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white text-xl font-bold">P</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-lg leading-tight">
                OmniPDF Editor
              </div>
              <div className="text-xs text-gray-500 leading-tight">
                Professional PDF Editing
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              How It Works
            </Link>
            <Link
              href="#faq"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              FAQ
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to OmniToolset
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}


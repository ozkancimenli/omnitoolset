'use client';

import Link from 'next/link';

/**
 * Footer Component for OmniPDF Editor
 * 
 * Simple, clean footer with essential links.
 * Maintains the calm, professional aesthetic.
 */
export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} OmniToolset. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              OmniToolset Main Site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



import { Metadata } from 'next';
import PdfEditorClient from './PdfEditorClient';

export const metadata: Metadata = {
  title: 'PDF Editor - Professional Online PDF Editing Tool',
  description: 'Professional PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files. Edit PDF instantly, no registration, no watermarks. Advanced PDF editing tools with undo/redo, zoom, annotations.',
  keywords: 'pdf editor, edit pdf, pdf editor online, free pdf editor, edit pdf online, pdf editor free, online pdf editor, pdf editor tool, edit pdf files, pdf editor no registration, best pdf editor, how to edit pdf, pdf editor 2024, edit pdf online free, pdf editor web, free online pdf editor, edit pdf text, pdf annotation tool, pdf markup tool, edit pdf pages, pdf editor instant, professional pdf editor, advanced pdf editor, pdf editor with undo, pdf editor zoom, pdf editor annotations',
  openGraph: {
    title: 'PDF Editor - Professional Online PDF Editing Tool',
    description: 'Professional PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files. Edit PDF instantly, no registration, no watermarks.',
    url: 'https://omnitoolset.com/pdf-editor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF Editor - Professional Online PDF Editing Tool',
    description: 'Professional PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files.',
  },
  alternates: {
    canonical: 'https://omnitoolset.com/pdf-editor',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF Editor - Professional PDF Editing Tool',
  description: 'Professional PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files. Edit PDF instantly, no registration, no watermarks. Advanced PDF editing tools with undo/redo, zoom, annotations.',
  url: 'https://omnitoolset.com/pdf-editor',
  applicationCategory: 'UtilityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Add text to PDF',
    'Insert images',
    'Draw shapes (rectangles, circles)',
    'Add highlights',
    'Draw lines and arrows',
    'Undo/Redo system',
    'Zoom controls',
    'Page thumbnails',
    'Annotation management',
  ],
};

/**
 * PDF Editor - Standalone Application
 * 
 * This is a completely independent PDF editing application.
 * It runs under the OmniToolset website but has its own identity
 * and full-screen application experience.
 */
export default function PdfEditorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Minimal App Header - Independent Application Identity */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl">✏️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PDF Editor</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Professional PDF Editing Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                ← Back to OmniToolset
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Application Container */}
      <main className="flex-1 overflow-hidden">
        <PdfEditorClient />
      </main>

      {/* Minimal Footer - Application Info */}
      <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-slate-800 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>Powered by OmniToolset</span>
              <span>•</span>
              <span>100% Free • No Registration • No Watermarks</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Version 1.0</span>
            </div>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}

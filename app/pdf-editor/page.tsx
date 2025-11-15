import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PdfEditor from '@/components/tools/pdf-editor';

export const metadata: Metadata = {
  title: 'FREE PDF Editor Online - Edit PDF Files Instantly | No Registration',
  description: 'Professional FREE PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files. Edit PDF instantly, no registration, no watermarks. Advanced PDF editing tools with undo/redo, zoom, annotations. Best PDF editor 2024.',
  keywords: 'pdf editor, edit pdf, pdf editor online, free pdf editor, edit pdf online, pdf editor free, online pdf editor, pdf editor tool, edit pdf files, pdf editor no registration, best pdf editor, how to edit pdf, pdf editor 2024, edit pdf online free, pdf editor web, free online pdf editor, edit pdf text, pdf annotation tool, pdf markup tool, edit pdf pages, pdf editor instant, professional pdf editor, advanced pdf editor, pdf editor with undo, pdf editor zoom, pdf editor annotations',
  openGraph: {
    title: 'FREE PDF Editor Online - Edit PDF Files Instantly',
    description: 'Professional FREE PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files. Edit PDF instantly, no registration, no watermarks.',
    url: 'https://omnitoolset.com/pdf-editor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FREE PDF Editor Online - Edit PDF Files Instantly',
    description: 'Professional FREE PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files.',
  },
  alternates: {
    canonical: 'https://omnitoolset.com/pdf-editor',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'FREE PDF Editor Online - Professional PDF Editing Tool',
  description: 'Professional FREE PDF Editor online. Add text, images, shapes, highlights, arrows to PDF files. Edit PDF instantly, no registration, no watermarks. Advanced PDF editing tools with undo/redo, zoom, annotations.',
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

export default function PdfEditorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-16">
          <div className="container">
            <div className="text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                ✏️ Professional PDF Editor
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-indigo-100">
                Edit PDF files instantly. Add text, images, shapes, highlights, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">100% FREE</span>
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">No Registration</span>
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">No Watermarks</span>
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">Unlimited Use</span>
                <span className="px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">Works in Browser</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">Text & Annotations</h3>
              <p className="text-slate-400 text-sm">
                Add custom text with different fonts, sizes, and colors. Highlight important sections with customizable colors.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">Drawing Tools</h3>
              <p className="text-slate-400 text-sm">
                Draw rectangles, circles, lines, and arrows. Customize colors and stroke width for professional results.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">Image Insertion</h3>
              <p className="text-slate-400 text-sm">
                Insert images (JPG, PNG) into your PDF. Resize and position them exactly where you need.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">↶↷</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">Undo/Redo</h3>
              <p className="text-slate-400 text-sm">
                Full history tracking. Undo and redo any changes with keyboard shortcuts (Ctrl+Z, Ctrl+Y).
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">Zoom & Navigation</h3>
              <p className="text-slate-400 text-sm">
                Zoom from 50% to 300%. Navigate pages with thumbnails sidebar. Perfect for detailed editing.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-indigo-500 transition-colors">
              <div className="text-4xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-100">Professional Output</h3>
              <p className="text-slate-400 text-sm">
                All edits are permanently saved to the PDF file. Works with all PDF readers including Adobe Reader.
              </p>
            </div>
          </div>

          {/* Editor Component */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6">
            <PdfEditor />
          </div>

          {/* How It Works */}
          <div className="mt-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-indigo-300 text-center">How to Edit PDF Files</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-300">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-slate-200">Upload PDF</h3>
                <p className="text-sm text-slate-400">Click or drag your PDF file to start editing</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-300">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-slate-200">Choose Tool</h3>
                <p className="text-sm text-slate-400">Select text, highlight, shapes, or image tool</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-300">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-slate-200">Edit PDF</h3>
                <p className="text-sm text-slate-400">Add annotations, draw, highlight, or insert images</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-indigo-300">
                  4
                </div>
                <h3 className="font-semibold mb-2 text-slate-200">Download</h3>
                <p className="text-sm text-slate-400">Download your edited PDF instantly</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-200">⌨️ Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">T</kbd>
                <span className="ml-2 text-slate-400">Text Tool</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">H</kbd>
                <span className="ml-2 text-slate-400">Highlight</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">R</kbd>
                <span className="ml-2 text-slate-400">Rectangle</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">C</kbd>
                <span className="ml-2 text-slate-400">Circle</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">L</kbd>
                <span className="ml-2 text-slate-400">Line</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">A</kbd>
                <span className="ml-2 text-slate-400">Arrow</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">Ctrl+Z</kbd>
                <span className="ml-2 text-slate-400">Undo</span>
              </div>
              <div>
                <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">Ctrl+Y</kbd>
                <span className="ml-2 text-slate-400">Redo</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </div>
  );
}


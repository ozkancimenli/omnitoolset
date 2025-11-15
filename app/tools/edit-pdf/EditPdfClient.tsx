'use client';

import ToolHero from '@/components/tools/ToolHero';
import PdfEditor from '@/components/tools/pdf-editor';
import RelatedTools from '@/components/tools/RelatedTools';
import FaqSection from '@/components/tools/FaqSection';

// FAQ data
const faqs = [
  {
    question: 'Is this PDF editor free to use?',
    answer:
      'Yes, our PDF editor is completely free to use. You can reorder, rotate, and delete pages from your PDF files without any cost, registration, or watermarks.',
  },
  {
    question: 'Do you store my files?',
    answer:
      'No, we do not store your files. All processing happens in your browser. Your PDF files never leave your device, ensuring complete privacy and security.',
  },
  {
    question: 'Is there a maximum file size?',
    answer:
      'Yes, the maximum file size is 50MB per PDF file. This ensures fast processing and optimal performance for all users.',
  },
  {
    question: 'Does the editor add a watermark?',
    answer:
      'No, we never add watermarks to your PDF files. The edited PDF you download will be completely clean and professional.',
  },
  {
    question: 'Can I undo changes?',
    answer:
      'Yes, you can reset all changes at any time using the "Reset Changes" button in the toolbar. This will restore your PDF to its original state.',
  },
  {
    question: 'What PDF operations are supported?',
    answer:
      'You can add text (with custom fonts and alignment), insert images, draw shapes (rectangles, circles, lines, arrows), add clickable links, create sticky notes, draw freely with the freehand tool, highlight text, and use the eraser to remove elements. You can also reorder, rotate, and delete pages. All changes are applied when you download the edited PDF.',
  },
];

export default function EditPdfClient() {
  return (
    <>
      {/* Hero Section */}
      <ToolHero
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/#tools' },
          { label: 'PDF', href: '/categories#pdf' },
          { label: 'Edit PDF' },
        ]}
        title="Edit PDF Online – Full Featured PDF Editor"
        subtitle="Add text, images, shapes, links, notes, and more to your PDF. Reorder, rotate, and delete pages. Professional PDF editing in your browser. No signup required."
        primaryCTA={{
          label: 'Choose PDF file',
          onClick: () => {
            // Trigger file input click
            const input = document.getElementById('pdf-file-input') as HTMLInputElement;
            if (input) {
              input.click();
            }
          },
        }}
        secondaryText="or drag & drop your file here"
        badges={['Free to use', 'Secure processing', 'No watermark']}
        visualElement={
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={num}
                    className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-lg shadow-md flex items-center justify-center border-2 border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                      {num}
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                ✨ Edit Pages
              </div>
            </div>
          </div>
        }
      />

      {/* Full Featured PDF Editor Section */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Professional PDF Editor
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Add text, images, shapes, links, notes, and annotations. All editing features in one place.
              </p>
            </div>
            {/* Full PDF Editor Component */}
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-slate-700" style={{ height: 'calc(100vh - 300px)', minHeight: '800px', maxHeight: '1200px' }}>
              <PdfEditor toolId="edit-pdf" />
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
            How to Edit Your PDF Online
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Upload Your PDF
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Click the "Choose PDF file" button or drag and drop your PDF file into the upload area.
                  The file will be processed instantly in your browser.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Edit Your PDF
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Use the toolbar to add text, images, shapes, links, sticky notes, and freehand drawings.
                  Double-click text to edit. Drag annotations to move them. Use the eraser to remove unwanted elements.
                  All changes are applied in real-time.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Download Your Edited PDF
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Once you're satisfied with your changes, click "Download Edited PDF" to save your
                  modified PDF file. No watermarks, no registration required.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Why Use Our PDF Editor?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Our professional PDF editor offers all the features you need in one place. Add text with custom fonts and alignment,
              insert images and shapes, create clickable links, add sticky notes for comments, draw freely with the freehand tool,
              and use the eraser to remove unwanted elements. All processing happens in your browser for maximum security and privacy.
              No installation, no registration, no watermarks - just professional PDF editing at your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* Related Tools */}
      <RelatedTools currentToolSlug="edit-pdf" category="PDF" limit={4} />

      {/* FAQ Section */}
      <FaqSection faqs={faqs} />
    </>
  );
}


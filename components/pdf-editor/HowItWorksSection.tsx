'use client';

/**
 * How It Works Section
 * 
 * Clear, step-by-step guide explaining how to use the PDF editor.
 * Written in a calm, helpful tone.
 */
export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'Upload Your PDF File',
      description:
        'Click "Choose PDF file" or drag and drop your PDF into the upload area. The file will be processed instantly in your browser - no server upload required.',
    },
    {
      number: 2,
      title: 'Edit Your Pages',
      description:
        'Reorder pages by dragging and dropping them into your preferred order. Rotate pages using the rotation buttons, or delete unwanted pages with the delete button.',
    },
    {
      number: 3,
      title: 'Download Your Edited PDF',
      description:
        'Once you\'re satisfied with your changes, click "Download Edited PDF" to save your modified file. All changes are applied instantly - no watermarks, no registration required.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          How to Edit Your PDF Online
        </h2>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">
            Why Edit PDFs Online?
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Editing PDFs online offers numerous advantages over traditional desktop software. Our
            browser-based editor works on any device - desktop, tablet, or mobile - requires no
            installation, and processes your files locally for maximum security. Whether you need
            to reorganize a document, fix page orientations, or remove unnecessary pages, our tool
            makes it quick and effortless.
          </p>
        </div>
      </div>
    </section>
  );
}


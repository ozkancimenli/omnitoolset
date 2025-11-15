'use client';

import { useState } from 'react';
import Navbar from '@/components/pdf-editor/Navbar';
import Hero from '@/components/pdf-editor/Hero';
import PdfEditorStandalone from '@/components/pdf-editor/PdfEditorStandalone';
import HowItWorksSection from '@/components/pdf-editor/HowItWorksSection';
import FaqSection from '@/components/tools/FaqSection';
import Footer from '@/components/pdf-editor/Footer';

// FAQ data
const faqs = [
  {
    question: 'Is this PDF editor free to use?',
    answer:
      'Yes, our PDF editor is completely free to use. You can reorder, rotate, and delete pages from your PDF files without any cost, registration, or watermarks.',
  },
  {
    question: 'Do you store my files on your servers?',
    answer:
      'No, we do not store your files. All processing happens in your browser. Your PDF files never leave your device, ensuring complete privacy and security.',
  },
  {
    question: 'Is there a file size limit?',
    answer:
      'Yes, the maximum file size is 50MB per PDF file. This ensures fast processing and optimal performance for all users.',
  },
  {
    question: 'Do you add any watermark?',
    answer:
      'No, we never add watermarks to your PDF files. The edited PDF you download will be completely clean and professional.',
  },
  {
    question: 'Can I undo changes?',
    answer:
      'Yes, you can reset all changes at any time using the "Reset Changes" button in the toolbar. This will restore your PDF to its original state.',
  },
];

/**
 * Standalone PDF Editor Client Component
 * 
 * This is the main client component for the standalone PDF editor app.
 * It combines all sections: Hero, Editor, How It Works, FAQ, and Footer.
 * 
 * The design is calm, professional, and trustworthy - designed to make
 * users feel comfortable and confident using the tool.
 */
export default function StandaloneClient() {
  const [fileInputTriggered, setFileInputTriggered] = useState(false);

  const handleFileSelect = () => {
    setFileInputTriggered(true);
    // Trigger file input click
    const input = document.getElementById('pdf-file-input-standalone') as HTMLInputElement;
    if (input) {
      input.click();
    }
    // Reset after a brief moment
    setTimeout(() => setFileInputTriggered(false), 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero onFileSelect={handleFileSelect} />

        {/* Hidden file input for hero CTA */}
        <input
          id="pdf-file-input-standalone"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Trigger file selection in editor
              const editorInput = document.getElementById('pdf-file-input') as HTMLInputElement;
              if (editorInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                editorInput.files = dataTransfer.files;
                editorInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }}
        />

        {/* Editor Section */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto">
            <PdfEditorStandalone />
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <FaqSection faqs={faqs} />
        </section>
      </main>

      <Footer />
    </div>
  );
}


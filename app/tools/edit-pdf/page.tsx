import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditPdfClient from './EditPdfClient';

export const metadata: Metadata = {
  title: 'Edit PDF Online – Reorder, Rotate & Delete Pages | OmniToolset',
  description:
    'Free online PDF editor to reorder, rotate, and delete pages from your PDF files. Fast, secure, and easy-to-use PDF editing tool. No registration required.',
  keywords:
    'edit pdf, pdf editor, reorder pdf pages, rotate pdf pages, delete pdf pages, pdf page editor, edit pdf online, free pdf editor, pdf editor online, edit pdf pages, reorder pdf, rotate pdf, delete pdf pages online, pdf page manager, edit pdf file, pdf editing tool, online pdf editor free, edit pdf no registration, pdf page editor online, best pdf editor',
  openGraph: {
    title: 'Edit PDF Online – Reorder, Rotate & Delete Pages | OmniToolset',
    description:
      'Free online PDF editor to reorder, rotate, and delete pages from your PDF files. Fast, secure, and easy-to-use.',
    url: 'https://omnitoolset.com/tools/edit-pdf',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit PDF Online – Reorder, Rotate & Delete Pages',
    description: 'Free online PDF editor to reorder, rotate, and delete pages from your PDF files.',
  },
  alternates: {
    canonical: 'https://omnitoolset.com/tools/edit-pdf',
  },
};

// JSON-LD FAQ Schema
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
      'You can reorder pages by dragging and dropping, rotate pages left or right, and delete unwanted pages. All changes are applied when you download the edited PDF.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function EditPdfPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <Header />
      <main className="flex-1">
        <EditPdfClient />
      </main>
      <Footer />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}


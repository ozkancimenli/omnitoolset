import { Metadata } from 'next';
import StandaloneClient from './StandaloneClient';

export const metadata: Metadata = {
  title: 'Edit PDF Online – Full Featured PDF Editor | OmniPDF Editor',
  description:
    'Professional PDF editor with text, images, shapes, links, notes, freehand drawing, and more. Add annotations, edit content, reorder pages. Fast, secure, and easy-to-use PDF editing tool with a clean, modern interface.',
  keywords:
    'edit pdf, pdf editor, add text to pdf, add image to pdf, pdf annotation, pdf link, pdf sticky note, freehand pdf drawing, pdf eraser, reorder pdf pages, rotate pdf pages, delete pdf pages, pdf page editor, edit pdf online, free pdf editor, pdf editor online, edit pdf pages, reorder pdf, rotate pdf, delete pdf pages online, pdf page manager, edit pdf file, pdf editing tool, online pdf editor free, edit pdf no registration, pdf page editor online, best pdf editor, professional pdf editor',
  openGraph: {
    title: 'Edit PDF Online – Full Featured PDF Editor | OmniPDF Editor',
    description:
      'Professional PDF editor with text, images, shapes, links, notes, freehand drawing, and more. Fast, secure, and easy-to-use.',
    url: 'https://omnitoolset.com/pdf-editor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit PDF Online – Full Featured PDF Editor',
    description: 'Professional PDF editor with text, images, shapes, links, notes, freehand drawing, and more.',
  },
  alternates: {
    canonical: 'https://omnitoolset.com/pdf-editor',
  },
};

// FAQ data for JSON-LD schema
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
      'Yes, you can use the Undo (Ctrl+Z) and Redo (Ctrl+Y) buttons in the toolbar to undo or redo your changes. This works for all editing operations including text, images, shapes, and annotations.',
  },
  {
    question: 'What PDF operations are supported?',
    answer:
      'You can add text (with custom fonts and alignment), insert images, draw shapes (rectangles, circles, lines, arrows), add clickable links, create sticky notes, draw freely with the freehand tool, highlight text, and use the eraser to remove elements. You can also reorder, rotate, and delete pages. All changes are applied when you download the edited PDF.',
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

/**
 * OmniPDF Editor - Standalone Application
 * 
 * A calm, professional, standalone PDF editor application.
 * Designed to feel trustworthy and encourage engagement.
 * 
 * This app can be:
 * - Hosted on a subdomain (e.g., editor.omnitoolset.com)
 * - Linked from the main OmniToolset website
 * - Embedded via iframe if needed
 * 
 * Design Philosophy:
 * - Calm, minimal, professional
 * - No flashy colors or overwhelming UI
 * - Plenty of whitespace
 * - Clear typography hierarchy
 * - Trustworthy appearance
 */
export default function PdfEditorPage() {
  return (
    <>
      <StandaloneClient />
      
      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

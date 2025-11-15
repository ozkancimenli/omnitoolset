import { Metadata } from 'next';
import PdfEditorClient from './PdfEditorClient';

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

export default function PdfEditorPage() {
  return <PdfEditorClient />;
}

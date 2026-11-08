'use client';
import dynamic from 'next/dynamic';

const load = (mod, name) => dynamic(() => mod().then((m) => m[name]), { ssr: false, loading: () => <div className="tool muted">Loading tool…</div> });
const img = () => import('@/components/tools/ImageTools');
const pdf = () => import('@/components/tools/PdfTools');
const text = () => import('@/components/tools/TextTools');
const design = () => import('@/components/tools/DesignTools');

const MAP = {
  'compress-image': load(img, 'Compressor'),
  'convert-image': load(img, 'Converter'),
  'resize-image': load(img, 'Resizer'),
  'crop-image': load(img, 'Cropper'),
  'remove-exif': load(img, 'ExifRemover'),
  'merge-pdf': load(pdf, 'MergePdf'),
  'split-pdf': load(pdf, 'SplitPdf'),
  'jpg-to-pdf': load(pdf, 'ImagesToPdf'),
  'rotate-pdf': load(pdf, 'RotatePdf'),
  'unit-converter': load(() => import('@/components/tools/UnitConverter'), 'default'),
  'qr-code-generator': load(design, 'QrGenerator'),
  'og-image-generator': load(design, 'OgImageGenerator'),
  'color-converter': load(design, 'ColorConverter'),
  'word-counter': load(text, 'WordCounter'),
  'case-converter': load(text, 'CaseConverter'),
  'json-formatter': load(text, 'JsonFormatter'),
  'base64-encode-decode': load(text, 'Base64Tool'),
  'password-generator': load(text, 'PasswordGenerator'),
};

export default function ToolRenderer({ slug }) {
  const C = MAP[slug];
  return C ? <C /> : null;
}

'use client';
import dynamic from 'next/dynamic';

const load = (mod, name) => dynamic(() => mod().then((m) => m[name]), { ssr: false, loading: () => <div className="tool muted">Loading tool…</div> });
const img = () => import('@/components/tools/ImageTools');
const pdf = () => import('@/components/tools/PdfTools');
const text = () => import('@/components/tools/TextTools');
const design = () => import('@/components/tools/DesignTools');

const calc = () => import('@/components/tools/Calculators');

const MAP = {
  'percentage-calculator': load(calc, 'PercentageCalculator'),
  'age-calculator': load(calc, 'AgeCalculator'),
  'discount-calculator': load(calc, 'DiscountCalculator'),
  'tip-calculator': load(calc, 'TipCalculator'),
  'bmi-calculator': load(calc, 'BmiCalculator'),
  'loan-calculator': load(calc, 'LoanCalculator'),
  'compress-image': load(img, 'Compressor'),
  'convert-image': load(img, 'Converter'),
  'resize-image': load(img, 'Resizer'),
  'crop-image': load(img, 'Cropper'),
  'remove-exif': load(img, 'ExifRemover'),
  'watermark-image': load(img, 'Watermark'),
  'csv-to-json': load(() => import('@/components/tools/CsvJson'), 'default'),
  'json-to-csv': load(() => import('@/components/tools/CsvJson'), 'JsonToCsv'),
  'lorem-ipsum-generator': load(text, 'LoremIpsum'),
  'merge-pdf': load(pdf, 'MergePdf'),
  'split-pdf': load(pdf, 'SplitPdf'),
  'jpg-to-pdf': load(pdf, 'ImagesToPdf'),
  'rotate-pdf': load(pdf, 'RotatePdf'),
  'remove-pdf-pages': load(pdf, 'RemovePdfPages'),
  'timestamp-converter': load(() => import('@/components/tools/TimestampConverter'), 'default'),
  'unit-converter': load(() => import('@/components/tools/UnitConverter'), 'default'),
  'qr-code-generator': load(design, 'QrGenerator'),
  'og-image-generator': load(design, 'OgImageGenerator'),
  'color-converter': load(design, 'ColorConverter'),
  'favicon-generator': load(design, 'FaviconGenerator'),
  'image-color-picker': load(design, 'ImageColorPicker'),
  'markdown-to-html': load(() => import('@/components/tools/MarkdownHtml'), 'default'),
  'diff-checker': load(() => import('@/components/tools/DiffChecker'), 'default'),
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

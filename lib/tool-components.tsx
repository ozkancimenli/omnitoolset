'use client';

import dynamic from 'next/dynamic';

// Lazy load tool components
export const toolComponents: Record<string, React.ComponentType> = {
  // PDF Tools
  'pdf-merge': dynamic(() => import('@/components/tools/pdf-merge'), { ssr: false }),
  'pdf-split': dynamic(() => import('@/components/tools/pdf-split'), { ssr: false }),
  'pdf-compress': dynamic(() => import('@/components/tools/pdf-compress'), { ssr: false }),
  'pdf-to-word': dynamic(() => import('@/components/tools/pdf-to-word'), { ssr: false }),
  'pdf-to-jpg': dynamic(() => import('@/components/tools/pdf-to-jpg'), { ssr: false }),
  'pdf-to-png': dynamic(() => import('@/components/tools/pdf-to-jpg'), { ssr: false }), // Reuse pdf-to-jpg
  'jpg-to-pdf': dynamic(() => import('@/components/tools/jpg-to-pdf'), { ssr: false }),
  'png-to-pdf': dynamic(() => import('@/components/tools/jpg-to-pdf'), { ssr: false }), // Reuse jpg-to-pdf
  'word-to-pdf': dynamic(() => import('@/components/tools/word-to-pdf'), { ssr: false }),
  'excel-to-pdf': dynamic(() => import('@/components/tools/excel-to-pdf'), { ssr: false }),
  'powerpoint-to-pdf': dynamic(() => import('@/components/tools/powerpoint-to-pdf'), { ssr: false }),
  'txt-to-pdf': dynamic(() => import('@/components/tools/txt-to-pdf'), { ssr: false }),
  'pdf-rotate': dynamic(() => import('@/components/tools/pdf-rotate'), { ssr: false }),
  'pdf-encrypt': dynamic(() => import('@/components/tools/pdf-encrypt'), { ssr: false }),
  'pdf-delete-pages': dynamic(() => import('@/components/tools/pdf-delete-pages'), { ssr: false }),
  'pdf-extract-text': dynamic(() => import('@/components/tools/pdf-extract-text'), { ssr: false }),
  'pdf-editor': dynamic(() => import('@/components/tools/pdf-editor'), { ssr: false }),
  
  // Image Tools
  'image-resize': dynamic(() => import('@/components/tools/image-resize'), { ssr: false }),
  'image-compress': dynamic(() => import('@/components/tools/image-compress'), { ssr: false }),
  'jpg-png-convert': dynamic(() => import('@/components/tools/jpg-png-convert'), { ssr: false }),
  'webp-convert': dynamic(() => import('@/components/tools/webp-convert'), { ssr: false }),
  // Media Tools
  'mp4-to-mp3': dynamic(() => import('@/components/tools/mp4-to-mp3'), { ssr: false }),
  
  // Text Tools
  'text-case': dynamic(() => import('@/components/tools/text-case'), { ssr: false }),
  'text-counter': dynamic(() => import('@/components/tools/text-counter'), { ssr: false }),
  'base64-encode': dynamic(() => import('@/components/tools/base64-encode'), { ssr: false }),
  'base64-decode': dynamic(() => import('@/components/tools/base64-decode'), { ssr: false }),
  'url-encode': dynamic(() => import('@/components/tools/url-encode'), { ssr: false }),
  'url-decode': dynamic(() => import('@/components/tools/url-decode'), { ssr: false }),
  'lorem-generator': dynamic(() => import('@/components/tools/lorem-generator'), { ssr: false }),
  'remove-duplicates': dynamic(() => import('@/components/tools/remove-duplicates'), { ssr: false }),
  'text-sorter': dynamic(() => import('@/components/tools/text-sorter'), { ssr: false }),
  'text-diff': dynamic(() => import('@/components/tools/text-diff'), { ssr: false }),
  'markdown-to-html': dynamic(() => import('@/components/tools/markdown-to-html'), { ssr: false }),
  'html-escape': dynamic(() => import('@/components/tools/html-escape'), { ssr: false }),
  'html-unescape': dynamic(() => import('@/components/tools/html-unescape'), { ssr: false }),
  
  // Developer Tools
  'json-formatter': dynamic(() => import('@/components/tools/json-formatter'), { ssr: false }),
  'json-minify': dynamic(() => import('@/components/tools/json-minify'), { ssr: false }),
  'jwt-decoder': dynamic(() => import('@/components/tools/jwt-decoder'), { ssr: false }),
  'uuid-generator': dynamic(() => import('@/components/tools/uuid-generator'), { ssr: false }),
  'hash-generator': dynamic(() => import('@/components/tools/hash-generator'), { ssr: false }),
  'regex-tester': dynamic(() => import('@/components/tools/regex-tester'), { ssr: false }),
  'color-picker': dynamic(() => import('@/components/tools/color-picker'), { ssr: false }),
  'timestamp-converter': dynamic(() => import('@/components/tools/timestamp-converter'), { ssr: false }),
  
  // QR Code Tools
  'qr-generator': dynamic(() => import('@/components/tools/qr-generator'), { ssr: false }),
  
  // Other Tools
  'password-generator': dynamic(() => import('@/components/tools/password-generator'), { ssr: false }),
  'date-converter': dynamic(() => import('@/components/tools/date-converter'), { ssr: false }),
  'random-number': dynamic(() => import('@/components/tools/random-number'), { ssr: false }),
  
  // New Text Tools
  'reverse-text': dynamic(() => import('@/components/tools/reverse-text'), { ssr: false }),
  'text-replace': dynamic(() => import('@/components/tools/text-replace'), { ssr: false }),
  'word-count': dynamic(() => import('@/components/tools/word-count'), { ssr: false }),
  'text-to-binary': dynamic(() => import('@/components/tools/text-to-binary'), { ssr: false }),
  'binary-to-text': dynamic(() => import('@/components/tools/binary-to-text'), { ssr: false }),
  'text-to-morse': dynamic(() => import('@/components/tools/text-to-morse'), { ssr: false }),
  'morse-to-text': dynamic(() => import('@/components/tools/morse-to-text'), { ssr: false }),
  'slug-generator': dynamic(() => import('@/components/tools/slug-generator'), { ssr: false }),
  'camel-case': dynamic(() => import('@/components/tools/camel-case'), { ssr: false }),
  'snake-case': dynamic(() => import('@/components/tools/snake-case'), { ssr: false }),
  'kebab-case': dynamic(() => import('@/components/tools/kebab-case'), { ssr: false }),
  'pascal-case': dynamic(() => import('@/components/tools/pascal-case'), { ssr: false }),
  'extract-emails': dynamic(() => import('@/components/tools/extract-emails'), { ssr: false }),
  'extract-urls': dynamic(() => import('@/components/tools/extract-urls'), { ssr: false }),
  'add-line-numbers': dynamic(() => import('@/components/tools/add-line-numbers'), { ssr: false }),
  'text-reverse-lines': dynamic(() => import('@/components/tools/text-reverse-lines'), { ssr: false }),
  'markdown-editor': dynamic(() => import('@/components/tools/markdown-editor'), { ssr: false }),
  
  // New Developer Tools
  'css-formatter': dynamic(() => import('@/components/tools/css-formatter'), { ssr: false }),
  'css-minify': dynamic(() => import('@/components/tools/css-minify'), { ssr: false }),
  'html-formatter': dynamic(() => import('@/components/tools/html-formatter'), { ssr: false }),
  'html-minify': dynamic(() => import('@/components/tools/html-minify'), { ssr: false }),
  'javascript-formatter': dynamic(() => import('@/components/tools/javascript-formatter'), { ssr: false }),
  'sql-formatter': dynamic(() => import('@/components/tools/sql-formatter'), { ssr: false }),
  'xml-formatter': dynamic(() => import('@/components/tools/xml-formatter'), { ssr: false }),
  'yaml-formatter': dynamic(() => import('@/components/tools/yaml-formatter'), { ssr: false }),
  'url-parser': dynamic(() => import('@/components/tools/url-parser'), { ssr: false }),
  'password-strength': dynamic(() => import('@/components/tools/password-strength'), { ssr: false }),
  'jwt-encoder': dynamic(() => import('@/components/tools/jwt-encoder'), { ssr: false }),
  'hmac-generator': dynamic(() => import('@/components/tools/hmac-generator'), { ssr: false }),
  'cron-expression': dynamic(() => import('@/components/tools/cron-expression'), { ssr: false }),
  'json-to-csv': dynamic(() => import('@/components/tools/json-to-csv'), { ssr: false }),
  'csv-to-json': dynamic(() => import('@/components/tools/csv-to-json'), { ssr: false }),
  'json-to-xml': dynamic(() => import('@/components/tools/json-to-xml'), { ssr: false }),
  'xml-to-json': dynamic(() => import('@/components/tools/xml-to-json'), { ssr: false }),
  'json-to-yaml': dynamic(() => import('@/components/tools/json-to-yaml'), { ssr: false }),
  'yaml-to-json': dynamic(() => import('@/components/tools/yaml-to-json'), { ssr: false }),
  'meta-tag-generator': dynamic(() => import('@/components/tools/meta-tag-generator'), { ssr: false }),
  'open-graph-generator': dynamic(() => import('@/components/tools/open-graph-generator'), { ssr: false }),
  'twitter-card-generator': dynamic(() => import('@/components/tools/twitter-card-generator'), { ssr: false }),
  'favicon-generator': dynamic(() => import('@/components/tools/favicon-generator'), { ssr: false }),
  'contrast-checker': dynamic(() => import('@/components/tools/contrast-checker'), { ssr: false }),
  
  // New Calculator Tools
  'number-base-converter': dynamic(() => import('@/components/tools/number-base-converter'), { ssr: false }),
  'percentage-calculator': dynamic(() => import('@/components/tools/percentage-calculator'), { ssr: false }),
  'tip-calculator': dynamic(() => import('@/components/tools/tip-calculator'), { ssr: false }),
  'age-calculator': dynamic(() => import('@/components/tools/age-calculator'), { ssr: false }),
  'bmi-calculator': dynamic(() => import('@/components/tools/bmi-calculator'), { ssr: false }),
  'timezone-converter': dynamic(() => import('@/components/tools/timezone-converter'), { ssr: false }),
  'stopwatch': dynamic(() => import('@/components/tools/stopwatch'), { ssr: false }),
  'countdown-timer': dynamic(() => import('@/components/tools/countdown-timer'), { ssr: false }),
  
  // New Image Tools
  'image-to-base64': dynamic(() => import('@/components/tools/image-to-base64'), { ssr: false }),
  'base64-to-image': dynamic(() => import('@/components/tools/base64-to-image'), { ssr: false }),
  'image-grayscale': dynamic(() => import('@/components/tools/image-grayscale'), { ssr: false }),
  'image-invert': dynamic(() => import('@/components/tools/image-invert'), { ssr: false }),
  'image-sepia': dynamic(() => import('@/components/tools/image-sepia'), { ssr: false }),
  
  // New PDF Tools
  'pdf-page-count': dynamic(() => import('@/components/tools/pdf-page-count'), { ssr: false }),
  'pdf-merge-images': dynamic(() => import('@/components/tools/pdf-merge-images'), { ssr: false }),
  
  // Unit Converters
  'length-converter': dynamic(() => import('@/components/tools/length-converter'), { ssr: false }),
  'temperature-converter': dynamic(() => import('@/components/tools/temperature-converter'), { ssr: false }),
  'salary-calculator': dynamic(() => import('@/components/tools/salary-calculator'), { ssr: false }),
  'unit-converter': dynamic(() => import('@/components/tools/unit-converter'), { ssr: false }),
  'currency-converter': dynamic(() => import('@/components/tools/currency-converter'), { ssr: false }),
  'gis-converter': dynamic(() => import('@/components/tools/gis-converter'), { ssr: false }),
  'video-converter': dynamic(() => import('@/components/tools/video-converter'), { ssr: false }),
  
  // Additional Video/Audio Tools
  'mp4-converter': dynamic(() => import('@/components/tools/mp4-converter'), { ssr: false }),
  'mov-to-mp4': dynamic(() => import('@/components/tools/mov-to-mp4'), { ssr: false }),
  'video-to-mp3': dynamic(() => import('@/components/tools/mp4-to-mp3'), { ssr: false }), // Reuse mp4-to-mp3
  'video-to-gif': dynamic(() => import('@/components/tools/video-to-gif'), { ssr: false }),
  'audio-converter': dynamic(() => import('@/components/tools/audio-converter'), { ssr: false }),
  'mp3-converter': dynamic(() => import('@/components/tools/mp3-converter'), { ssr: false }),
  
  // Additional Image Tools (reuse existing components)
  'image-to-pdf': dynamic(() => import('@/components/tools/jpg-to-pdf'), { ssr: false }), // Reuse jpg-to-pdf
  'heic-to-jpg': dynamic(() => import('@/components/tools/heic-to-jpg'), { ssr: false }),
  
  // Additional PDF/Document Tools
  'edit-pdf': dynamic(() => import('@/components/tools/pdf-editor'), { ssr: false }), // Reuse pdf-editor
  'epub-to-pdf': dynamic(() => import('@/components/tools/epub-to-pdf'), { ssr: false }),
  'epub-to-mobi': dynamic(() => import('@/components/tools/epub-to-mobi'), { ssr: false }),
  'document-converter': dynamic(() => import('@/components/tools/document-converter'), { ssr: false }),
  
  // Archive & Time Tools
  'rar-to-zip': dynamic(() => import('@/components/tools/rar-to-zip'), { ssr: false }),
  'archive-converter': dynamic(() => import('@/components/tools/archive-converter'), { ssr: false }),
  'pst-to-est': dynamic(() => import('@/components/tools/pst-to-est'), { ssr: false }),
  'cst-to-est': dynamic(() => import('@/components/tools/cst-to-est'), { ssr: false }),
  
  // Additional Unit Converters
  'lbs-to-kg': dynamic(() => import('@/components/tools/lbs-to-kg'), { ssr: false }),
  'kg-to-lbs': dynamic(() => import('@/components/tools/kg-to-lbs'), { ssr: false }),
  'feet-to-meters': dynamic(() => import('@/components/tools/feet-to-meters'), { ssr: false }),
};

export function getToolComponent(toolId: string): React.ComponentType<any> {
  return toolComponents[toolId] || (() => (
    <div className="text-center py-12">
      <p className="text-slate-400">This tool is coming soon!</p>
    </div>
  ));
}

let browserPromise: Promise<any> | null = null;
let nodePromise: Promise<any> | null = null;

export function loadPdfJs(context: 'browser' | 'node' = 'browser') {
  if (context === 'node') {
    if (!nodePromise) {
      nodePromise = import('pdfjs-dist/legacy/build/pdf.mjs');
    }
    return nodePromise;
  }
  if (!browserPromise) {
    browserPromise = import('pdfjs-dist').then((pdfjs) => {
      const hasWindow = typeof globalThis !== 'undefined' && typeof (globalThis as any).window !== 'undefined';
      if (hasWindow) {
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      }
      return pdfjs;
    });
  }
  return browserPromise;
}

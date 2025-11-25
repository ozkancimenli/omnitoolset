// PDF Page Rebuilding Utilities
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PdfTextRun } from '../types';
import { logError } from '../utils';

export interface TextModification {
  runId: string;
  newText: string;
  format?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    textDecoration?: 'none' | 'underline';
  };
}

/**
 * Rebuild PDF page with modified text using pdf-lib
 */
export const rebuildPdfPageWithText = async (
  pageNumber: number,
  textModifications: TextModification[],
  pdfLibDocRef: React.MutableRefObject<PDFDocument | null>,
  pdfDocRef: React.MutableRefObject<any>,
  pdfTextRuns: Record<number, PdfTextRun[]>,
  pdfEngineRef?: React.MutableRefObject<any>,
  file?: File | null,
  pdfUrl?: string | null,
  setPdfUrl?: (url: string | null) => void,
  setPdfLibDocRef?: (doc: PDFDocument | null) => void,
  renderPage?: (page: number) => Promise<void>
): Promise<boolean> => {
  // Try engine first if available
  if (pdfEngineRef?.current) {
    try {
      const result = await pdfEngineRef.current.modifyText(pageNumber, textModifications);
      
      if (result.success) {
        // Reload PDF to show changes
        if (file && pdfEngineRef.current) {
          const pdfBytes = await pdfEngineRef.current.savePdf();
          const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
          const newUrl = URL.createObjectURL(blob);
          
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
          }
          setPdfUrl?.(newUrl);
          
          // Update pdf-lib ref for backward compatibility
          if (setPdfLibDocRef) {
            const newDoc = await PDFDocument.load(pdfBytes);
            setPdfLibDocRef(newDoc);
          }
          
          // Re-render the page
          if (renderPage) {
            await renderPage(pageNumber);
          }
        }
        return true;
      } else {
        console.error('Engine modification failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error in engine modification:', error);
      logError(error as Error, 'rebuildPdfPageWithText (engine)', { pageNumber });
      // Fall through to legacy method
    }
  }
  
  // Fallback to legacy method if engine not available
  if (!pdfLibDocRef.current || !pdfDocRef.current) return false;
  
  try {
    const pdfDoc = pdfLibDocRef.current;
    const pages = pdfDoc.getPages();
    const page = pages[pageNumber - 1];
    
    if (!page) return false;
    
    // Get page dimensions
    const { width, height } = page.getSize();
    
    // Get all text runs for this page
    const runs: PdfTextRun[] = pdfTextRuns[pageNumber] || [];
    
    // Create a map of modifications
    const modificationMap = new Map<string, { newText: string; format?: any }>();
    textModifications.forEach(mod => {
      modificationMap.set(mod.runId, { newText: mod.newText, format: mod.format });
    });
    
    // Find text runs that need modification
    const runsToModify = runs.filter(run => modificationMap.has(run.id));
    
    if (runsToModify.length === 0) return false;
    
    // For each modified run, draw white rectangle + new text
    for (const run of runsToModify) {
      const mod = modificationMap.get(run.id);
      if (!mod) continue;
      
      const format = mod.format || {};
      const newText = mod.newText;
      
      // Get font properties
      const fontSize = format.fontSize || run.fontSize || 12;
      const fontFamily = format.fontFamily || run.fontName || 'Helvetica';
      const fontWeight = format.fontWeight || run.fontWeight || 'normal';
      const fontStyle = format.fontStyle || run.fontStyle || 'normal';
      
      // Map font family to pdf-lib StandardFonts
      let pdfFont = StandardFonts.Helvetica;
      if (fontFamily.toLowerCase().includes('times')) {
        pdfFont = fontWeight === 'bold' && fontStyle === 'italic' ? StandardFonts.TimesRomanBoldItalic :
                 fontWeight === 'bold' ? StandardFonts.TimesRomanBold :
                 fontStyle === 'italic' ? StandardFonts.TimesRomanItalic :
                 StandardFonts.TimesRoman;
      } else if (fontFamily.toLowerCase().includes('courier')) {
        pdfFont = fontWeight === 'bold' ? StandardFonts.CourierBold :
                 fontStyle === 'italic' ? StandardFonts.CourierOblique :
                 StandardFonts.Courier;
      } else {
        pdfFont = fontWeight === 'bold' && fontStyle === 'italic' ? StandardFonts.HelveticaBoldOblique :
                 fontWeight === 'bold' ? StandardFonts.HelveticaBold :
                 fontStyle === 'italic' ? StandardFonts.HelveticaOblique :
                 StandardFonts.Helvetica;
      }
      
      const font = await pdfDoc.embedFont(pdfFont);
      
      // Calculate text bounds accurately
      const textWidth = font.widthOfTextAtSize(newText, fontSize);
      const textHeight = fontSize;
      
      // Convert canvas Y to PDF Y (bottom-left origin)
      const pdfY = height - run.y;
      
      // Erase old text with white rectangle (with padding for clean coverage)
      const padding = 3;
      page.drawRectangle({
        x: run.x - padding,
        y: pdfY - textHeight - padding,
        width: Math.max(textWidth + (padding * 2), run.width + (padding * 2)),
        height: textHeight + (padding * 2),
        color: rgb(1, 1, 1), // White
        opacity: 1,
      });
      
      // Parse color
      let textColor = rgb(0, 0, 0);
      if (format.color) {
        const hex = format.color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        textColor = rgb(r, g, b);
      }
      
      // Calculate text position based on alignment
      let textX = run.x;
      if (format.textAlign === 'center') {
        textX = run.x - textWidth / 2;
      } else if (format.textAlign === 'right') {
        textX = run.x - textWidth;
      }
      
      // Draw new text directly on PDF page
      page.drawText(newText, {
        x: textX,
        y: pdfY - textHeight,
        size: fontSize,
        font: font,
        color: textColor,
      });
      
      // Draw underline if needed
      if (format.textDecoration === 'underline') {
        const underlineWidth = font.widthOfTextAtSize(newText, fontSize);
        page.drawLine({
          start: { x: textX, y: pdfY - textHeight - 2 },
          end: { x: textX + underlineWidth, y: pdfY - textHeight - 2 },
          thickness: 1,
          color: textColor,
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error rebuilding PDF page:', error);
    return false;
  }
};



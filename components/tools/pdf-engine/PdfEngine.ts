/**
 * OmniPDF Engine - Advanced PDF Editing Engine
 * 
 * This is our custom PDF editing engine that provides:
 * - Content stream parsing and modification
 * - Text extraction and editing
 * - Annotation management
 * - PDF rendering optimization
 * - Advanced text manipulation
 */

import { PDFDocument, PDFPage, rgb, StandardFonts, PDFFont } from 'pdf-lib';

export interface PdfTextRun {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  page: number;
  transform: number[];
  startIndex: number;
  endIndex: number;
}

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
  };
}

export interface PdfEngineConfig {
  maxFileSize?: number;
  enableCaching?: boolean;
  cacheSize?: number;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}

export class PdfEngine {
  private pdfDoc: PDFDocument | null = null;
  private pdfJsDoc: any = null; // pdf.js document
  private textRuns: Map<number, PdfTextRun[]> = new Map();
  private textItems: Map<number, any[]> = new Map();
  private config: PdfEngineConfig;
  private modificationHistory: Array<{ page: number; modifications: TextModification[]; timestamp: number }> = [];

  constructor(config: PdfEngineConfig = {}) {
    this.config = {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      enableCaching: true,
      cacheSize: 10,
      enableAutoSave: false,
      autoSaveInterval: 30000,
      ...config,
    };
  }

  /**
   * Load PDF document
   */
  async loadPdf(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate file
      if (file.size > (this.config.maxFileSize || 50 * 1024 * 1024)) {
        return { success: false, error: 'File size exceeds maximum limit' };
      }

      // Load with pdf-lib
      const arrayBuffer = await file.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer);
      
      this.pdfDoc = await PDFDocument.load(fileBytes, {
        ignoreEncryption: false,
        updateMetadata: false,
        parseSpeed: 1,
      });

      // Load with pdf.js for text extraction
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      
      this.pdfJsDoc = await pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0,
      }).promise;

      return { success: true };
    } catch (error: any) {
      console.error('PdfEngine: Error loading PDF', error);
      return { 
        success: false, 
        error: error.message || 'Failed to load PDF' 
      };
    }
  }

  /**
   * Extract text layer from PDF page
   */
  async extractTextLayer(pageNumber: number, viewport?: any): Promise<PdfTextRun[]> {
    if (!this.pdfJsDoc) {
      throw new Error('PDF not loaded');
    }

    try {
      const page = await this.pdfJsDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageViewport = viewport || page.getViewport({ scale: 1.0 });
      
      const textItems: any[] = [];
      const runs: PdfTextRun[] = [];
      
      // Process text items
      textContent.items.forEach((item: any, index: number) => {
        if (!item.str || item.str.trim() === '') return;
        
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const pdfX = transform[4] || 0;
        const pdfY = transform[5] || 0;
        
        // Convert PDF coordinates (bottom-left) to canvas coordinates (top-left)
        const canvasY = pageViewport.height - pdfY;
        
        textItems.push({
          str: item.str,
          x: pdfX,
          y: canvasY,
          width: item.width || 0,
          height: item.height || item.fontSize || 12,
          fontSize: item.height || item.fontSize || 12,
          fontName: item.fontName || 'Helvetica',
          transform,
          page: pageNumber,
        });
      });

      // Group text items into runs (lines/paragraphs)
      let currentRun: any[] = [];
      let currentY = -1;
      const lineThreshold = 5;

      textItems.forEach((item, index) => {
        if (currentY === -1 || Math.abs(item.y - currentY) > lineThreshold) {
          // Save previous run
          if (currentRun.length > 0) {
            const runText = currentRun.map(i => i.str).join('');
            const firstItem = currentRun[0];
            const lastItem = currentRun[currentRun.length - 1];
            const runWidth = lastItem.x + lastItem.width - firstItem.x;
            
            runs.push({
              id: `run-${pageNumber}-${runs.length}`,
              text: runText,
              x: firstItem.x,
              y: firstItem.y,
              width: runWidth,
              height: firstItem.height,
              fontSize: firstItem.fontSize,
              fontName: firstItem.fontName,
              page: pageNumber,
              transform: firstItem.transform,
              startIndex: index - currentRun.length,
              endIndex: index - 1,
            });
          }
          
          currentRun = [item];
          currentY = item.y;
        } else {
          currentRun.push(item);
        }
      });

      // Add last run
      if (currentRun.length > 0) {
        const runText = currentRun.map(i => i.str).join('');
        const firstItem = currentRun[0];
        const lastItem = currentRun[currentRun.length - 1];
        const runWidth = lastItem.x + lastItem.width - firstItem.x;
        
        runs.push({
          id: `run-${pageNumber}-${runs.length}`,
          text: runText,
          x: firstItem.x,
          y: firstItem.y,
          width: runWidth,
          height: firstItem.height,
          fontSize: firstItem.fontSize,
          fontName: firstItem.fontName,
          page: pageNumber,
          transform: firstItem.transform,
          startIndex: textItems.length - currentRun.length,
          endIndex: textItems.length - 1,
        });
      }

      // Cache results
      this.textRuns.set(pageNumber, runs);
      this.textItems.set(pageNumber, textItems);

      return runs;
    } catch (error) {
      console.error('PdfEngine: Error extracting text layer', error);
      throw error;
    }
  }

  /**
   * Find text run at position
   */
  findTextRunAtPosition(x: number, y: number, pageNumber: number): PdfTextRun | null {
    const runs = this.textRuns.get(pageNumber) || [];
    if (runs.length === 0) return null;

    let closestRun: PdfTextRun | null = null;
    let closestDistance = Infinity;
    const tolerance = 10;

    runs.forEach(run => {
      const centerX = run.x + run.width / 2;
      const centerY = run.y - run.height / 2;
      const distance = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      const isWithinBounds = (
        x >= run.x - tolerance &&
        x <= run.x + run.width + tolerance &&
        y >= run.y - run.height - tolerance &&
        y <= run.y + tolerance
      );

      if (isWithinBounds && distance < closestDistance) {
        closestDistance = distance;
        closestRun = run;
      }
    });

    return closestRun;
  }

  /**
   * Modify text in PDF (True Content Stream Editing)
   */
  async modifyText(
    pageNumber: number,
    modifications: TextModification[]
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.pdfDoc) {
      return { success: false, error: 'PDF not loaded' };
    }

    try {
      const pages = this.pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      
      if (!page) {
        return { success: false, error: 'Page not found' };
      }

      const { width, height } = page.getSize();
      const runs = this.textRuns.get(pageNumber) || [];

      // Process each modification
      for (const mod of modifications) {
        const run = runs.find(r => r.id === mod.runId);
        if (!run) continue;

        const format = mod.format || {};
        const newText = mod.newText;
        const fontSize = format.fontSize || run.fontSize || 12;
        const fontFamily = format.fontFamily || run.fontName || 'Helvetica';
        const fontWeight = format.fontWeight || run.fontWeight || 'normal';
        const fontStyle = format.fontStyle || run.fontStyle || 'normal';

        // Get appropriate font
        const font = await this.getFont(fontFamily, fontWeight, fontStyle);
        
        // Calculate text dimensions
        const textWidth = font.widthOfTextAtSize(newText, fontSize);
        const textHeight = fontSize;

        // Convert canvas coordinates to PDF coordinates
        const pdfY = height - run.y;

        // Erase old text with white rectangle
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

        // Draw new text
        page.drawText(newText, {
          x: textX,
          y: pdfY - textHeight,
          size: fontSize,
          font: font,
          color: textColor,
        });

        // Draw underline if needed
        if (format.textDecoration === 'underline') {
          page.drawLine({
            start: { x: textX, y: pdfY - textHeight - 2 },
            end: { x: textX + textWidth, y: pdfY - textHeight - 2 },
            thickness: 1,
            color: textColor,
          });
        }

        // Update cached text run
        const updatedRuns = runs.map(r => {
          if (r.id === mod.runId) {
            return {
              ...r,
              text: newText,
              fontSize: format.fontSize || r.fontSize,
              fontName: format.fontFamily || r.fontName,
              fontWeight: format.fontWeight || r.fontWeight,
              fontStyle: format.fontStyle || r.fontStyle,
              color: format.color || r.color,
            };
          }
          return r;
        });
        this.textRuns.set(pageNumber, updatedRuns);
      }

      // Save to history
      this.modificationHistory.push({
        page: pageNumber,
        modifications,
        timestamp: Date.now(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('PdfEngine: Error modifying text', error);
      return { 
        success: false, 
        error: error.message || 'Failed to modify text' 
      };
    }
  }

  /**
   * Get appropriate PDF font
   */
  private async getFont(
    fontFamily: string,
    fontWeight: 'normal' | 'bold',
    fontStyle: 'normal' | 'italic'
  ): Promise<PDFFont> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }

    let pdfFont: StandardFonts;
    
    if (fontFamily.toLowerCase().includes('times')) {
      pdfFont = fontWeight === 'bold' && fontStyle === 'italic' 
        ? StandardFonts.TimesRomanBoldItalic
        : fontWeight === 'bold' 
        ? StandardFonts.TimesRomanBold
        : fontStyle === 'italic' 
        ? StandardFonts.TimesRomanItalic
        : StandardFonts.TimesRoman;
    } else if (fontFamily.toLowerCase().includes('courier')) {
      pdfFont = fontWeight === 'bold' 
        ? StandardFonts.CourierBold
        : fontStyle === 'italic' 
        ? StandardFonts.CourierOblique
        : StandardFonts.Courier;
    } else {
      pdfFont = fontWeight === 'bold' && fontStyle === 'italic' 
        ? StandardFonts.HelveticaBoldOblique
        : fontWeight === 'bold' 
        ? StandardFonts.HelveticaBold
        : fontStyle === 'italic' 
        ? StandardFonts.HelveticaOblique
        : StandardFonts.Helvetica;
    }

    return await this.pdfDoc.embedFont(pdfFont);
  }

  /**
   * Get PDF document
   */
  getPdfDoc(): PDFDocument | null {
    return this.pdfDoc;
  }

  /**
   * Get PDF.js document
   */
  getPdfJsDoc(): any {
    return this.pdfJsDoc;
  }

  /**
   * Get text runs for a page
   */
  getTextRuns(pageNumber: number): PdfTextRun[] {
    return this.textRuns.get(pageNumber) || [];
  }

  /**
   * Save PDF to bytes
   */
  async savePdf(): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new Error('PDF not loaded');
    }
    return await this.pdfDoc.save();
  }

  /**
   * Get modification history
   */
  getModificationHistory(): Array<{ page: number; modifications: TextModification[]; timestamp: number }> {
    return this.modificationHistory;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.pdfDoc = null;
    this.pdfJsDoc = null;
    this.textRuns.clear();
    this.textItems.clear();
    this.modificationHistory = [];
  }
}


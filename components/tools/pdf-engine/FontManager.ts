/**
 * Font Manager - Advanced Font Embedding and Subsetting
 * 
 * Provides advanced font operations including subsetting, embedding, and metrics
 */

import { PDFFont, PDFDocument, StandardFonts } from 'pdf-lib';

export interface FontMetrics {
  ascent: number;
  descent: number;
  capHeight: number;
  xHeight: number;
  width: number;
  height: number;
  baseline: number;
}

export interface FontSubset {
  characters: Set<string>;
  glyphs: Map<string, number>;
}

export class FontManager {
  private fontCache: Map<string, PDFFont> = new Map();
  private fontMetricsCache: Map<string, FontMetrics> = new Map();
  private fontSubsets: Map<string, FontSubset> = new Map();

  /**
   * Get or embed font with caching
   */
  async getFont(
    pdfDoc: PDFDocument,
    fontFamily: string,
    fontWeight: 'normal' | 'bold' = 'normal',
    fontStyle: 'normal' | 'italic' = 'normal'
  ): Promise<PDFFont> {
    const cacheKey = `${fontFamily}-${fontWeight}-${fontStyle}`;
    
    if (this.fontCache.has(cacheKey)) {
      return this.fontCache.get(cacheKey)!;
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

    const font = await pdfDoc.embedFont(pdfFont);
    this.fontCache.set(cacheKey, font);
    
    return font;
  }

  /**
   * Get font metrics
   */
  getFontMetrics(
    font: PDFFont,
    fontSize: number,
    text: string
  ): FontMetrics {
    const cacheKey = `${font.name}-${fontSize}-${text}`;
    
    if (this.fontMetricsCache.has(cacheKey)) {
      return this.fontMetricsCache.get(cacheKey)!;
    }

    // Calculate metrics
    const width = font.widthOfTextAtSize(text, fontSize);
    const height = fontSize;
    const ascent = fontSize * 0.8; // Typical ascent
    const descent = fontSize * 0.2; // Typical descent
    const capHeight = fontSize * 0.7; // Cap height
    const xHeight = fontSize * 0.5; // x-height
    const baseline = ascent;

    const metrics: FontMetrics = {
      width,
      height,
      ascent,
      descent,
      capHeight,
      xHeight,
      baseline,
    };

    this.fontMetricsCache.set(cacheKey, metrics);
    return metrics;
  }

  /**
   * Create font subset (only include used characters)
   */
  createFontSubset(text: string): FontSubset {
    const characters = new Set<string>();
    const glyphs = new Map<string, number>();
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      characters.add(char);
      glyphs.set(char, i);
    }

    return { characters, glyphs };
  }

  /**
   * Get font subset for text
   */
  getFontSubset(fontKey: string, text: string): FontSubset {
    const cacheKey = `${fontKey}-${text}`;
    
    if (this.fontSubsets.has(cacheKey)) {
      return this.fontSubsets.get(cacheKey)!;
    }

    const subset = this.createFontSubset(text);
    this.fontSubsets.set(cacheKey, subset);
    return subset;
  }

  /**
   * Clear font cache
   */
  clearCache(): void {
    this.fontCache.clear();
    this.fontMetricsCache.clear();
    this.fontSubsets.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    fonts: number;
    metrics: number;
    subsets: number;
  } {
    return {
      fonts: this.fontCache.size,
      metrics: this.fontMetricsCache.size,
      subsets: this.fontSubsets.size,
    };
  }
}


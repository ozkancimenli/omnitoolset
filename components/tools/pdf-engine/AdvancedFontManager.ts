/**
 * Advanced Font Manager - Font Subsetting, Embedding, and Optimization
 * 
 * Provides advanced font operations including subsetting and embedding
 */

export interface FontSubset {
  fontData: Uint8Array;
  glyphs: Set<number>;
  unicodeRanges: Array<{ start: number; end: number }>;
}

export interface FontMetrics {
  ascent: number;
  descent: number;
  lineHeight: number;
  capHeight: number;
  xHeight: number;
  unitsPerEm: number;
  glyphCount: number;
}

export class AdvancedFontManager {
  private fontCache: Map<string, FontSubset> = new Map();
  private metricsCache: Map<string, FontMetrics> = new Map();
  private embeddedFonts: Set<string> = new Set();

  /**
   * Create font subset (only include used glyphs)
   */
  async createSubset(
    fontData: Uint8Array,
    usedGlyphs: Set<number> | number[]
  ): Promise<FontSubset> {
    const glyphSet = usedGlyphs instanceof Set ? usedGlyphs : new Set(usedGlyphs);
    const cacheKey = this.getFontCacheKey(fontData, Array.from(glyphSet));
    
    if (this.fontCache.has(cacheKey)) {
      return this.fontCache.get(cacheKey)!;
    }

    // In production, this would use a proper font subsetting library
    // For now, we create a simplified subset
    const subset: FontSubset = {
      fontData: fontData, // Placeholder - would create actual subset
      glyphs: glyphSet,
      unicodeRanges: this.calculateUnicodeRanges(glyphSet),
    };

    this.fontCache.set(cacheKey, subset);
    return subset;
  }

  /**
   * Calculate unicode ranges from glyphs
   */
  private calculateUnicodeRanges(glyphs: Set<number>): Array<{ start: number; end: number }> {
    const sorted = Array.from(glyphs).sort((a, b) => a - b);
    const ranges: Array<{ start: number; end: number }> = [];
    
    if (sorted.length === 0) return ranges;

    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push({ start, end });
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push({ start, end });

    return ranges;
  }

  /**
   * Get font cache key
   */
  private getFontCacheKey(fontData: Uint8Array, glyphs: number[]): string {
    // Simple hash of font data + glyphs
    const hash = fontData.length + glyphs.reduce((sum, g) => sum + g, 0);
    return `font-${hash}`;
  }

  /**
   * Calculate font metrics
   */
  async calculateMetrics(fontData: Uint8Array): Promise<FontMetrics> {
    const cacheKey = this.getFontDataKey(fontData);
    
    if (this.metricsCache.has(cacheKey)) {
      return this.metricsCache.get(cacheKey)!;
    }

    // In production, this would parse actual font file (TTF/OTF)
    // For now, we use default metrics
    const metrics: FontMetrics = {
      ascent: 800,
      descent: -200,
      lineHeight: 1000,
      capHeight: 700,
      xHeight: 500,
      unitsPerEm: 1000,
      glyphCount: 256, // Placeholder
    };

    this.metricsCache.set(cacheKey, metrics);
    return metrics;
  }

  /**
   * Get font data key
   */
  private getFontDataKey(fontData: Uint8Array): string {
    // Simple hash
    let hash = 0;
    for (let i = 0; i < Math.min(fontData.length, 100); i++) {
      hash = ((hash << 5) - hash) + fontData[i];
      hash = hash & hash;
    }
    return `font-data-${hash}`;
  }

  /**
   * Embed font in PDF
   */
  async embedFont(
    fontData: Uint8Array,
    fontName: string,
    subset?: FontSubset
  ): Promise<string> {
    const fontId = `${fontName}-${Date.now()}`;
    this.embeddedFonts.add(fontId);
    
    // In production, this would actually embed the font
    // For now, we just track it
    return fontId;
  }

  /**
   * Check if font is embedded
   */
  isEmbedded(fontId: string): boolean {
    return this.embeddedFonts.has(fontId);
  }

  /**
   * Get embedded fonts
   */
  getEmbeddedFonts(): string[] {
    return Array.from(this.embeddedFonts);
  }

  /**
   * Clear font cache
   */
  clearCache(): void {
    this.fontCache.clear();
    this.metricsCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    fontSubsets: number;
    metricsCache: number;
    embeddedFonts: number;
  } {
    return {
      fontSubsets: this.fontCache.size,
      metricsCache: this.metricsCache.size,
      embeddedFonts: this.embeddedFonts.size,
    };
  }
}


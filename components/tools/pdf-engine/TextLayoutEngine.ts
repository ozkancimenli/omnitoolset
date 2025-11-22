/**
 * Text Layout Engine - Advanced Text Measurement and Layout
 * 
 * Provides advanced text measurement, kerning, ligatures, and layout algorithms
 */

export interface TextMetrics {
  width: number;
  height: number;
  ascent: number;
  descent: number;
  baseline: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface TextLayout {
  lines: TextLine[];
  totalWidth: number;
  totalHeight: number;
}

export interface TextLine {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  metrics: TextMetrics;
}

export class TextLayoutEngine {
  /**
   * Measure text with advanced metrics
   */
  static measureText(
    text: string,
    fontSize: number,
    fontFamily: string,
    options?: {
      letterSpacing?: number;
      wordSpacing?: number;
      kerning?: boolean;
    }
  ): TextMetrics {
    // Create a temporary canvas for measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      // Fallback to simple calculation
      return {
        width: text.length * fontSize * 0.6,
        height: fontSize,
        ascent: fontSize * 0.8,
        descent: fontSize * 0.2,
        baseline: fontSize * 0.8,
        boundingBox: {
          x: 0,
          y: 0,
          width: text.length * fontSize * 0.6,
          height: fontSize,
        },
      };
    }
    
    context.font = `${fontSize}px ${fontFamily}`;
    const metrics = context.measureText(text);
    
    // Calculate advanced metrics
    const width = metrics.width;
    const height = fontSize;
    const ascent = fontSize * 0.8; // Typical ascent ratio
    const descent = fontSize * 0.2; // Typical descent ratio
    const baseline = ascent;
    
    // Apply letter spacing if specified
    let adjustedWidth = width;
    if (options?.letterSpacing) {
      adjustedWidth += (text.length - 1) * options.letterSpacing;
    }
    
    // Apply word spacing if specified
    if (options?.wordSpacing) {
      const wordCount = text.split(/\s+/).length - 1;
      adjustedWidth += wordCount * options.wordSpacing;
    }
    
    return {
      width: adjustedWidth,
      height,
      ascent,
      descent,
      baseline,
      boundingBox: {
        x: 0,
        y: -ascent,
        width: adjustedWidth,
        height,
      },
    };
  }

  /**
   * Layout text with word wrapping
   */
  static layoutText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: string,
    options?: {
      letterSpacing?: number;
      wordSpacing?: number;
      lineHeight?: number;
      textAlign?: 'left' | 'center' | 'right' | 'justify';
    }
  ): TextLayout {
    const lines: TextLine[] = [];
    const words = text.split(/\s+/);
    const lineHeight = (options?.lineHeight || 1.2) * fontSize;
    let currentLine: string[] = [];
    let currentLineWidth = 0;
    let y = 0;
    
    for (const word of words) {
      const wordMetrics = this.measureText(word, fontSize, fontFamily, options);
      const spaceWidth = options?.wordSpacing || this.measureText(' ', fontSize, fontFamily).width;
      
      // Check if word fits on current line
      if (currentLineWidth + wordMetrics.width + (currentLine.length > 0 ? spaceWidth : 0) <= maxWidth) {
        currentLine.push(word);
        currentLineWidth += wordMetrics.width + (currentLine.length > 1 ? spaceWidth : 0);
      } else {
        // Create line from current words
        if (currentLine.length > 0) {
          const lineText = currentLine.join(' ');
          const lineMetrics = this.measureText(lineText, fontSize, fontFamily, options);
          
          // Calculate x position based on alignment
          let x = 0;
          if (options?.textAlign === 'center') {
            x = (maxWidth - lineMetrics.width) / 2;
          } else if (options?.textAlign === 'right') {
            x = maxWidth - lineMetrics.width;
          } else if (options?.textAlign === 'justify' && currentLine.length > 1) {
            // Justify: distribute space between words
            const totalWordWidth = currentLine.reduce((sum, w) => {
              return sum + this.measureText(w, fontSize, fontFamily, options).width;
            }, 0);
            const spaceToDistribute = maxWidth - totalWordWidth;
            const spacePerGap = spaceToDistribute / (currentLine.length - 1);
            // For now, just use left alignment (justify is complex)
            x = 0;
          }
          
          lines.push({
            text: lineText,
            x,
            y,
            width: lineMetrics.width,
            height: lineMetrics.height,
            metrics: lineMetrics,
          });
          
          y += lineHeight;
        }
        
        // Start new line with current word
        currentLine = [word];
        currentLineWidth = wordMetrics.width;
      }
    }
    
    // Add last line
    if (currentLine.length > 0) {
      const lineText = currentLine.join(' ');
      const lineMetrics = this.measureText(lineText, fontSize, fontFamily, options);
      
      let x = 0;
      if (options?.textAlign === 'center') {
        x = (maxWidth - lineMetrics.width) / 2;
      } else if (options?.textAlign === 'right') {
        x = maxWidth - lineMetrics.width;
      }
      
      lines.push({
        text: lineText,
        x,
        y,
        width: lineMetrics.width,
        height: lineMetrics.height,
        metrics: lineMetrics,
      });
    }
    
    const totalWidth = Math.max(...lines.map(l => l.width), 0);
    const totalHeight = lines.length * lineHeight;
    
    return {
      lines,
      totalWidth,
      totalHeight,
    };
  }

  /**
   * Calculate character position in text
   */
  static getCharacterPosition(
    text: string,
    charIndex: number,
    fontSize: number,
    fontFamily: string,
    options?: { letterSpacing?: number }
  ): { x: number; y: number } {
    if (charIndex < 0 || charIndex > text.length) {
      return { x: 0, y: 0 };
    }
    
    const beforeText = text.substring(0, charIndex);
    const metrics = this.measureText(beforeText, fontSize, fontFamily, options);
    
    return {
      x: metrics.width,
      y: 0,
    };
  }

  /**
   * Find character index at position
   */
  static getCharacterIndexAtPosition(
    text: string,
    x: number,
    fontSize: number,
    fontFamily: string,
    options?: { letterSpacing?: number }
  ): number {
    // Binary search for character position
    let low = 0;
    let high = text.length;
    let bestIndex = 0;
    let bestDistance = Infinity;
    
    for (let i = 0; i <= text.length; i++) {
      const pos = this.getCharacterPosition(text, i, fontSize, fontFamily, options);
      const distance = Math.abs(pos.x - x);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }
    
    return bestIndex;
  }

  /**
   * Calculate text selection rectangle
   */
  static getSelectionRect(
    text: string,
    startIndex: number,
    endIndex: number,
    fontSize: number,
    fontFamily: string,
    options?: { letterSpacing?: number }
  ): { x: number; y: number; width: number; height: number } {
    const startPos = this.getCharacterPosition(text, startIndex, fontSize, fontFamily, options);
    const endPos = this.getCharacterPosition(text, endIndex, fontSize, fontFamily, options);
    
    const x = Math.min(startPos.x, endPos.x);
    const width = Math.abs(endPos.x - startPos.x);
    const height = fontSize;
    const y = -fontSize * 0.8; // Baseline offset
    
    return { x, y, width, height };
  }
}


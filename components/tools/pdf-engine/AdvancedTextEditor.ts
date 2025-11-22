/**
 * Advanced Text Editor - Ultra-Deep Text Editing Engine
 * 
 * Provides advanced text editing capabilities:
 * - Real-time text preview
 * - Character-level editing
 * - Text selection and formatting
 * - Text statistics
 * - Text validation
 * - Text transformation (rotation, scaling)
 * - Text styles and presets
 * - Batch text operations
 */

export interface TextSelection {
  runId: string;
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface TextStatistics {
  characterCount: number;
  wordCount: number;
  lineCount: number;
  paragraphCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  averageCharactersPerWord: number;
}

export interface TextStyle {
  id: string;
  name: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'underline' | 'line-through';
  letterSpacing?: number;
  lineHeight?: number;
}

export interface TextTransform {
  rotation?: number; // Degrees
  scaleX?: number;
  scaleY?: number;
  skewX?: number;
  skewY?: number;
}

export class AdvancedTextEditor {
  private textStyles: Map<string, TextStyle> = new Map();
  private defaultStyles: TextStyle[] = [
    {
      id: 'heading-1',
      name: 'Heading 1',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#000000',
    },
    {
      id: 'heading-2',
      name: 'Heading 2',
      fontSize: 20,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#000000',
    },
    {
      id: 'heading-3',
      name: 'Heading 3',
      fontSize: 18,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#000000',
    },
    {
      id: 'body',
      name: 'Body Text',
      fontSize: 12,
      fontFamily: 'Times New Roman',
      fontWeight: 'normal',
      color: '#000000',
    },
    {
      id: 'caption',
      name: 'Caption',
      fontSize: 10,
      fontFamily: 'Arial',
      fontStyle: 'italic',
      color: '#666666',
    },
  ];

  constructor() {
    // Initialize default styles
    this.defaultStyles.forEach(style => {
      this.textStyles.set(style.id, style);
    });
  }

  /**
   * Calculate text statistics
   */
  calculateStatistics(text: string): TextStatistics {
    const characterCount = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const lines = text.split(/\n/).filter(l => l.trim().length > 0);
    const lineCount = lines.length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const paragraphCount = paragraphs.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = sentences.length;

    return {
      characterCount,
      wordCount,
      lineCount,
      paragraphCount,
      sentenceCount,
      averageWordsPerSentence: sentenceCount > 0 ? wordCount / sentenceCount : 0,
      averageCharactersPerWord: wordCount > 0 ? characterCount / wordCount : 0,
    };
  }

  /**
   * Validate text content
   */
  validateText(text: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for empty text
    if (!text.trim()) {
      errors.push('Text cannot be empty');
    }

    // Check for maximum length
    if (text.length > 10000) {
      errors.push('Text exceeds maximum length of 10,000 characters');
    }

    // Check for invalid characters (control characters except newline and tab)
    const invalidChars = text.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g);
    if (invalidChars) {
      errors.push('Text contains invalid control characters');
    }

    // Check for balanced brackets
    const openBrackets = (text.match(/[\(\[\{]/g) || []).length;
    const closeBrackets = (text.match(/[\)\]\}]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push('Unbalanced brackets detected');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply text style
   */
  applyStyle(text: string, style: TextStyle): string {
    // In a real implementation, this would apply formatting to the text
    // For now, we return the text as-is (formatting is handled by the rendering engine)
    return text;
  }

  /**
   * Get text style by ID
   */
  getStyle(styleId: string): TextStyle | undefined {
    return this.textStyles.get(styleId);
  }

  /**
   * Create custom text style
   */
  createStyle(style: Omit<TextStyle, 'id'>): string {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.textStyles.set(id, { ...style, id });
    return id;
  }

  /**
   * Update text style
   */
  updateStyle(styleId: string, updates: Partial<TextStyle>): boolean {
    const style = this.textStyles.get(styleId);
    if (!style) return false;
    this.textStyles.set(styleId, { ...style, ...updates });
    return true;
  }

  /**
   * Delete text style
   */
  deleteStyle(styleId: string): boolean {
    // Don't delete default styles
    if (this.defaultStyles.some(s => s.id === styleId)) {
      return false;
    }
    return this.textStyles.delete(styleId);
  }

  /**
   * List all text styles
   */
  listStyles(): TextStyle[] {
    return Array.from(this.textStyles.values());
  }

  /**
   * Transform text with rotation, scaling, etc.
   */
  transformText(
    text: string,
    transform: TextTransform
  ): { transformed: string; matrix: number[] } {
    // Calculate transformation matrix
    const rotation = (transform.rotation || 0) * (Math.PI / 180);
    const scaleX = transform.scaleX || 1;
    const scaleY = transform.scaleY || 1;
    const skewX = transform.skewX || 0;
    const skewY = transform.skewY || 0;

    // PDF transformation matrix: [a, b, c, d, e, f]
    // a = scaleX * cos(rotation)
    // b = scaleY * sin(rotation)
    // c = -scaleX * sin(rotation) + skewX
    // d = scaleY * cos(rotation) + skewY
    // e, f = translation (0, 0 for text)
    const a = scaleX * Math.cos(rotation);
    const b = scaleY * Math.sin(rotation);
    const c = -scaleX * Math.sin(rotation) + skewX;
    const d = scaleY * Math.cos(rotation) + skewY;

    const matrix = [a, b, c, d, 0, 0];

    // Text itself doesn't change, only the transformation matrix
    return {
      transformed: text,
      matrix,
    };
  }

  /**
   * Extract text selection from run
   */
  extractSelection(
    text: string,
    startIndex: number,
    endIndex: number
  ): TextSelection | null {
    if (startIndex < 0 || endIndex > text.length || startIndex > endIndex) {
      return null;
    }

    return {
      runId: '', // Will be set by caller
      startIndex,
      endIndex,
      text: text.substring(startIndex, endIndex),
    };
  }

  /**
   * Apply formatting to text selection
   */
  applyFormattingToSelection(
    text: string,
    selection: TextSelection,
    format: Partial<TextStyle>
  ): string {
    // In a real implementation, this would apply formatting
    // For now, we return the text as-is (formatting is handled by the rendering engine)
    return text;
  }

  /**
   * Find and replace text (with regex support)
   */
  findAndReplace(
    text: string,
    searchText: string,
    replaceText: string,
    options: {
      useRegex?: boolean;
      caseSensitive?: boolean;
      wholeWords?: boolean;
    } = {}
  ): { result: string; replacements: number } {
    let searchPattern: string | RegExp = searchText;
    let flags = 'g';

    if (!options.caseSensitive) {
      flags += 'i';
    }

    if (options.useRegex) {
      try {
        searchPattern = new RegExp(searchText, flags);
      } catch (e) {
        // Invalid regex, fallback to literal search
        searchPattern = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(searchPattern, flags);
      }
    } else {
      // Escape special regex characters
      const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (options.wholeWords) {
        searchPattern = new RegExp(`\\b${escaped}\\b`, flags);
      } else {
        searchPattern = new RegExp(escaped, flags);
      }
    }

    const matches = text.match(searchPattern);
    const replacements = matches ? matches.length : 0;
    const result = text.replace(searchPattern, replaceText);

    return { result, replacements };
  }

  /**
   * Find all occurrences of text
   */
  findAllOccurrences(
    text: string,
    searchText: string,
    options: {
      useRegex?: boolean;
      caseSensitive?: boolean;
      wholeWords?: boolean;
    } = {}
  ): Array<{ index: number; length: number; text: string }> {
    const results: Array<{ index: number; length: number; text: string }> = [];
    let searchPattern: RegExp;

    if (options.useRegex) {
      try {
        const flags = options.caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(searchText, flags);
      } catch (e) {
        return results; // Invalid regex
      }
    } else {
      const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = options.caseSensitive ? 'g' : 'gi';
      if (options.wholeWords) {
        searchPattern = new RegExp(`\\b${escaped}\\b`, flags);
      } else {
        searchPattern = new RegExp(escaped, flags);
      }
    }

    let match;
    while ((match = searchPattern.exec(text)) !== null) {
      results.push({
        index: match.index,
        length: match[0].length,
        text: match[0],
      });
    }

    return results;
  }

  /**
   * Sanitize text for PDF
   */
  sanitizeText(text: string): string {
    // Remove control characters (except newline, tab, carriage return)
    return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Normalize text (remove extra whitespace, normalize line breaks)
   */
  normalizeText(text: string): string {
    // Normalize line breaks to \n
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    // Remove trailing whitespace from lines
    normalized = normalized.replace(/[ \t]+$/gm, '');
    // Normalize multiple spaces to single space (but preserve line breaks)
    normalized = normalized.replace(/[ \t]+/g, ' ');
    return normalized;
  }
}


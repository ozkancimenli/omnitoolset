// Advanced Security Features
// Provides encryption, sanitization, and security checks

export class SecurityManager {
  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize file name
   */
  sanitizeFileName(fileName: string): string {
    // Remove path traversal and dangerous characters
    return fileName
      .replace(/\.\./g, '') // Remove path traversal
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .replace(/^\./, '') // Remove leading dot
      .trim();
  }

  /**
   * Validate PDF file
   */
  async validatePDFFile(file: File): Promise<{ valid: boolean; error?: string }> {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return { valid: false, error: 'Invalid file type' };
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' };
    }

    // Check PDF magic bytes
    try {
      const arrayBuffer = await file.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const magicBytes = String.fromCharCode(...bytes);
      
      if (magicBytes !== '%PDF') {
        return { valid: false, error: 'Invalid PDF file' };
      }
    } catch (error) {
      return { valid: false, error: 'Error reading file' };
    }

    return { valid: true };
  }

  /**
   * Encrypt data (simple base64, in production use proper encryption)
   */
  encrypt(data: string, key: string): string {
    // This is a placeholder - use proper encryption in production
    const encoded = btoa(data);
    return encoded;
  }

  /**
   * Decrypt data
   */
  decrypt(encrypted: string, key: string): string {
    // This is a placeholder - use proper decryption in production
    try {
      return atob(encrypted);
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generate secure token
   */
  generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      token += chars[array[i] % chars.length];
    }
    
    return token;
  }

  /**
   * Hash data (simple hash, use proper hashing in production)
   */
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if content is safe
   */
  isContentSafe(content: string): { safe: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for script tags
    if (/<script/i.test(content)) {
      issues.push('Script tags detected');
    }

    // Check for iframe tags
    if (/<iframe/i.test(content)) {
      issues.push('Iframe tags detected');
    }

    // Check for event handlers
    if (/on\w+\s*=/i.test(content)) {
      issues.push('Event handlers detected');
    }

    // Check for javascript: protocol
    if (/javascript:/i.test(content)) {
      issues.push('JavaScript protocol detected');
    }

    return {
      safe: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate URL
   */
  isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Check CSP compliance
   */
  checkCSPCompliance(content: string): { compliant: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check for inline scripts
    if (/<script[^>]*>/.test(content)) {
      violations.push('Inline scripts detected');
    }

    // Check for inline styles
    if (/style\s*=\s*["']/.test(content)) {
      violations.push('Inline styles detected');
    }

    // Check for eval
    if (/eval\s*\(/.test(content)) {
      violations.push('Eval usage detected');
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }
}

// Singleton instance
let securityInstance: SecurityManager | null = null;

export const getSecurityManager = (): SecurityManager => {
  if (!securityInstance) {
    securityInstance = new SecurityManager();
  }
  return securityInstance;
};


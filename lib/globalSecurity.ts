/**
 * Global Security Utilities
 * System-wide security measures
 */

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate URL
 */
export function validateURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  sanitized = sanitized.replace(/\//g, '');
  sanitized = sanitized.replace(/\\/g, '');

  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');

  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.substring(0, 255);
  }

  return sanitized;
}

/**
 * Content Security Policy helpers
 */
export const CSP = {
  /**
   * Generate CSP nonce
   */
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate CSP header
   */
  validateCSPHeader(header: string): boolean {
    // Basic validation
    const requiredDirectives = ['default-src', 'script-src', 'style-src'];
    return requiredDirectives.every(directive => header.includes(directive));
  },
};

/**
 * XSS prevention
 */
export function preventXSS(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return input.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * CSRF token generation
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests
    const recentRequests = requests.filter(time => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

/**
 * Initialize global security
 */
export function initGlobalSecurity(): void {
  // Add security headers check
  if (typeof window !== 'undefined') {
    // Check if security headers are present
    fetch('/api/security-headers')
      .then(response => {
        const headers = response.headers;
        const requiredHeaders = ['X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection'];
        
        requiredHeaders.forEach(header => {
          if (!headers.get(header)) {
            console.warn(`Security header missing: ${header}`);
          }
        });
      })
      .catch(() => {
        // API endpoint might not exist
      });
  }
}


/**
 * Global Accessibility Utilities
 * Provides accessibility helpers for the entire application
 */

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Set ARIA attributes
 */
export function setAriaAttributes(
  element: HTMLElement,
  attributes: Record<string, string>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('aria-') || key === 'role') {
      element.setAttribute(key, value);
    }
  });
}

/**
 * Make element focusable
 */
export function makeFocusable(element: HTMLElement, tabIndex: number = 0): void {
  element.setAttribute('tabindex', tabIndex.toString());
}

/**
 * Get focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
}

/**
 * Focus first element
 */
export function focusFirst(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  if (focusable.length > 0) {
    focusable[0].focus();
  }
}

/**
 * Focus last element
 */
export function focusLast(container: HTMLElement): void {
  const focusable = getFocusableElements(container);
  if (focusable.length > 0) {
    focusable[focusable.length - 1].focus();
  }
}

/**
 * Check if element is visible
 */
export function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}

/**
 * Get accessible name
 */
export function getAccessibleName(element: HTMLElement): string {
  // Try aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Try aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Try associated label
  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent || '';
  }

  // Fallback to text content
  return element.textContent?.trim() || '';
}

/**
 * Create skip link
 */
export function createSkipLink(href: string, text: string): HTMLElement {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.className = 'skip-link';
  link.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  `;
  
  link.addEventListener('focus', () => {
    link.style.top = '0';
  });
  
  link.addEventListener('blur', () => {
    link.style.top = '-40px';
  });
  
  return link;
}


// Advanced Accessibility Features
// Provides screen reader support, keyboard navigation, and ARIA attributes

export class AccessibilityManager {
  private announcements: HTMLElement | null = null;
  private focusTraps: Map<string, HTMLElement[]> = new Map();
  private skipLinks: HTMLElement[] = [];

  /**
   * Initialize accessibility features
   */
  initialize(): void {
    this.createAnnouncementRegion();
    this.createSkipLinks();
    this.setupKeyboardNavigation();
  }

  /**
   * Create announcement region for screen readers
   */
  private createAnnouncementRegion(): void {
    this.announcements = document.createElement('div');
    this.announcements.setAttribute('role', 'status');
    this.announcements.setAttribute('aria-live', 'polite');
    this.announcements.setAttribute('aria-atomic', 'true');
    this.announcements.className = 'sr-only';
    this.announcements.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.announcements);
  }

  /**
   * Announce to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.announcements) return;

    this.announcements.setAttribute('aria-live', priority);
    this.announcements.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.announcements) {
        this.announcements.textContent = '';
      }
    }, 1000);
  }

  /**
   * Create skip links
   */
  private createSkipLinks(): void {
    const skipLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#toolbar', text: 'Skip to toolbar' },
      { href: '#canvas', text: 'Skip to PDF canvas' },
    ];

    skipLinks.forEach(({ href, text }) => {
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
      document.body.insertBefore(link, document.body.firstChild);
      this.skipLinks.push(link);
    });
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => {
      // Escape key handling
      if (e.key === 'Escape') {
        this.handleEscape();
      }

      // Tab navigation enhancement
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }

      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowNavigation(e);
      }
    });
  }

  /**
   * Handle escape key
   */
  private handleEscape(): void {
    // Close modals, clear selections, etc.
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach((modal) => {
      const closeButton = modal.querySelector('[aria-label*="close" i]');
      if (closeButton && closeButton instanceof HTMLElement) {
        closeButton.click();
      }
    });
  }

  /**
   * Handle tab navigation
   */
  private handleTabNavigation(e: KeyboardEvent): void {
    // Ensure focus is visible
    const focused = document.activeElement;
    if (focused && focused instanceof HTMLElement) {
      focused.style.outline = '2px solid #3b82f6';
      focused.style.outlineOffset = '2px';
    }
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowNavigation(e: KeyboardEvent): void {
    // Custom arrow key navigation for PDF canvas
    const canvas = document.querySelector('#canvas');
    if (canvas && canvas === document.activeElement) {
      // Prevent default scrolling
      e.preventDefault();
      // Handle custom navigation
    }
  }

  /**
   * Create focus trap
   */
  createFocusTrap(container: HTMLElement, id: string): () => void {
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const trapHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', trapHandler);
    this.focusTraps.set(id, [firstElement, lastElement]);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', trapHandler);
      this.focusTraps.delete(id);
    };
  }

  /**
   * Set ARIA attributes
   */
  setAriaAttributes(element: HTMLElement, attributes: Record<string, string>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (key.startsWith('aria-') || key === 'role') {
        element.setAttribute(key, value);
      }
    });
  }

  /**
   * Make element focusable
   */
  makeFocusable(element: HTMLElement, tabIndex: number = 0): void {
    element.setAttribute('tabindex', tabIndex.toString());
  }

  /**
   * Get focusable elements in container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }

  /**
   * Focus first element in container
   */
  focusFirst(container: HTMLElement): void {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  /**
   * Focus last element in container
   */
  focusLast(container: HTMLElement): void {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
    }
  }

  /**
   * Check if element is visible
   */
  isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 &&
           element.offsetHeight > 0;
  }

  /**
   * Get accessible name
   */
  getAccessibleName(element: HTMLElement): string {
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
}

// Singleton instance
let accessibilityInstance: AccessibilityManager | null = null;

export const getAccessibilityManager = (): AccessibilityManager => {
  if (!accessibilityInstance) {
    accessibilityInstance = new AccessibilityManager();
  }
  return accessibilityInstance;
};


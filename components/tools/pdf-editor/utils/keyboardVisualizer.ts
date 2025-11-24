// Keyboard Shortcuts Visualizer
// Shows available keyboard shortcuts with visual hints

export interface KeyboardShortcut {
  keys: string[];
  description: string;
  category: string;
  action: () => void;
}

export class KeyboardVisualizer {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private isVisible: boolean = false;
  private container: HTMLElement | null = null;

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = shortcut.keys.join('+');
    this.shortcuts.set(key, shortcut);
  }

  /**
   * Show visualizer
   */
  show(): void {
    if (this.isVisible) return;

    this.isVisible = true;
    this.createVisualizer();
  }

  /**
   * Hide visualizer
   */
  hide(): void {
    if (!this.isVisible) return;

    this.isVisible = false;
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  /**
   * Toggle visualizer
   */
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Create visualizer UI
   */
  private createVisualizer(): void {
    const container = document.createElement('div');
    container.className = 'keyboard-visualizer';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 10000;
    `;

    // Group by category
    const categories = new Map<string, KeyboardShortcut[]>();
    this.shortcuts.forEach(shortcut => {
      if (!categories.has(shortcut.category)) {
        categories.set(shortcut.category, []);
      }
      categories.get(shortcut.category)!.push(shortcut);
    });

    // Create header
    const header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;';
    const title = document.createElement('h2');
    title.textContent = 'Keyboard Shortcuts';
    title.style.cssText = 'margin: 0; font-size: 24px; font-weight: bold;';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'background: none; border: none; font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px;';
    closeBtn.onclick = () => this.hide();
    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Create categories
    categories.forEach((shortcuts, category) => {
      const categoryDiv = document.createElement('div');
      categoryDiv.style.marginBottom = '24px';

      const categoryTitle = document.createElement('h3');
      categoryTitle.textContent = category;
      categoryTitle.style.cssText = 'margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #374151;';
      categoryDiv.appendChild(categoryTitle);

      shortcuts.forEach(shortcut => {
        const shortcutDiv = document.createElement('div');
        shortcutDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e5e7eb;';

        const description = document.createElement('span');
        description.textContent = shortcut.description;
        description.style.cssText = 'color: #6b7280;';

        const keys = document.createElement('div');
        keys.style.cssText = 'display: flex; gap: 4px;';

        shortcut.keys.forEach(key => {
          const keyDiv = document.createElement('kbd');
          keyDiv.textContent = key;
          keyDiv.style.cssText = `
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 12px;
            color: #374151;
          `;
          keys.appendChild(keyDiv);
        });

        shortcutDiv.appendChild(description);
        shortcutDiv.appendChild(keys);
        categoryDiv.appendChild(shortcutDiv);
      });

      container.appendChild(categoryDiv);
    });

    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;
    backdrop.onclick = () => this.hide();

    document.body.appendChild(backdrop);
    document.body.appendChild(container);
    this.container = container;
  }

  /**
   * Get all shortcuts
   */
  getAllShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcuts by category
   */
  getShortcutsByCategory(category: string): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values()).filter(s => s.category === category);
  }
}

// Singleton instance
let visualizerInstance: KeyboardVisualizer | null = null;

export const getKeyboardVisualizer = (): KeyboardVisualizer => {
  if (!visualizerInstance) {
    visualizerInstance = new KeyboardVisualizer();
  }
  return visualizerInstance;
};


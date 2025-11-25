// Custom Theme System
// Allows users to create and apply custom color themes

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  isDark?: boolean;
  isCustom?: boolean;
}

export class CustomThemeManager {
  private themes: Map<string, Theme> = new Map();
  private currentTheme: string = 'default';
  private userThemes: Map<string, Theme> = new Map();

  constructor() {
    this.initializeDefaultThemes();
  }

  /**
   * Initialize default themes
   */
  private initializeDefaultThemes(): void {
    // Light theme
    this.registerTheme({
      id: 'default',
      name: 'Default Light',
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        info: '#3b82f6',
      },
      fonts: {
        body: 'system-ui, sans-serif',
        heading: 'system-ui, sans-serif',
        mono: 'monospace',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
      },
      shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
      },
    });

    // Dark theme
    this.registerTheme({
      id: 'dark',
      name: 'Dark',
      isDark: true,
      colors: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        accent: '#34d399',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        border: '#374151',
        error: '#f87171',
        warning: '#fbbf24',
        success: '#34d399',
        info: '#60a5fa',
      },
      fonts: {
        body: 'system-ui, sans-serif',
        heading: 'system-ui, sans-serif',
        mono: 'monospace',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
      },
      shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 6px rgba(0,0,0,0.4)',
        lg: '0 10px 15px rgba(0,0,0,0.5)',
      },
    });
  }

  /**
   * Register a theme
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Create custom theme
   */
  createCustomTheme(
    name: string,
    baseTheme: string,
    customizations: Partial<Theme['colors']>
  ): string {
    const base = this.getTheme(baseTheme);
    if (!base) {
      throw new Error(`Base theme ${baseTheme} not found`);
    }

    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const customTheme: Theme = {
      ...base,
      id,
      name,
      isCustom: true,
      colors: {
        ...base.colors,
        ...customizations,
      },
    };

    this.userThemes.set(id, customTheme);
    return id;
  }

  /**
   * Apply theme
   */
  applyTheme(themeId: string): void {
    const theme = this.getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }

    this.currentTheme = themeId;
    this.injectThemeStyles(theme);
  }

  /**
   * Inject theme styles into document
   */
  private injectThemeStyles(theme: Theme): void {
    const root = document.documentElement;
    
    // Set CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Set dark mode class
    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  /**
   * Get theme
   */
  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId) || this.userThemes.get(themeId);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme | undefined {
    return this.getTheme(this.currentTheme);
  }

  /**
   * Get all themes
   */
  getAllThemes(): Theme[] {
    return [
      ...Array.from(this.themes.values()),
      ...Array.from(this.userThemes.values()),
    ];
  }

  /**
   * Delete custom theme
   */
  deleteCustomTheme(themeId: string): void {
    if (!this.userThemes.has(themeId)) {
      throw new Error('Can only delete custom themes');
    }
    this.userThemes.delete(themeId);
  }

  /**
   * Export theme
   */
  exportTheme(themeId: string): string {
    const theme = this.getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme ${themeId} not found`);
    }
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme
   */
  importTheme(themeJson: string): string {
    const theme = JSON.parse(themeJson) as Theme;
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    theme.id = id;
    theme.isCustom = true;
    this.userThemes.set(id, theme);
    return id;
  }
}

// Singleton instance
let themeManagerInstance: CustomThemeManager | null = null;

export const getCustomThemeManager = (): CustomThemeManager => {
  if (!themeManagerInstance) {
    themeManagerInstance = new CustomThemeManager();
  }
  return themeManagerInstance;
};


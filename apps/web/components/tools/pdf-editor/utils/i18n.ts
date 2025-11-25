// Internationalization Infrastructure
// Provides multi-language support

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nConfig {
  defaultLocale: string;
  fallbackLocale: string;
  locales: string[];
  translations: Record<string, Translation>;
}

export class I18nManager {
  private config: I18nConfig = {
    defaultLocale: 'en',
    fallbackLocale: 'en',
    locales: ['en'],
    translations: {},
  };
  private currentLocale: string = 'en';

  /**
   * Initialize i18n
   */
  initialize(config: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...config };
    this.currentLocale = this.config.defaultLocale;
  }

  /**
   * Set locale
   */
  setLocale(locale: string): void {
    if (!this.config.locales.includes(locale)) {
      console.warn(`[I18n] Locale ${locale} not available, using fallback`);
      this.currentLocale = this.config.fallbackLocale;
      return;
    }
    this.currentLocale = locale;
  }

  /**
   * Get current locale
   */
  getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Translate key
   */
  t(key: string, params?: Record<string, string | number>): string {
    const translation = this.getTranslation(key);
    
    if (!translation) {
      console.warn(`[I18n] Translation missing for key: ${key}`);
      return key;
    }

    // Replace parameters
    if (params) {
      return this.replaceParams(translation, params);
    }

    return translation;
  }

  /**
   * Get translation
   */
  private getTranslation(key: string): string | null {
    const keys = key.split('.');
    let translation: any = this.config.translations[this.currentLocale];

    // Try current locale
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        translation = null;
        break;
      }
    }

    // Fallback to fallback locale
    if (!translation && this.currentLocale !== this.config.fallbackLocale) {
      translation = this.config.translations[this.config.fallbackLocale];
      for (const k of keys) {
        if (translation && typeof translation === 'object' && k in translation) {
          translation = translation[k];
        } else {
          translation = null;
          break;
        }
      }
    }

    return typeof translation === 'string' ? translation : null;
  }

  /**
   * Replace parameters in translation
   */
  private replaceParams(text: string, params: Record<string, string | number>): string {
    let result = text;
    Object.entries(params).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return result;
  }

  /**
   * Register translations
   */
  registerTranslations(locale: string, translations: Translation): void {
    if (!this.config.locales.includes(locale)) {
      this.config.locales.push(locale);
    }
    this.config.translations[locale] = {
      ...this.config.translations[locale],
      ...translations,
    };
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): string[] {
    return [...this.config.locales];
  }

  /**
   * Format number
   */
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale, options).format(value);
  }

  /**
   * Format date
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.currentLocale, options).format(date);
  }

  /**
   * Format currency
   */
  formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency,
    }).format(value);
  }
}

// Default English translations
export const defaultTranslations: Translation = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
  },
  editor: {
    toolbar: 'Toolbar',
    tools: 'Tools',
    pages: 'Pages',
    annotations: 'Annotations',
    settings: 'Settings',
  },
  errors: {
    fileNotFound: 'File not found',
    invalidFile: 'Invalid file',
    loadError: 'Failed to load PDF',
    saveError: 'Failed to save PDF',
  },
};

// Singleton instance
let i18nInstance: I18nManager | null = null;

export const getI18nManager = (): I18nManager => {
  if (!i18nInstance) {
    i18nInstance = new I18nManager();
    i18nInstance.registerTranslations('en', defaultTranslations);
  }
  return i18nInstance;
};


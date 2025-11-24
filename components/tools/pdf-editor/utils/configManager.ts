// Configuration Management System
// Handles import/export of user settings and configurations

export interface EditorConfig {
  appearance: {
    theme: string;
    fontSize: number;
    fontFamily: string;
  };
  editor: {
    autoSave: boolean;
    autoSaveInterval: number;
    defaultZoom: number;
    defaultZoomMode: string;
  };
  annotations: {
    defaultColors: {
      text: string;
      highlight: string;
      stroke: string;
      fill: string;
    };
    defaultFontSize: number;
    defaultStrokeWidth: number;
  };
  shortcuts: Record<string, string>;
  panels: {
    visible: string[];
    collapsed: string[];
  };
  advanced: {
    enableWebWorkers: boolean;
    enableCache: boolean;
    cacheSize: number;
    enableAnalytics: boolean;
  };
}

export class ConfigManager {
  private defaultConfig: EditorConfig = {
    appearance: {
      theme: 'default',
      fontSize: 14,
      fontFamily: 'system-ui',
    },
    editor: {
      autoSave: true,
      autoSaveInterval: 30000,
      defaultZoom: 1,
      defaultZoomMode: 'fit-page',
    },
    annotations: {
      defaultColors: {
        text: '#000000',
        highlight: '#FFFF00',
        stroke: '#FF0000',
        fill: '#FF0000',
      },
      defaultFontSize: 16,
      defaultStrokeWidth: 2,
    },
    shortcuts: {},
    panels: {
      visible: [],
      collapsed: [],
    },
    advanced: {
      enableWebWorkers: true,
      enableCache: true,
      cacheSize: 100 * 1024 * 1024,
      enableAnalytics: false,
    },
  };

  private config: EditorConfig = { ...this.defaultConfig };

  /**
   * Load config from storage
   */
  load(): EditorConfig {
    try {
      const stored = localStorage.getItem('pdf-editor-config');
      if (stored) {
        this.config = { ...this.defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('[ConfigManager] Failed to load config:', error);
    }
    return this.config;
  }

  /**
   * Save config to storage
   */
  save(config?: EditorConfig): void {
    if (config) {
      this.config = { ...this.defaultConfig, ...config };
    }

    try {
      localStorage.setItem('pdf-editor-config', JSON.stringify(this.config));
    } catch (error) {
      console.error('[ConfigManager] Failed to save config:', error);
    }
  }

  /**
   * Get config value
   */
  get<T = any>(path: string): T | undefined {
    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value as T;
  }

  /**
   * Set config value
   */
  set(path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let target: any = this.config;

    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }

    target[lastKey] = value;
    this.save();
  }

  /**
   * Reset to default
   */
  reset(): void {
    this.config = { ...this.defaultConfig };
    this.save();
  }

  /**
   * Export config
   */
  export(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import config
   */
  import(configJson: string): void {
    try {
      const imported = JSON.parse(configJson);
      this.config = { ...this.defaultConfig, ...imported };
      this.save();
    } catch (error) {
      throw new Error('Invalid config format');
    }
  }

  /**
   * Get full config
   */
  getConfig(): EditorConfig {
    return { ...this.config };
  }

  /**
   * Validate config
   */
  validate(config: Partial<EditorConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate structure
    if (config.appearance && typeof config.appearance !== 'object') {
      errors.push('appearance must be an object');
    }

    if (config.editor && typeof config.editor !== 'object') {
      errors.push('editor must be an object');
    }

    // Add more validations as needed

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Singleton instance
let configManagerInstance: ConfigManager | null = null;

export const getConfigManager = (): ConfigManager => {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager();
    configManagerInstance.load();
  }
  return configManagerInstance;
};


/**
 * Configuration Types
 * @module types/config
 */

/**
 * Editor configuration
 */
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

/**
 * Theme configuration
 */
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


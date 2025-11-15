/**
 * OmniToolset Design System
 * 
 * Professional, WordPress-quality design system.
 * Calm, trustworthy, and modern color palette.
 * 
 * Design Principles:
 * - Calm, not flashy
 * - Professional and trustworthy
 * - Modern and clean
 * - Excellent readability
 * - Consistent spacing
 */

export const designSystem = {
  colors: {
    // Primary - Calm Blue (Trustworthy)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Main primary
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary - Calm Teal (Modern)
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488', // Main secondary
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    
    // Backgrounds - Soft, Clean
    background: {
      light: '#ffffff', // Pure white
      soft: '#f9fafb', // Gray-50
      muted: '#f5f5f7', // Off-white
      dark: '#111827', // Gray-900
      darkCard: '#1f2937', // Gray-800
    },
    
    // Text - Readable, Not Harsh
    text: {
      primary: '#111827', // Gray-900 (not pure black)
      secondary: '#4b5563', // Gray-600
      muted: '#6b7280', // Gray-500
      light: '#9ca3af', // Gray-400
      inverse: '#f9fafb', // Light text on dark
    },
    
    // Borders - Subtle
    border: {
      light: '#e5e7eb', // Gray-200
      medium: '#d1d5db', // Gray-300
      dark: '#374151', // Gray-700
    },
    
    // Semantic (Used Sparingly)
    semantic: {
      success: '#10b981', // Green-500
      warning: '#f59e0b', // Amber-500
      error: '#ef4444', // Red-500
      info: '#3b82f6', // Blue-500
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Spacing (Consistent Scale)
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
    '3xl': '6rem',  // 96px
  },
  
  // Border Radius (Soft, Rounded)
  radius: {
    sm: '0.5rem',   // rounded-lg
    md: '0.75rem',  // rounded-xl
    lg: '1rem',     // rounded-2xl
    xl: '1.5rem',   // rounded-3xl
    full: '9999px',
  },
  
  // Shadows (Gentle, Not Harsh)
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  // Transitions (Smooth)
  transition: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Tailwind Class Mappings
 * 
 * Use these classes throughout the app for consistency:
 * 
 * Backgrounds:
 * - bg-white (light mode)
 * - bg-gray-50 (soft background)
 * - bg-slate-800 (dark mode cards)
 * 
 * Text:
 * - text-gray-900 (primary text - not pure black)
 * - text-gray-600 (secondary text)
 * - text-gray-500 (muted text)
 * 
 * Primary Actions:
 * - bg-blue-600 hover:bg-blue-700
 * - text-blue-600 hover:text-blue-700
 * 
 * Borders:
 * - border-gray-200 (light)
 * - border-slate-700 (dark)
 * 
 * Shadows:
 * - shadow-md (cards)
 * - shadow-lg (hover states)
 */


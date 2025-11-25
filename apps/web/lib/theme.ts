/**
 * Theme Configuration for OmniPDF Editor
 * 
 * Calm, professional color palette designed for a trustworthy,
 * distraction-free PDF editing experience.
 * 
 * Colors are chosen to be:
 * - Easy on the eyes
 * - Professional and trustworthy
 * - Not flashy or overwhelming
 * - Modern and clean
 */

export const theme = {
  colors: {
    // Background colors - soft off-white / very light gray
    background: {
      primary: '#f9fafb', // Tailwind gray-50
      secondary: '#ffffff', // Pure white
      muted: '#f5f5f7', // Soft off-white
    },
    
    // Primary accent - calm blue
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Main primary color
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary - calm teal (optional, for variety)
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488', // Main secondary color
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    
    // Neutrals - cool grays
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Semantic colors (used sparingly)
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500
  },
  
  // Border radius - soft, rounded
  radius: {
    sm: '0.5rem', // rounded-lg
    md: '0.75rem', // rounded-xl
    lg: '1rem', // rounded-2xl
    full: '9999px',
  },
  
  // Shadows - gentle, not harsh
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Spacing scale (for reference, Tailwind handles this)
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
} as const;

/**
 * Tailwind class mappings for easy reference:
 * 
 * Background: bg-gray-50, bg-white, bg-slate-50
 * Primary: bg-blue-600, text-blue-600, border-blue-600
 * Secondary: bg-teal-600 (optional)
 * Neutrals: text-gray-700, text-gray-600, border-gray-200
 * 
 * To adjust colors, modify the values above and update
 * corresponding Tailwind classes in components.
 */



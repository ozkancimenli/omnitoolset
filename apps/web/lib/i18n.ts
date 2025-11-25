/**
 * Internationalization (i18n) Utilities
 * 
 * Provides helper functions for managing multi-language content.
 * Currently supports: English (en) and Turkish (tr)
 * 
 * Future: Can be extended to support more languages.
 */

import { Locale } from './types';

export const defaultLocale: Locale = 'en';
export const supportedLocales: Locale[] = ['en', 'tr'];

/**
 * Get localized string from a Record<Locale, string>
 */
export function getLocalizedString(
  obj: Record<Locale, string> | string,
  locale: Locale = defaultLocale
): string {
  if (typeof obj === 'string') {
    return obj;
  }
  return obj[locale] || obj[defaultLocale] || '';
}

/**
 * Get locale from pathname
 * Returns 'en' for root, 'tr' for /tr, etc.
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (supportedLocales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return defaultLocale;
}

/**
 * Get pathname without locale prefix
 */
export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (supportedLocales.includes(firstSegment as Locale)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
}

/**
 * Add locale prefix to pathname
 */
export function addLocaleToPath(pathname: string, locale: Locale): string {
  if (locale === defaultLocale) {
    return pathname;
  }
  
  // Remove leading slash if present
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return `/${locale}/${cleanPath}`;
}


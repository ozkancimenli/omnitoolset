/**
 * Bundle Optimization Utilities
 * Helps reduce bundle size and optimize imports
 */

/**
 * Dynamic import with loading state
 */
export async function dynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  onLoad?: () => void,
  onError?: (error: Error) => void
): Promise<T> {
  try {
    const module = await importFn();
    onLoad?.();
    return module.default;
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

/**
 * Lazy load heavy dependencies
 */
export const lazyLoadPdfLib = () => import('pdf-lib');
export const lazyLoadPdfJs = () => import('pdfjs-dist');

/**
 * Check if feature should be loaded
 */
export function shouldLoadFeature(feature: string): boolean {
  if (typeof window === 'undefined') return false;

  // Check user preferences
  const preferences = localStorage.getItem('pdf-editor-preferences');
  if (preferences) {
    const prefs = JSON.parse(preferences);
    return prefs.features?.[feature] !== false;
  }

  // Default: load all features
  return true;
}

/**
 * Load feature conditionally
 */
export async function loadFeatureIfEnabled<T>(
  feature: string,
  importFn: () => Promise<T>
): Promise<T | null> {
  if (!shouldLoadFeature(feature)) {
    return null;
  }

  return importFn();
}

/**
 * Split large functions into chunks
 */
export function createChunkedProcessor<T, R>(
  processor: (item: T) => R,
  chunkSize: number = 10
): (items: T[]) => Promise<R[]> {
  return async (items: T[]): Promise<R[]> => {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(item => Promise.resolve(processor(item)))
      );
      results.push(...chunkResults);

      // Yield to browser
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    return results;
  };
}


/**
 * Bundle Analysis Utilities
 * Helps analyze and optimize bundle size
 */

/**
 * Measure bundle size
 */
export function measureBundleSize(): {
  scripts: number;
  styles: number;
  images: number;
  fonts: number;
  total: number;
} {
  if (typeof window === 'undefined') {
    return { scripts: 0, styles: 0, images: 0, fonts: 0, total: 0 };
  }

  const scripts = Array.from(document.querySelectorAll('script[src]')).reduce(
    (total, script) => {
      const src = (script as HTMLScriptElement).src;
      return total + (src ? 1 : 0);
    },
    0
  );

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).length;
  const images = Array.from(document.querySelectorAll('img[src]')).length;
  const fonts = Array.from(document.querySelectorAll('link[rel="preload"][as="font"]')).length;

  return {
    scripts,
    styles,
    images,
    fonts,
    total: scripts + styles + images + fonts,
  };
}

/**
 * Analyze resource loading
 */
export function analyzeResourceLoading(): Promise<PerformanceEntry[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve([]);
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      resolve(entries);
    });

    observer.observe({ entryTypes: ['resource'] });

    // Stop observing after a delay
    setTimeout(() => {
      observer.disconnect();
    }, 5000);
  });
}

/**
 * Get largest resources
 */
export function getLargestResources(limit: number = 10): Array<{
  name: string;
  size: number;
  type: string;
}> {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return [];
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

  return resources
    .map(resource => ({
      name: resource.name,
      size: resource.transferSize || 0,
      type: resource.initiatorType || 'unknown',
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, limit);
}

/**
 * Analyze PDF editor bundle
 */
export function analyzePDFEditorBundle(): {
  components: number;
  hooks: number;
  utils: number;
  total: number;
} {
  // This would need to be implemented based on your build system
  // For now, return placeholder
  return {
    components: 0,
    hooks: 0,
    utils: 0,
    total: 0,
  };
}

/**
 * Suggest optimizations
 */
export function suggestOptimizations(): string[] {
  const suggestions: string[] = [];
  const resources = getLargestResources(5);

  resources.forEach(resource => {
    if (resource.size > 1000000) {
      suggestions.push(`Consider code splitting for ${resource.name} (${(resource.size / 1024 / 1024).toFixed(2)}MB)`);
    }
  });

  return suggestions;
}


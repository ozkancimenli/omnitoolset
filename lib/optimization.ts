/**
 * Global Optimization Utilities
 * Provides optimization utilities for the entire application
 */

/**
 * Memoize function with cache
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  const keys: string[] = [];
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      // Move to end (LRU)
      const index = keys.indexOf(key);
      keys.splice(index, 1);
      keys.push(key);
      return cache.get(key)!;
    }
    
    const result = fn(...args);
    
    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const oldestKey = keys.shift()!;
      cache.delete(oldestKey);
    }
    
    cache.set(key, result);
    keys.push(key);
    
    return result;
  }) as T;
}

/**
 * Create optimized event handler
 */
export function createOptimizedHandler<T extends (...args: any[]) => any>(
  handler: T,
  options: {
    debounce?: number;
    throttle?: number;
    once?: boolean;
  } = {}
): T {
  let called = false;
  let timeout: NodeJS.Timeout | null = null;
  let inThrottle = false;
  
  return ((...args: Parameters<T>) => {
    if (options.once && called) return;
    
    if (options.debounce) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        handler(...args);
        called = true;
      }, options.debounce);
    } else if (options.throttle) {
      if (!inThrottle) {
        handler(...args);
        called = true;
        inThrottle = true;
        setTimeout(() => (inThrottle = false), options.throttle);
      }
    } else {
      handler(...args);
      called = true;
    }
  }) as T;
}

/**
 * Optimize image loading
 */
export function optimizeImage(img: HTMLImageElement, src: string): void {
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = src;
}

/**
 * Prefetch critical resources
 */
export function prefetchCriticalResources(resources: Array<{ href: string; as: string }>): void {
  if (typeof document === 'undefined') return;
  
  resources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = as as any;
    document.head.appendChild(link);
  });
}

/**
 * Optimize font loading
 */
export function optimizeFontLoading(fontFamily: string, fontUrl: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = fontUrl;
  link.as = 'font';
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}


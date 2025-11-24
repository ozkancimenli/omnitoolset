/**
 * Advanced Optimization Utilities
 * Provides final optimizations and performance enhancements
 */

/**
 * Debounce with immediate option
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    }, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle with leading and trailing options
 */
export function throttleAdvanced<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;
  let inThrottle: boolean;
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number;
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      if (leading) {
        func.apply(context, args);
      }
      lastRan = Date.now();
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        if (trailing && lastFunc) {
          func.apply(context, args);
          lastFunc = null;
        }
      }, limit);
    } else {
      if (trailing) {
        if (lastFunc) clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          func.apply(context, args);
          lastFunc = null;
        }, limit);
      }
    }
  };
}

/**
 * Memoize function with cache size limit
 */
export function memoizeWithLimit<T extends (...args: any[]) => any>(
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
 * Batch function calls
 */
export function batchCalls<T extends (...args: any[]) => any>(
  fn: T,
  batchSize: number = 10
): (...args: Parameters<T>) => void {
  let queue: Parameters<T>[] = [];
  let timeout: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    queue.push(args);
    
    if (queue.length >= batchSize) {
      if (timeout) clearTimeout(timeout);
      const batch = queue.splice(0, batchSize);
      batch.forEach(batchArgs => fn.apply(this, batchArgs));
    } else {
      if (!timeout) {
        timeout = setTimeout(() => {
          const batch = queue.splice(0);
          batch.forEach(batchArgs => fn.apply(this, batchArgs));
          timeout = null;
        }, 0);
      }
    }
  };
}

/**
 * Request idle callback with fallback
 */
export function requestIdleCallback(
  callback: (deadline: { timeRemaining: () => number; didTimeout: boolean }) => void,
  options?: { timeout?: number }
): number {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback to setTimeout
  return setTimeout(() => {
    callback({
      timeRemaining: () => 5,
      didTimeout: false,
    });
  }, options?.timeout || 1000) as unknown as number;
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Intersection observer with performance optimization
 */
export function createOptimizedIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }
  
  // Optimize options for performance
  const optimizedOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: [0, 0.1, 0.5, 1],
    ...options,
  };
  
  return new IntersectionObserver(callback, optimizedOptions);
}

/**
 * Lazy load with intersection observer
 */
export function lazyLoadElement(
  element: HTMLElement,
  loader: () => Promise<void>,
  options?: IntersectionObserverInit
): () => void {
  const observer = createOptimizedIntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      await loader();
      observer.disconnect();
    }
  }, options);
  
  observer?.observe(element);
  
  return () => observer?.disconnect();
}

/**
 * Optimize image loading
 */
export function optimizeImageLoading(
  img: HTMLImageElement,
  src: string,
  options?: {
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
    width?: number;
    height?: number;
  }
): void {
  // Use modern image formats if supported
  if (options?.format === 'webp' && 'Image' in window) {
    const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    img.src = webpSrc;
    img.onerror = () => {
      img.src = src; // Fallback to original
    };
  } else {
    img.src = src;
  }
  
  // Lazy loading
  img.loading = 'lazy';
  
  // Decoding
  img.decoding = 'async';
}

/**
 * Prefetch resources
 */
export function prefetchResource(url: string, as: 'script' | 'style' | 'image' | 'font' = 'script'): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Preload critical resources
 */
export function preloadResource(
  url: string,
  as: 'script' | 'style' | 'image' | 'font',
  options?: { crossorigin?: string; integrity?: string }
): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  if (options?.crossorigin) link.crossOrigin = options.crossorigin;
  if (options?.integrity) link.integrity = options.integrity;
  document.head.appendChild(link);
}


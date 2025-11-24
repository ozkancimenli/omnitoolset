// Performance Optimization Utilities
import React from 'react';

/**
 * Request Animation Frame with fallback
 */
export const requestAnimationFrame = (callback: () => void): number => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16) as unknown as number;
};

/**
 * Cancel Animation Frame with fallback
 */
export const cancelAnimationFrame = (id: number): void => {
  if (typeof window !== 'undefined' && window.cancelAnimationFrame) {
    window.cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
};

/**
 * Throttle function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

/**
 * Batch DOM updates using requestAnimationFrame
 */
export const batchDOMUpdates = (updates: (() => void)[]): void => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Measure performance of a function
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    if (duration > 16) { // Log if slower than 60fps
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

/**
 * Create a performance monitor
 */
export const createPerformanceMonitor = () => {
  const metrics: Record<string, number[]> = {};
  
  return {
    start: (name: string) => {
      const start = performance.now();
      return {
        end: () => {
          const duration = performance.now() - start;
          if (!metrics[name]) metrics[name] = [];
          metrics[name].push(duration);
        },
      };
    },
    getMetrics: () => {
      const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
      Object.keys(metrics).forEach(key => {
        const values = metrics[key];
        summary[key] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      });
      return summary;
    },
    reset: () => {
      Object.keys(metrics).forEach(key => delete metrics[key]);
    },
  };
};

/**
 * Lazy load component
 */
export const lazyLoad = <T>(
  loader: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): React.LazyExoticComponent<React.ComponentType<T>> => {
  return React.lazy(loader);
};

/**
 * Intersection Observer for lazy loading
 */
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};


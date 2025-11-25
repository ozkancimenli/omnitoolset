/**
 * Global Performance Utilities
 * Provides performance optimization utilities for the entire application
 */

import React from 'react';

/**
 * Lazy load component with Suspense
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunc);
}

/**
 * Prefetch route
 */
export function prefetchRoute(href: string): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }
}

/**
 * Preload critical resource
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'font' | 'fetch'
): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Intersection Observer for lazy loading
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure performance
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then((res) => {
      const duration = performance.now() - start;
      if (duration > 16) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      return res;
    });
  }
  
  const duration = performance.now() - start;
  if (duration > 16) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
  
  return Promise.resolve(result);
}

/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  if (typeof window === 'undefined') return;
  
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}


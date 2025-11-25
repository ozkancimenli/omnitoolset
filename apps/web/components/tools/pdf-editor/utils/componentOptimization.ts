/**
 * Component Optimization Utilities
 * Provides utilities for optimizing React components
 */

import React from 'react';

/**
 * Create optimized memo component with custom comparison
 */
export function createOptimizedMemo<T extends React.ComponentType<any>>(
  Component: T,
  areEqual?: (prevProps: Readonly<React.ComponentProps<T>>, nextProps: Readonly<React.ComponentProps<T>>) => boolean
): React.MemoExoticComponent<T> {
  return React.memo(Component, areEqual) as React.MemoExoticComponent<T>;
}

/**
 * Shallow comparison function for props
 */
export function shallowEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Deep comparison function for props
 */
export function deepEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

/**
 * Create memo with custom equality check
 */
export function memoWithEquality<T extends React.ComponentType<any>>(
  Component: T,
  equalityFn: (prev: Readonly<React.ComponentProps<T>>, next: Readonly<React.ComponentProps<T>>) => boolean
): React.MemoExoticComponent<T> {
  return React.memo(Component, equalityFn) as React.MemoExoticComponent<T>;
}

/**
 * Lazy load component with Suspense
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFn);
}

/**
 * Preload component
 */
export function preloadComponent(
  importFn: () => Promise<any>
): void {
  importFn();
}

/**
 * Component performance wrapper
 */
export function withPerformanceTracking<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  return ((props: React.ComponentProps<T>) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      if (renderTime > 16) {
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    });

    return React.createElement(Component, props);
  }) as T;
}

/**
 * Prevent unnecessary re-renders
 */
export function useShouldUpdate(
  props: Record<string, any>,
  prevProps: Record<string, any> | null
): boolean {
  if (!prevProps) return true;

  const keys = Object.keys(props);
  for (const key of keys) {
    if (props[key] !== prevProps[key]) {
      return true;
    }
  }

  return false;
}

/**
 * Optimize event handlers
 */
export function useOptimizedHandlers<T extends Record<string, (...args: any[]) => any>>(
  handlers: T
): T {
  return React.useMemo(() => handlers, [JSON.stringify(Object.keys(handlers))]);
}

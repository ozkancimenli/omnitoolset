/**
 * Advanced Memoization Utilities for PDF Editor
 * Provides sophisticated memoization strategies
 */

import { useMemo, useRef, useCallback } from 'react';

/**
 * Memoize with custom equality function
 */
export function useMemoWithEquality<T>(
  factory: () => T,
  deps: any[],
  equalityFn: (a: any[], b: any[]) => boolean = (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  }
): T {
  const ref = useRef<{ deps: any[]; value: T } | null>(null);

  if (!ref.current || !equalityFn(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() };
  }

  return ref.current.value;
}

/**
 * Memoize callback with deep equality
 */
export function useCallbackWithEquality<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[],
  equalityFn?: (a: any[], b: any[]) => boolean
): T {
  const ref = useRef<{ deps: any[]; callback: T } | null>(null);

  if (!ref.current || !equalityFn || !equalityFn(ref.current.deps, deps)) {
    ref.current = { deps, callback };
  }

  return ref.current.callback;
}

/**
 * Memoize expensive computation with cache
 */
export function useMemoizedComputation<T, Args extends any[]>(
  compute: (...args: Args) => T,
  args: Args,
  cacheSize: number = 50
): T {
  const cacheRef = useRef<Map<string, T>>(new Map());
  const keysRef = useRef<string[]>([]);

  return useMemo(() => {
    const key = JSON.stringify(args);

    if (cacheRef.current.has(key)) {
      return cacheRef.current.get(key)!;
    }

    const result = compute(...args);

    // Limit cache size
    if (cacheRef.current.size >= cacheSize) {
      const oldestKey = keysRef.current.shift()!;
      cacheRef.current.delete(oldestKey);
    }

    cacheRef.current.set(key, result);
    keysRef.current.push(key);

    return result;
  }, args);
}

/**
 * Memoize with TTL (Time To Live)
 */
export function useMemoWithTTL<T>(
  factory: () => T,
  deps: any[],
  ttl: number = 5000
): T {
  const ref = useRef<{ deps: any[]; value: T; timestamp: number } | null>(null);

  const now = Date.now();

  if (
    !ref.current ||
    !ref.current.deps.every((val, idx) => val === deps[idx]) ||
    now - ref.current.timestamp > ttl
  ) {
    ref.current = { deps, value: factory(), timestamp: now };
  }

  return ref.current.value;
}

/**
 * Stable reference hook (prevents unnecessary re-renders)
 */
export function useStableRef<T>(value: T): T {
  const ref = useRef<T>(value);
  
  if (ref.current !== value) {
    ref.current = value;
  }
  
  return ref.current;
}

/**
 * Memoize array/object with deep equality
 */
export function useDeepMemo<T>(value: T, deps: any[]): T {
  return useMemoWithEquality(
    () => value,
    deps,
    (a, b) => JSON.stringify(a) === JSON.stringify(b)
  );
}

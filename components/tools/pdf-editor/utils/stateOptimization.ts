/**
 * State Optimization Utilities
 * Provides optimized state management patterns
 */

import React, { useRef, useCallback } from 'react';

/**
 * Use stable callback that doesn't change on re-renders
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);

  // Update ref on each render
  callbackRef.current = callback;

  // Return stable function
  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Use ref-based state for values that don't need to trigger re-renders
 */
export function useRefState<T>(initialValue: T): [
  React.MutableRefObject<T>,
  (value: T | ((prev: T) => T)) => void
] {
  const ref = useRef<T>(initialValue);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      ref.current = (value as (prev: T) => T)(ref.current);
    } else {
      ref.current = value;
    }
  }, []);

  return [ref, setValue];
}

/**
 * Batch state updates
 */
export function useBatchedState<T>(
  initialState: T,
  batchDelay: number = 0
): [T, (updater: (prev: T) => T) => void, () => void] {
  const [state, setState] = React.useState<T>(initialState);
  const pendingUpdatesRef = useRef<Array<(prev: T) => T>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const batchedSetState = useCallback((updater: (prev: T) => T) => {
    pendingUpdatesRef.current.push(updater);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState(prev => {
        let result = prev;
        pendingUpdatesRef.current.forEach(updater => {
          result = updater(result);
        });
        pendingUpdatesRef.current = [];
        return result;
      });
      timeoutRef.current = null;
    }, batchDelay);
  }, [batchDelay]);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (pendingUpdatesRef.current.length > 0) {
      setState(prev => {
        let result = prev;
        pendingUpdatesRef.current.forEach(updater => {
          result = updater(result);
        });
        pendingUpdatesRef.current = [];
        return result;
      });
    }
  }, []);

  return [state, batchedSetState, flush];
}

/**
 * Use selector pattern for derived state
 */
export function useSelector<T, R>(
  state: T,
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
): R {
  const prevResultRef = useRef<R>();
  const prevStateRef = useRef<T>(state);

  if (prevStateRef.current !== state) {
    const newResult = selector(state);

    if (
      !prevResultRef.current ||
      !equalityFn ||
      !equalityFn(prevResultRef.current, newResult)
    ) {
      prevResultRef.current = newResult;
    }

    prevStateRef.current = state;
  }

  return prevResultRef.current!;
}


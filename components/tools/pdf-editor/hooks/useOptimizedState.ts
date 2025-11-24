/**
 * Optimized State Hook
 * Provides optimized state management for PDF editor
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useMemoWithEquality, useStableRef } from '../utils/advancedMemoization';
import { useBatchedState, useSelector } from '../utils/stateOptimization';

/**
 * Use optimized state with automatic memoization
 */
export function useOptimizedState<T>(
  initialState: T,
  equalityFn?: (a: T, b: T) => boolean
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialState);
  const prevStateRef = useRef<T>(initialState);

  const setOptimizedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState(prev => {
        const newValue = typeof value === 'function' 
          ? (value as (prev: T) => T)(prev)
          : value;

        if (equalityFn && equalityFn(prev, newValue)) {
          return prev; // No change, return previous
        }

        prevStateRef.current = newValue;
        return newValue;
      });
    },
    [equalityFn]
  );

  return [state, setOptimizedState];
}

/**
 * Use batched state for multiple rapid updates
 */
export function useBatchedOptimizedState<T>(
  initialState: T,
  batchDelay: number = 0,
  equalityFn?: (a: T, b: T) => boolean
): [T, (updater: (prev: T) => T) => void, () => void] {
  return useBatchedState(initialState, batchDelay);
}

/**
 * Use selector for derived state
 */
export function useOptimizedSelector<T, R>(
  state: T,
  selector: (state: T) => R,
  equalityFn?: (a: R, b: R) => boolean
): R {
  return useSelector(state, selector, equalityFn);
}

/**
 * Use stable state that doesn't trigger re-renders unless value actually changes
 */
export function useStableState<T>(initialValue: T): [
  React.MutableRefObject<T>,
  (value: T | ((prev: T) => T)) => void,
  () => T
] {
  const ref = useRef<T>(initialValue);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    if (typeof value === 'function') {
      ref.current = (value as (prev: T) => T)(ref.current);
    } else {
      ref.current = value;
    }
  }, []);

  const getValue = useCallback(() => ref.current, []);

  return [ref, setValue, getValue];
}

/**
 * Use computed state (memoized derived state)
 */
export function useComputedState<T, Dependencies extends any[]>(
  compute: (...deps: Dependencies) => T,
  dependencies: Dependencies,
  equalityFn?: (a: T, b: T) => boolean
): T {
  return useMemoWithEquality(
    () => compute(...dependencies),
    dependencies,
    (a, b) => {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => val === b[idx]);
    }
  );
}


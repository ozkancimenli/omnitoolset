/**
 * Optimized Render Hook for PDF Editor
 * Combines multiple optimization strategies
 */

import { useRef, useCallback, useEffect } from 'react';
import { useMemoWithEquality, useMemoWithTTL } from '../utils/advancedMemoization';
import { createDebouncedRender, createThrottledRender, PriorityRenderer } from '../utils/renderOptimization';
import { useStableCallback } from '../utils/stateOptimization';

interface UseOptimizedRenderOptions {
  debounceDelay?: number;
  throttleLimit?: number;
  usePriority?: boolean;
  useCache?: boolean;
  cacheTTL?: number;
}

export function useOptimizedRender(
  renderFn: () => void | Promise<void>,
  deps: any[],
  options: UseOptimizedRenderOptions = {}
) {
  const {
    debounceDelay = 16,
    throttleLimit = 16,
    usePriority = false,
    useCache = true,
    cacheTTL = 5000,
  } = options;

  const priorityRendererRef = useRef<PriorityRenderer | null>(null);
  const debouncedRenderRef = useRef<(() => void) | null>(null);
  const throttledRenderRef = useRef<(() => void) | null>(null);
  const lastRenderTimeRef = useRef<number>(0);
  const isRenderingRef = useRef<boolean>(false);

  // Stable render function
  const stableRenderFn = useStableCallback(renderFn);

  // Memoize render with TTL if cache is enabled
  const memoizedRender = useMemoWithTTL(
    () => stableRenderFn,
    deps,
    useCache ? cacheTTL : 0
  );

  useEffect(() => {
    if (usePriority) {
      priorityRendererRef.current = new PriorityRenderer();
    } else {
      debouncedRenderRef.current = createDebouncedRender(
        () => {
          if (!isRenderingRef.current) {
            isRenderingRef.current = true;
            Promise.resolve(memoizedRender()).finally(() => {
              isRenderingRef.current = false;
              lastRenderTimeRef.current = Date.now();
            });
          }
        },
        debounceDelay
      );

      throttledRenderRef.current = createThrottledRender(
        () => {
          if (!isRenderingRef.current) {
            isRenderingRef.current = true;
            Promise.resolve(memoizedRender()).finally(() => {
              isRenderingRef.current = false;
              lastRenderTimeRef.current = Date.now();
            });
          }
        },
        throttleLimit
      );
    }
  }, [memoizedRender, debounceDelay, throttleLimit, usePriority, useCache, cacheTTL]);

  const optimizedRender = useCallback(
    (priority: 'high' | 'low' = 'high', immediate: boolean = false) => {
      if (immediate) {
        // Immediate render (for critical updates)
        if (!isRenderingRef.current) {
          isRenderingRef.current = true;
          Promise.resolve(memoizedRender()).finally(() => {
            isRenderingRef.current = false;
            lastRenderTimeRef.current = Date.now();
          });
        }
        return;
      }

      if (usePriority && priorityRendererRef.current) {
        if (priority === 'high') {
          priorityRendererRef.current.addHighPriority(() => {
            if (!isRenderingRef.current) {
              isRenderingRef.current = true;
              Promise.resolve(memoizedRender()).finally(() => {
                isRenderingRef.current = false;
                lastRenderTimeRef.current = Date.now();
              });
            }
          });
        } else {
          priorityRendererRef.current.addLowPriority(() => {
            if (!isRenderingRef.current) {
              isRenderingRef.current = true;
              Promise.resolve(memoizedRender()).finally(() => {
                isRenderingRef.current = false;
                lastRenderTimeRef.current = Date.now();
              });
            }
          });
        }
      } else if (priority === 'high' && throttledRenderRef.current) {
        throttledRenderRef.current();
      } else if (debouncedRenderRef.current) {
        debouncedRenderRef.current();
      }
    },
    [memoizedRender, usePriority]
  );

  const canRender = useCallback(() => {
    return !isRenderingRef.current;
  }, []);

  const getLastRenderTime = useCallback(() => {
    return lastRenderTimeRef.current;
  }, []);

  return {
    optimizedRender,
    canRender,
    getLastRenderTime,
  };
}


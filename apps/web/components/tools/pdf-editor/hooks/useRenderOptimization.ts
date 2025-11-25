/**
 * Render Optimization Hook
 * Provides optimized rendering for PDF pages
 */

import { useRef, useCallback, useEffect } from 'react';
import { createDebouncedRender, createThrottledRender, PriorityRenderer } from '../utils/renderOptimization';

interface UseRenderOptimizationOptions {
  debounceDelay?: number;
  throttleLimit?: number;
  usePriority?: boolean;
}

export function useRenderOptimization(
  renderFn: () => void,
  options: UseRenderOptimizationOptions = {}
) {
  const {
    debounceDelay = 16,
    throttleLimit = 16,
    usePriority = false,
  } = options;

  const priorityRendererRef = useRef<PriorityRenderer | null>(null);
  const debouncedRenderRef = useRef<(() => void) | null>(null);
  const throttledRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (usePriority) {
      priorityRendererRef.current = new PriorityRenderer();
    } else {
      debouncedRenderRef.current = createDebouncedRender(renderFn, debounceDelay);
      throttledRenderRef.current = createThrottledRender(renderFn, throttleLimit);
    }
  }, [renderFn, debounceDelay, throttleLimit, usePriority]);

  const optimizedRender = useCallback(
    (priority: 'high' | 'low' = 'high') => {
      if (usePriority && priorityRendererRef.current) {
        if (priority === 'high') {
          priorityRendererRef.current.addHighPriority(renderFn);
        } else {
          priorityRendererRef.current.addLowPriority(renderFn);
        }
      } else if (priority === 'high' && throttledRenderRef.current) {
        throttledRenderRef.current();
      } else if (debouncedRenderRef.current) {
        debouncedRenderRef.current();
      }
    },
    [renderFn, usePriority]
  );

  return { optimizedRender };
}


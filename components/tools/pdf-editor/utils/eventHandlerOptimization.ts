/**
 * Event Handler Optimization Utilities
 * Optimizes event handlers for better performance
 */

import { useCallback, useRef, useMemo } from 'react';

/**
 * Create stable event handler
 */
export function useStableEventHandler<T extends (...args: any[]) => any>(
  handler: T
): T {
  const handlerRef = useRef<T>(handler);

  // Update ref on each render
  handlerRef.current = handler;

  return useCallback(
    ((...args: Parameters<T>) => {
      return handlerRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Create debounced event handler
 */
export function useDebouncedEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stableHandler = useStableEventHandler(handler);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        stableHandler(...args);
        timeoutRef.current = null;
      }, delay);
    }) as T,
    [stableHandler, delay]
  );
}

/**
 * Create throttled event handler
 */
export function useThrottledEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  limit: number = 100
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stableHandler = useStableEventHandler(handler);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCallRef.current >= limit) {
        lastCallRef.current = now;
        stableHandler(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          stableHandler(...args);
          timeoutRef.current = null;
        }, limit - (now - lastCallRef.current));
      }
    }) as T,
    [stableHandler, limit]
  );
}

/**
 * Create passive event handler
 */
export function usePassiveEventHandler<T extends keyof HTMLElementEventMap>(
  event: T,
  handler: (event: HTMLElementEventMap[T]) => void,
  element: HTMLElement | null
): void {
  const stableHandler = useStableEventHandler(handler);

  useMemo(() => {
    if (!element) return;

    element.addEventListener(event, stableHandler as EventListener, { passive: true });

    return () => {
      element.removeEventListener(event, stableHandler as EventListener);
    };
  }, [element, event, stableHandler]);
}

/**
 * Create optimized mouse event handler
 */
export function useOptimizedMouseHandler(
  handler: (e: MouseEvent) => void,
  options: {
    debounce?: number;
    throttle?: number;
    passive?: boolean;
  } = {}
): (e: MouseEvent) => void {
  const { debounce, throttle, passive = true } = options;

  let optimizedHandler: (e: MouseEvent) => void;

  if (debounce) {
    optimizedHandler = useDebouncedEventHandler(handler, debounce);
  } else if (throttle) {
    optimizedHandler = useThrottledEventHandler(handler, throttle);
  } else {
    optimizedHandler = useStableEventHandler(handler);
  }

  return optimizedHandler;
}

/**
 * Create optimized scroll event handler
 */
export function useOptimizedScrollHandler(
  handler: (e: Event) => void,
  options: {
    throttle?: number;
    passive?: boolean;
  } = {}
): (e: Event) => void {
  const { throttle = 16, passive = true } = options;

  return useThrottledEventHandler(handler, throttle);
}

/**
 * Create optimized resize event handler
 */
export function useOptimizedResizeHandler(
  handler: (e: UIEvent) => void,
  options: {
    debounce?: number;
    throttle?: number;
  } = {}
): (e: UIEvent) => void {
  const { debounce = 150, throttle } = options;

  if (throttle) {
    return useThrottledEventHandler(handler, throttle);
  }

  return useDebouncedEventHandler(handler, debounce);
}

/**
 * Batch event handlers
 */
export function useBatchedEventHandlers<T extends Record<string, (...args: any[]) => any>>(
  handlers: T
): T {
  return useMemo(() => handlers, [JSON.stringify(Object.keys(handlers))]);
}


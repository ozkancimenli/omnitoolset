/**
 * Memory Leak Prevention Utilities
 * Helps prevent memory leaks in PDF editor
 */

import { useEffect, useRef } from 'react';

/**
 * Cleanup function type
 */
type CleanupFn = () => void;

/**
 * Register cleanup function
 */
export function useCleanup(cleanup: CleanupFn): void {
  useEffect(() => {
    return cleanup;
  }, []);
}

/**
 * Track and cleanup timeouts
 */
export function useTimeoutCleanup(): {
  setTimeout: (fn: () => void, delay: number) => number;
  clearTimeout: (id: number) => void;
  clearAll: () => void;
} {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setTimeoutWrapper = (fn: () => void, delay: number): number => {
    const id = setTimeout(() => {
      fn();
      timeoutsRef.current.delete(id as any);
    }, delay) as any;
    timeoutsRef.current.add(id);
    return id;
  };

  const clearTimeoutWrapper = (id: number): void => {
    clearTimeout(id);
    timeoutsRef.current.delete(id as any);
  };

  const clearAll = (): void => {
    timeoutsRef.current.forEach(id => clearTimeout(id as any));
    timeoutsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return {
    setTimeout: setTimeoutWrapper,
    clearTimeout: clearTimeoutWrapper,
    clearAll,
  };
}

/**
 * Track and cleanup intervals
 */
export function useIntervalCleanup(): {
  setInterval: (fn: () => void, delay: number) => number;
  clearInterval: (id: number) => void;
  clearAll: () => void;
} {
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  const setIntervalWrapper = (fn: () => void, delay: number): number => {
    const id = setInterval(fn, delay) as any;
    intervalsRef.current.add(id);
    return id;
  };

  const clearIntervalWrapper = (id: number): void => {
    clearInterval(id);
    intervalsRef.current.delete(id as any);
  };

  const clearAll = (): void => {
    intervalsRef.current.forEach(id => clearInterval(id as any));
    intervalsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return {
    setInterval: setIntervalWrapper,
    clearInterval: clearIntervalWrapper,
    clearAll,
  };
}

/**
 * Track and cleanup event listeners
 */
export function useEventListenerCleanup(): {
  addEventListener: <K extends keyof WindowEventMap>(
    target: Window | Document | HTMLElement,
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ) => void;
  removeEventListener: <K extends keyof WindowEventMap>(
    target: Window | Document | HTMLElement,
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ) => void;
  clearAll: () => void;
} {
  const listenersRef = useRef<Array<{
    target: Window | Document | HTMLElement;
    event: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
  }>>([]);

  const addEventListenerWrapper = <K extends keyof WindowEventMap>(
    target: Window | Document | HTMLElement,
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void => {
    target.addEventListener(event, handler as EventListener, options);
    listenersRef.current.push({ target, event, handler: handler as EventListener, options });
  };

  const removeEventListenerWrapper = <K extends keyof WindowEventMap>(
    target: Window | Document | HTMLElement,
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void => {
    target.removeEventListener(event, handler as EventListener, options);
    listenersRef.current = listenersRef.current.filter(
      l => !(l.target === target && l.event === event && l.handler === handler)
    );
  };

  const clearAll = (): void => {
    listenersRef.current.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    listenersRef.current = [];
  };

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return {
    addEventListener: addEventListenerWrapper,
    removeEventListener: removeEventListenerWrapper,
    clearAll,
  };
}

/**
 * Cleanup object URLs
 */
export function useObjectURLCleanup(): {
  createObjectURL: (object: Blob | File) => string;
  revokeObjectURL: (url: string) => void;
  clearAll: () => void;
} {
  const urlsRef = useRef<Set<string>>(new Set());

  const createObjectURLWrapper = (object: Blob | File): string => {
    const url = URL.createObjectURL(object);
    urlsRef.current.add(url);
    return url;
  };

  const revokeObjectURLWrapper = (url: string): void => {
    URL.revokeObjectURL(url);
    urlsRef.current.delete(url);
  };

  const clearAll = (): void => {
    urlsRef.current.forEach(url => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return {
    createObjectURL: createObjectURLWrapper,
    revokeObjectURL: revokeObjectURLWrapper,
    clearAll,
  };
}

/**
 * Cleanup canvas contexts
 */
export function useCanvasCleanup(): {
  getContext: (canvas: HTMLCanvasElement, contextType: '2d') => CanvasRenderingContext2D | null;
  clearAll: () => void;
} {
  const contextsRef = useRef<Set<CanvasRenderingContext2D>>(new Set());

  const getContextWrapper = (
    canvas: HTMLCanvasElement,
    contextType: '2d'
  ): CanvasRenderingContext2D | null => {
    const ctx = canvas.getContext(contextType);
    if (ctx) {
      contextsRef.current.add(ctx);
    }
    return ctx;
  };

  const clearAll = (): void => {
    contextsRef.current.forEach(ctx => {
      // Clear canvas if possible
      const canvas = ctx.canvas;
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    contextsRef.current.clear();
  };

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  return {
    getContext: getContextWrapper,
    clearAll,
  };
}


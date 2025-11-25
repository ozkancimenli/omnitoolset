/**
 * Intersection Observer Utilities
 * Optimizes rendering based on visibility
 */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Use intersection observer hook
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement | null>, boolean] {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold]);

  return [elementRef, isIntersecting];
}

/**
 * Lazy load component when visible
 */
export function useLazyLoad(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement | null>, boolean, () => void] {
  const [elementRef, isIntersecting] = useIntersectionObserver(options);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  const forceLoad = useCallback(() => {
    setHasLoaded(true);
  }, []);

  return [elementRef, hasLoaded, forceLoad];
}

/**
 * Preload adjacent pages when current page is visible
 */
export function usePagePreloader(
  currentPage: number,
  totalPages: number,
  preloadCount: number = 2
): React.RefObject<HTMLElement | null> {
  const [elementRef, isIntersecting] = useIntersectionObserver();

  useEffect(() => {
    if (!isIntersecting) return;

    // Preload previous pages
    for (let i = Math.max(1, currentPage - preloadCount); i < currentPage; i++) {
      // Trigger preload (implementation depends on your PDF loading system)
      console.log(`Preloading page ${i}`);
    }

    // Preload next pages
    for (let i = currentPage + 1; i <= Math.min(totalPages, currentPage + preloadCount); i++) {
      // Trigger preload
      console.log(`Preloading page ${i}`);
    }
  }, [isIntersecting, currentPage, totalPages, preloadCount]);

  return elementRef;
}

/**
 * Observe multiple elements
 */
export function useMultipleIntersectionObserver(
  elements: HTMLElement[],
  options: IntersectionObserverInit = {}
): Map<HTMLElement, boolean> {
  const [intersections, setIntersections] = useState<Map<HTMLElement, boolean>>(new Map());

  useEffect(() => {
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        setIntersections(prev => {
          const next = new Map(prev);
          entries.forEach(entry => {
            next.set(entry.target as HTMLElement, entry.isIntersecting);
          });
          return next;
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      }
    );

    elements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [elements, options.root, options.rootMargin, options.threshold]);

  return intersections;
}

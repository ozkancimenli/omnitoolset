/**
 * Virtual Scrolling Utilities
 * Optimizes rendering of large lists
 */

import { useMemo, useState } from 'react';

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  horizontal?: boolean;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  offsetY: number;
  totalHeight: number;
}

/**
 * Calculate virtual scroll positions
 */
export function calculateVirtualScroll(
  scrollTop: number,
  totalItems: number,
  config: VirtualScrollConfig
): VirtualScrollResult {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    horizontal = false,
  } = config;

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(i);
  }

  const offsetY = startIndex * itemHeight;
  const totalHeight = totalItems * itemHeight;

  return {
    startIndex,
    endIndex,
    visibleItems,
    offsetY,
    totalHeight,
  };
}

/**
 * Virtual scroll hook
 */
export function useVirtualScroll(
  scrollTop: number,
  totalItems: number,
  config: VirtualScrollConfig
): VirtualScrollResult {
  return useMemo(
    () => calculateVirtualScroll(scrollTop, totalItems, config),
    [scrollTop, totalItems, config.itemHeight, config.containerHeight, config.overscan]
  );
}

/**
 * Optimize thumbnail rendering with virtual scrolling
 */
export function useVirtualThumbnails(
  thumbnails: string[],
  containerHeight: number,
  thumbnailHeight: number = 150
): {
  visibleThumbnails: Array<{ index: number; url: string }>;
  startIndex: number;
  endIndex: number;
  offsetY: number;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const result = useVirtualScroll(scrollTop, thumbnails.length, {
    itemHeight: thumbnailHeight,
    containerHeight,
    overscan: 2,
  });

  const visibleThumbnails = useMemo(
    () =>
      result.visibleItems.map(index => ({
        index,
        url: thumbnails[index],
      })),
    [result.visibleItems, thumbnails]
  );

  return {
    visibleThumbnails,
    startIndex: result.startIndex,
    endIndex: result.endIndex,
    offsetY: result.offsetY,
  };
}

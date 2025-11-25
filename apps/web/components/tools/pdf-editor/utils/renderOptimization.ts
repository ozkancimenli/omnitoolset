/**
 * Render Optimization Utilities for PDF Editor
 * Provides advanced rendering optimizations
 */

/**
 * Batch render updates
 */
export class RenderBatcher {
  private updates: Array<() => void> = [];
  private scheduled: boolean = false;

  /**
   * Schedule an update
   */
  schedule(update: () => void): void {
    this.updates.push(update);

    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  /**
   * Flush all updates
   */
  private flush(): void {
    const updates = [...this.updates];
    this.updates = [];
    this.scheduled = false;

    updates.forEach(update => update());
  }
}

/**
 * Virtual list for large datasets
 */
export interface VirtualListConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

export function calculateVirtualList(
  scrollTop: number,
  totalItems: number,
  config: VirtualListConfig
): {
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  offsetY: number;
} {
  const { itemHeight, containerHeight, overscan = 3 } = config;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems: number[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(i);
  }

  const offsetY = startIndex * itemHeight;

  return {
    startIndex,
    endIndex,
    visibleItems,
    offsetY,
  };
}

/**
 * Optimize canvas rendering
 */
export function optimizeCanvasRender(
  canvas: HTMLCanvasElement,
  renderFn: (ctx: CanvasRenderingContext2D) => void
): void {
  const ctx = canvas.getContext('2d', {
    alpha: false, // Disable alpha for better performance
    desynchronized: true, // Allow async rendering
    willReadFrequently: false, // Optimize for write operations
  });

  if (!ctx) return;

  // Use requestAnimationFrame for smooth rendering
  requestAnimationFrame(() => {
    renderFn(ctx);
  });
}

/**
 * Debounced render
 */
export function createDebouncedRender(
  renderFn: () => void,
  delay: number = 16
): () => void {
  let timeout: NodeJS.Timeout | null = null;
  let scheduled = false;

  return () => {
    if (scheduled) return;

    scheduled = true;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      renderFn();
      scheduled = false;
      timeout = null;
    }, delay);
  };
}

/**
 * Throttled render
 */
export function createThrottledRender(
  renderFn: () => void,
  limit: number = 16
): () => void {
  let inThrottle = false;
  let lastCall: number = 0;

  return () => {
    const now = Date.now();

    if (!inThrottle || now - lastCall >= limit) {
      renderFn();
      lastCall = now;
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Render with priority
 */
export class PriorityRenderer {
  private highPriority: Array<() => void> = [];
  private lowPriority: Array<() => void> = [];
  private processing = false;

  /**
   * Add high priority render
   */
  addHighPriority(render: () => void): void {
    this.highPriority.push(render);
    this.process();
  }

  /**
   * Add low priority render
   */
  addLowPriority(render: () => void): void {
    this.lowPriority.push(render);
    this.process();
  }

  /**
   * Process renders
   */
  private process(): void {
    if (this.processing) return;

    this.processing = true;

    requestAnimationFrame(() => {
      // Process high priority first
      while (this.highPriority.length > 0) {
        const render = this.highPriority.shift()!;
        render();
      }

      // Process low priority if time allows
      if (this.lowPriority.length > 0) {
        requestIdleCallback(() => {
          while (this.lowPriority.length > 0) {
            const render = this.lowPriority.shift()!;
            render();
          }
          this.processing = false;
        });
      } else {
        this.processing = false;
      }
    });
  }
}


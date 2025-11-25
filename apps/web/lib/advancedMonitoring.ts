/**
 * Advanced Monitoring Utilities
 * System-wide monitoring and analytics
 */

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  fmp?: number; // First Meaningful Paint
  tti?: number; // Time to Interactive
}

/**
 * Measure performance metrics
 */
export function measurePerformanceMetrics(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve({});
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Measure FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          metrics.fcp = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
      // Not supported
    }

    // Measure LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Not supported
    }

    // Measure FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Not supported
    }

    // Measure CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Not supported
    }

    // Measure TTFB
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }
    } catch (e) {
      // Not supported
    }

    // Resolve after a delay to collect metrics
    setTimeout(() => {
      resolve(metrics);
    }, 5000);
  });
}

/**
 * Track custom event
 */
export function trackCustomEvent(
  eventName: string,
  eventData?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, eventData);
  }

  // Custom analytics
  console.log('Event tracked:', eventName, eventData);
}

/**
 * Track page performance
 */
export function trackPagePerformance(): void {
  if (typeof window === 'undefined') return;

  measurePerformanceMetrics().then(metrics => {
    trackCustomEvent('page_performance', metrics);
  });
}

/**
 * Track errors
 */
export function trackError(
  error: Error,
  context?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      ...context,
    });
  }

  // Custom error tracking
  console.error('Error tracked:', error, context);
}

/**
 * Track user actions
 */
export function trackUserAction(
  action: string,
  details?: Record<string, any>
): void {
  trackCustomEvent('user_action', {
    action,
    ...details,
  });
}

/**
 * Track tool usage
 */
export function trackToolUsage(
  toolId: string,
  action: string,
  details?: Record<string, any>
): void {
  trackCustomEvent('tool_usage', {
    tool_id: toolId,
    action,
    ...details,
  });
}

/**
 * Monitor memory usage
 */
export function getMemoryUsage(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
} {
  if (typeof window === 'undefined' || !(performance as any).memory) {
    return {};
  }

  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
}

/**
 * Monitor network requests
 */
export function monitorNetworkRequests(): PerformanceEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    return performance.getEntriesByType('resource');
  } catch (e) {
    return [];
  }
}

/**
 * Get slow requests
 */
export function getSlowRequests(threshold: number = 1000): PerformanceResourceTiming[] {
  const requests = monitorNetworkRequests() as PerformanceResourceTiming[];
  return requests.filter(request => {
    const duration = request.responseEnd - request.startTime;
    return duration > threshold;
  });
}

/**
 * Initialize monitoring
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track page performance
  if (document.readyState === 'complete') {
    trackPagePerformance();
  } else {
    window.addEventListener('load', trackPagePerformance);
  }

  // Track errors
  window.addEventListener('error', (event) => {
    trackError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackError(new Error(event.reason), {
      type: 'unhandledrejection',
    });
  });
}


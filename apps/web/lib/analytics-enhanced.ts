/**
 * Enhanced Analytics Utilities
 * Provides comprehensive analytics tracking
 */

/**
 * Track page view
 */
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('config', 'G-1WF6SNHNXN', {
      page_path: url,
      page_title: title,
    });
  }

  // Custom analytics
  if ((window as any).trackEvent) {
    (window as any).trackEvent('page_view', {
      url,
      title,
      timestamp: Date.now(),
    });
  }
}

/**
 * Track event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Google Analytics
  if ((window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }

  // Custom analytics
  if ((window as any).trackEvent) {
    (window as any).trackEvent(eventName, {
      ...eventParams,
      timestamp: Date.now(),
    });
  }
}

/**
 * Track tool usage
 */
export function trackToolUsage(toolId: string, action: string): void {
  trackEvent('tool_usage', {
    tool_id: toolId,
    action,
  });
}

/**
 * Track conversion
 */
export function trackConversion(conversionType: string, value?: number): void {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value,
  });
}

/**
 * Track error
 */
export function trackError(error: Error, context?: Record<string, any>): void {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context,
  });
}

/**
 * Track performance
 */
export function trackPerformance(metricName: string, value: number): void {
  trackEvent('performance', {
    metric_name: metricName,
    value,
  });
}


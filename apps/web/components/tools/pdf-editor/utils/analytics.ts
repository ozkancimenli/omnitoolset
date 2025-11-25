// Advanced Analytics and Telemetry
// Tracks user behavior and performance metrics

export interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export class Analytics {
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private sessionId: string;
  private userId: string | null = null;
  private endpoint: string | null = null;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  /**
   * Initialize analytics
   */
  initialize(endpoint: string, userId?: string): void {
    this.endpoint = endpoint;
    if (userId) this.userId = userId;
  }

  /**
   * Track event
   */
  track(eventName: string, category: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      category,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.events.push(event);

    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track performance metric
   */
  trackMetric(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: Record<string, any>): void {
    this.track('page_view', 'navigation', {
      page,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, properties?: Record<string, any>): void {
    this.track(action, 'user_action', properties);
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', 'exception', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  /**
   * Track performance
   */
  trackPerformance(metricName: string, duration: number, tags?: Record<string, string>): void {
    this.trackMetric(metricName, duration, 'ms', tags);
  }

  /**
   * Flush events to server
   */
  async flush(): Promise<void> {
    if (this.events.length === 0 && this.metrics.length === 0) return;
    if (!this.endpoint) return;

    const events = [...this.events];
    const metrics = [...this.metrics];
    this.events = [];
    this.metrics = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          metrics,
          sessionId: this.sessionId,
          userId: this.userId,
          timestamp: Date.now(),
        }),
        keepalive: true, // Send even if page is unloading
      });
    } catch (error) {
      // Re-add events if send failed
      this.events.unshift(...events);
      this.metrics.unshift(...metrics);
      console.error('[Analytics] Flush failed:', error);
    }
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get events count
   */
  getEventsCount(): number {
    return this.events.length;
  }

  /**
   * Get metrics count
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }
}

// Singleton instance
let analyticsInstance: Analytics | null = null;

export const getAnalytics = (): Analytics => {
  if (!analyticsInstance) {
    analyticsInstance = new Analytics();
  }
  return analyticsInstance;
};


/**
 * Performance Optimizer - Advanced Performance Optimization Strategies
 * 
 * Provides performance optimizations including caching, lazy loading, and worker threads
 */

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsed?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

export interface CacheStrategy {
  maxSize: number;
  ttl: number; // Time to live in milliseconds
  evictionPolicy: 'lru' | 'lfu' | 'fifo';
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private cacheStrategies: Map<string, CacheStrategy> = new Map();

  /**
   * Measure operation performance
   */
  static async measure<T>(
    operation: string,
    fn: () => Promise<T> | T
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize;
    
    const result = await fn();
    
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize;
    
    const metrics: PerformanceMetrics = {
      operation,
      duration: endTime - startTime,
      memoryUsed: endMemory && startMemory ? endMemory - startMemory : undefined,
    };

    return { result, metrics };
  }

  /**
   * Create LRU cache
   */
  static createLRUCache<T>(maxSize: number, ttl?: number): Map<string, { value: T; timestamp: number }> {
    const cache = new Map<string, { value: T; timestamp: number }>();
    
    return new Proxy(cache, {
      get(target, prop) {
        if (prop === 'set') {
          return (key: string, val: { value: T; timestamp: number }) => {
            // Remove oldest if at capacity
            if (target.size >= maxSize) {
              const firstKey = target.keys().next().value;
              target.delete(firstKey);
            }
            
            // Check TTL
            if (ttl) {
              const now = Date.now();
              for (const [k, v] of target.entries()) {
                if (now - v.timestamp > ttl) {
                  target.delete(k);
                }
              }
            }
            
            target.set(key, { ...val, timestamp: Date.now() });
            return target;
          };
        }
        return Reflect.get(target, prop);
      },
    }) as any;
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Batch operations for performance
   */
  static async batch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R> | R,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Lazy load with promise caching
   */
  static createLazyLoader<T>(
    loader: () => Promise<T>
  ): () => Promise<T> {
    let promise: Promise<T> | null = null;
    
    return () => {
      if (!promise) {
        promise = loader();
      }
      return promise;
    };
  }

  /**
   * Create worker pool for heavy operations
   * Note: Worker pools require worker scripts to be available
   */
  static createWorkerPool(
    workerScript: string,
    poolSize: number = 4
  ): {
    execute: (data: any) => Promise<any>;
    terminate: () => void;
  } {
    // Check if Workers are supported
    if (typeof Worker === 'undefined') {
      // Fallback: execute synchronously
      return {
        execute: async (data: any) => {
          // Would need to implement synchronous fallback
          throw new Error('Workers not supported in this environment');
        },
        terminate: () => {},
      };
    }

    const workers: Worker[] = [];
    const queue: Array<{ data: any; resolve: (value: any) => void; reject: (error: any) => void }> = [];
    let currentWorkerIndex = 0;

    // Initialize workers
    try {
      for (let i = 0; i < poolSize; i++) {
        const worker = new Worker(workerScript, { type: 'module' });
        workers.push(worker);
      }
    } catch (error) {
      // Worker creation failed, return fallback
      return {
        execute: async (data: any) => {
          throw new Error('Failed to create workers');
        },
        terminate: () => {},
      };
    }

    const processQueue = () => {
      if (queue.length === 0 || workers.length === 0) return;

      const worker = workers[currentWorkerIndex];
      currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;

      if (worker) {
        const task = queue.shift()!;
        
        const handleMessage = (e: MessageEvent) => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          task.resolve(e.data);
          processQueue();
        };

        const handleError = (e: ErrorEvent) => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleError);
          task.reject(e.error || new Error('Worker error'));
          processQueue();
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleError);
        worker.postMessage(task.data);
      }
    };

    return {
      execute: (data: any) => {
        return new Promise((resolve, reject) => {
          queue.push({ data, resolve, reject });
          processQueue();
        });
      },
      terminate: () => {
        workers.forEach(worker => worker.terminate());
        workers.length = 0;
        queue.length = 0;
      },
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Add metric
   */
  addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }
}


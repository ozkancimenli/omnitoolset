/**
 * Performance Types
 * @module types/performance
 */

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

/**
 * Performance report
 */
export interface PerformanceReport {
  entries: any[];
  totalDuration: number;
  slowestOperations: Array<{
    name: string;
    duration: number;
  }>;
  memoryLeaks: Array<{
    name: string;
    delta: number;
  }>;
  recommendations: string[];
}

/**
 * Memory snapshot
 */
export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}


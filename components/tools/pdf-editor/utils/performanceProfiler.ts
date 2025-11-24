// Performance Profiling and Optimization Tools
// Provides detailed performance analysis and optimization suggestions

export interface ProfileEntry {
  name: string;
  start: number;
  end?: number;
  duration?: number;
  children: ProfileEntry[];
  memory?: {
    before: number;
    after: number;
    delta: number;
  };
}

export interface PerformanceReport {
  entries: ProfileEntry[];
  totalDuration: number;
  slowestOperations: Array<{ name: string; duration: number }>;
  memoryLeaks: Array<{ name: string; delta: number }>;
  recommendations: string[];
}

export class PerformanceProfiler {
  private profiles: Map<string, ProfileEntry> = new Map();
  private activeProfiles: ProfileEntry[] = [];
  private enabled: boolean = true;

  /**
   * Start profiling
   */
  start(name: string): () => void {
    if (!this.enabled) return () => {};

    const entry: ProfileEntry = {
      name,
      start: performance.now(),
      children: [],
    };

    if (this.activeProfiles.length > 0) {
      const parent = this.activeProfiles[this.activeProfiles.length - 1];
      parent.children.push(entry);
    } else {
      this.profiles.set(name, entry);
    }

    this.activeProfiles.push(entry);

    // Measure memory if available
    let memoryBefore: number | undefined;
    if ((performance as any).memory) {
      memoryBefore = (performance as any).memory.usedJSHeapSize;
      entry.memory = { before: memoryBefore, after: 0, delta: 0 };
    }

    // Return stop function
    return () => {
      const index = this.activeProfiles.indexOf(entry);
      if (index > -1) {
        this.activeProfiles.splice(index, 1);
      }

      entry.end = performance.now();
      entry.duration = entry.end - entry.start;

      if (entry.memory && (performance as any).memory) {
        entry.memory.after = (performance as any).memory.usedJSHeapSize;
        entry.memory.delta = entry.memory.after - entry.memory.before;
      }
    };
  }

  /**
   * Get profile report
   */
  getReport(): PerformanceReport {
    const entries = Array.from(this.profiles.values());
    const totalDuration = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

    // Find slowest operations
    const allEntries: ProfileEntry[] = [];
    const collectEntries = (entry: ProfileEntry) => {
      allEntries.push(entry);
      entry.children.forEach(collectEntries);
    };
    entries.forEach(collectEntries);

    const slowestOperations = allEntries
      .filter(e => e.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10)
      .map(e => ({ name: e.name, duration: e.duration || 0 }));

    // Find memory leaks
    const memoryLeaks = allEntries
      .filter(e => e.memory && e.memory.delta > 1024 * 1024) // > 1MB
      .sort((a, b) => (b.memory?.delta || 0) - (a.memory?.delta || 0))
      .slice(0, 10)
      .map(e => ({ name: e.name, delta: e.memory?.delta || 0 }));

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (slowestOperations.length > 0 && slowestOperations[0].duration > 100) {
      recommendations.push(`Optimize "${slowestOperations[0].name}" - taking ${slowestOperations[0].duration.toFixed(2)}ms`);
    }

    if (memoryLeaks.length > 0) {
      recommendations.push(`Memory leak detected in "${memoryLeaks[0].name}" - ${(memoryLeaks[0].delta / 1024 / 1024).toFixed(2)}MB`);
    }

    if (allEntries.length > 100) {
      recommendations.push('Consider reducing the number of operations');
    }

    return {
      entries,
      totalDuration,
      slowestOperations,
      memoryLeaks,
      recommendations,
    };
  }

  /**
   * Clear profiles
   */
  clear(): void {
    this.profiles.clear();
    this.activeProfiles = [];
  }

  /**
   * Enable/disable profiling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Export profile data
   */
  export(format: 'json' | 'chrome' = 'json'): string {
    const report = this.getReport();

    if (format === 'chrome') {
      // Chrome DevTools format
      const chromeFormat = {
        traceEvents: this.convertToChromeFormat(report.entries),
      };
      return JSON.stringify(chromeFormat, null, 2);
    }

    return JSON.stringify(report, null, 2);
  }

  /**
   * Convert to Chrome DevTools format
   */
  private convertToChromeFormat(entries: ProfileEntry[]): any[] {
    const events: any[] = [];

    const convert = (entry: ProfileEntry, pid: number = 1, tid: number = 1) => {
      events.push({
        name: entry.name,
        ph: 'B', // Begin
        ts: entry.start * 1000, // microseconds
        pid,
        tid,
      });

      entry.children.forEach(child => convert(child, pid, tid));

      if (entry.end) {
        events.push({
          name: entry.name,
          ph: 'E', // End
          ts: entry.end * 1000,
          pid,
          tid,
        });
      }
    };

    entries.forEach(entry => convert(entry));
    return events;
  }
}

// Singleton instance
let profilerInstance: PerformanceProfiler | null = null;

export const getPerformanceProfiler = (): PerformanceProfiler => {
  if (!profilerInstance) {
    profilerInstance = new PerformanceProfiler();
  }
  return profilerInstance;
};


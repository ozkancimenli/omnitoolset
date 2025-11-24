// Advanced Memory Management for PDF Editor
// Handles memory cleanup, monitoring, and optimization

interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export class MemoryManager {
  private snapshots: MemorySnapshot[] = [];
  private cleanupCallbacks: Array<() => void> = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private maxSnapshots: number = 100;
  private memoryThreshold: number = 100 * 1024 * 1024; // 100MB

  /**
   * Start monitoring memory usage
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
      this.checkMemoryThreshold();
    }, interval);
  }

  /**
   * Stop monitoring memory usage
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(): MemorySnapshot | null {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.jsHeapSizeLimit - memory.totalJSHeapSize,
    };

    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  /**
   * Get current memory usage
   */
  getCurrentMemory(): MemorySnapshot | null {
    return this.takeSnapshot();
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    current: MemorySnapshot | null;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    const current = this.snapshots[this.snapshots.length - 1] || null;
    const average = this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length || 0;
    const peak = Math.max(...this.snapshots.map(s => s.heapUsed), 0);
    
    // Calculate trend (last 10 snapshots)
    const recent = this.snapshots.slice(-10);
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recent.length >= 2) {
      const first = recent[0].heapUsed;
      const last = recent[recent.length - 1].heapUsed;
      const diff = (last - first) / first;
      if (diff > 0.1) trend = 'increasing';
      else if (diff < -0.1) trend = 'decreasing';
    }

    return { current, average, peak, trend };
  }

  /**
   * Check if memory usage exceeds threshold
   */
  private checkMemoryThreshold(): void {
    const current = this.getCurrentMemory();
    if (!current) return;

    if (current.heapUsed > this.memoryThreshold) {
      console.warn('[MemoryManager] Memory usage exceeds threshold:', {
        used: this.formatBytes(current.heapUsed),
        threshold: this.formatBytes(this.memoryThreshold),
      });
      
      // Trigger cleanup
      this.forceCleanup();
    }
  }

  /**
   * Register a cleanup callback
   */
  registerCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.push(callback);
    
    // Return unregister function
    return () => {
      const index = this.cleanupCallbacks.indexOf(callback);
      if (index > -1) {
        this.cleanupCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Force cleanup
   */
  forceCleanup(): void {
    console.log('[MemoryManager] Forcing cleanup...');
    
    // Run all cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[MemoryManager] Cleanup callback error:', error);
      }
    });

    // Suggest garbage collection (if available)
    if ((globalThis as any).gc) {
      (globalThis as any).gc();
    }

    // Clear old snapshots
    if (this.snapshots.length > 50) {
      this.snapshots = this.snapshots.slice(-50);
    }
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get memory report
   */
  getReport(): string {
    const stats = this.getMemoryStats();
    const current = stats.current;
    
    if (!current) return 'Memory monitoring not available';

    return `
Memory Report:
- Current: ${this.formatBytes(current.heapUsed)} / ${this.formatBytes(current.heapTotal)}
- Average: ${this.formatBytes(stats.average)}
- Peak: ${this.formatBytes(stats.peak)}
- Trend: ${stats.trend}
- Snapshots: ${this.snapshots.length}
- Cleanup callbacks: ${this.cleanupCallbacks.length}
    `.trim();
  }
}

// Singleton instance
let memoryManagerInstance: MemoryManager | null = null;

export const getMemoryManager = (): MemoryManager => {
  if (!memoryManagerInstance) {
    memoryManagerInstance = new MemoryManager();
  }
  return memoryManagerInstance;
};


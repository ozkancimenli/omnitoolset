/**
 * Worker Pool - Parallel Processing for Heavy Operations
 * 
 * Manages a pool of Web Workers for parallel PDF processing
 */

export interface WorkerTask {
  id: string;
  type: 'process' | 'compress' | 'extract' | 'analyze' | 'optimize';
  data: Uint8Array;
  options?: any;
}

export interface WorkerResult {
  id: string;
  success: boolean;
  data?: Uint8Array;
  error?: string;
  metrics?: {
    duration: number;
    memoryUsed?: number;
  };
}

export class WorkerPool {
  private workers: Worker[] = [];
  private maxWorkers: number;
  private taskQueue: WorkerTask[] = [];
  private activeTasks: Map<string, {
    worker: Worker;
    resolve: (result: WorkerResult) => void;
    reject: (error: Error) => void;
    startTime: number;
  }> = new Map();
  private workerScript: string;

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4, workerScript?: string) {
    this.maxWorkers = maxWorkers;
    this.workerScript = workerScript || this.getDefaultWorkerScript();
    this.initializeWorkers();
  }

  /**
   * Get default worker script
   */
  private getDefaultWorkerScript(): string {
    // Inline worker script for PDF processing
    return `
      self.onmessage = function(e) {
        const { id, type, data, options } = e.data;
        const startTime = performance.now();
        
        try {
          let result;
          
          switch(type) {
            case 'process':
              result = processPdf(data, options);
              break;
            case 'compress':
              result = compressData(data, options);
              break;
            case 'extract':
              result = extractText(data, options);
              break;
            case 'analyze':
              result = analyzePdf(data, options);
              break;
            case 'optimize':
              result = optimizePdf(data, options);
              break;
            default:
              throw new Error('Unknown task type: ' + type);
          }
          
          const duration = performance.now() - startTime;
          
          self.postMessage({
            id,
            success: true,
            data: result,
            metrics: { duration }
          });
        } catch (error) {
          const duration = performance.now() - startTime;
          self.postMessage({
            id,
            success: false,
            error: error.message,
            metrics: { duration }
          });
        }
      };
      
      function processPdf(data, options) {
        // Placeholder - in production would do actual processing
        return data;
      }
      
      function compressData(data, options) {
        // Placeholder - in production would do actual compression
        return data;
      }
      
      function extractText(data, options) {
        // Placeholder - in production would do actual extraction
        return new Uint8Array(0);
      }
      
      function analyzePdf(data, options) {
        // Placeholder - in production would do actual analysis
        return new Uint8Array(0);
      }
      
      function optimizePdf(data, options) {
        // Placeholder - in production would do actual optimization
        return data;
      }
    `;
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers(): void {
    try {
      for (let i = 0; i < this.maxWorkers; i++) {
        const blob = new Blob([this.workerScript], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = (e) => {
          this.handleWorkerMessage(worker, e.data);
        };
        
        worker.onerror = (error) => {
          console.error('Worker error:', error);
        };
        
        this.workers.push(worker);
      }
    } catch (error) {
      console.warn('Worker initialization failed, falling back to main thread:', error);
    }
  }

  /**
   * Handle worker message
   */
  private handleWorkerMessage(worker: Worker, result: WorkerResult): void {
    const task = this.activeTasks.get(result.id);
    if (!task) return;

    this.activeTasks.delete(result.id);
    task.resolve(result);
    this.processQueue();
  }

  /**
   * Process task queue
   */
  private processQueue(): void {
    if (this.taskQueue.length === 0) return;
    if (this.activeTasks.size >= this.maxWorkers) return;

    const task = this.taskQueue.shift();
    if (!task) return;

    const availableWorker = this.workers.find(w => 
      !Array.from(this.activeTasks.values()).some(t => t.worker === w)
    );

    if (!availableWorker) {
      this.taskQueue.unshift(task);
      return;
    }

    this.executeTask(availableWorker, task);
  }

  /**
   * Execute task on worker
   */
  private executeTask(worker: Worker, task: WorkerTask): Promise<WorkerResult> {
    return new Promise((resolve, reject) => {
      this.activeTasks.set(task.id, {
        worker,
        resolve,
        reject,
        startTime: performance.now(),
      });

      worker.postMessage({
        id: task.id,
        type: task.type,
        data: task.data,
        options: task.options,
      });
    });
  }

  /**
   * Submit task to worker pool
   */
  async submitTask(task: WorkerTask): Promise<WorkerResult> {
    // If no workers available, process in main thread
    if (this.workers.length === 0) {
      return this.processInMainThread(task);
    }

    // Add to queue
    this.taskQueue.push(task);
    
    // Process queue
    this.processQueue();

    // Wait for task to complete
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const activeTask = this.activeTasks.get(task.id);
        if (!activeTask) {
          clearInterval(checkInterval);
          // Task completed, find result
          // In real implementation, we'd track results differently
        }
      }, 100);

      // Fallback: process in main thread after timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        if (this.activeTasks.has(task.id)) {
          this.activeTasks.delete(task.id);
          this.processInMainThread(task).then(resolve).catch(reject);
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Process task in main thread (fallback)
   */
  private async processInMainThread(task: WorkerTask): Promise<WorkerResult> {
    const startTime = performance.now();
    try {
      // Fallback processing
      const result: WorkerResult = {
        id: task.id,
        success: true,
        data: task.data, // Return as-is for now
        metrics: {
          duration: performance.now() - startTime,
        },
      };
      return result;
    } catch (error: any) {
      return {
        id: task.id,
        success: false,
        error: error.message,
        metrics: {
          duration: performance.now() - startTime,
        },
      };
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number;
    activeTasks: number;
    queuedTasks: number;
  } {
    return {
      totalWorkers: this.workers.length,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
    };
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.activeTasks.clear();
    this.taskQueue = [];
  }
}


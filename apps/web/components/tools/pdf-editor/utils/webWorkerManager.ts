// Web Worker Manager for PDF Processing
export class WebWorkerManager {
  private workers: Worker[] = [];
  private workerQueue: Array<{ task: any; resolve: Function; reject: Function }> = [];
  private maxWorkers: number;
  private activeWorkers: number = 0;

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers;
  }

  /**
   * Execute a task in a worker
   */
  async execute<T>(task: { type: string; payload: any }): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = this.getAvailableWorker();
      
      if (worker) {
        this.runTask(worker, task, resolve, reject);
      } else {
        this.workerQueue.push({ task, resolve, reject });
      }
    });
  }

  /**
   * Get or create an available worker
   */
  private getAvailableWorker(): Worker | null {
    // Find idle worker
    if (this.workers.length < this.maxWorkers) {
      const worker = this.createWorker();
      this.workers.push(worker);
      return worker;
    }
    return null;
  }

  /**
   * Create a new worker
   */
  private createWorker(): Worker {
    // In a real implementation, this would load the worker script
    // For now, we'll use a placeholder
    const worker = new Worker(
      new URL('../workers/pdfWorker.ts', import.meta.url),
      { type: 'module' }
    );
    
    worker.onmessage = (e) => {
      this.activeWorkers--;
      this.processQueue();
    };
    
    worker.onerror = (error) => {
      console.error('Worker error:', error);
      this.activeWorkers--;
      this.processQueue();
    };
    
    return worker;
  }

  /**
   * Run a task in a worker
   */
  private runTask(
    worker: Worker,
    task: { type: string; payload: any },
    resolve: Function,
    reject: Function
  ): void {
    this.activeWorkers++;
    const taskId = `${Date.now()}-${Math.random()}`;
    
    const messageHandler = (e: MessageEvent) => {
      if (e.data.id === taskId) {
        worker.removeEventListener('message', messageHandler);
        this.activeWorkers--;
        
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.payload);
        }
        
        this.processQueue();
      }
    };
    
    worker.addEventListener('message', messageHandler);
    worker.postMessage({ ...task, id: taskId });
  }

  /**
   * Process queued tasks
   */
  private processQueue(): void {
    if (this.workerQueue.length === 0) return;
    
    const worker = this.getAvailableWorker();
    if (worker) {
      const { task, resolve, reject } = this.workerQueue.shift()!;
      this.runTask(worker, task, resolve, reject);
    }
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerQueue = [];
    this.activeWorkers = 0;
  }
}

// Singleton instance
let workerManagerInstance: WebWorkerManager | null = null;

export const getWorkerManager = (): WebWorkerManager => {
  if (!workerManagerInstance) {
    workerManagerInstance = new WebWorkerManager();
  }
  return workerManagerInstance;
};


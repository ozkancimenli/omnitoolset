// Progressive PDF Loading with Priority Queue
// Loads PDF pages based on priority and viewport visibility

interface LoadTask {
  pageNumber: number;
  priority: number;
  callback: (page: any) => void;
  errorCallback?: (error: Error) => void;
}

export class ProgressiveLoader {
  private taskQueue: LoadTask[] = [];
  private activeTasks: Set<number> = new Set();
  private maxConcurrent: number = 3;
  private processing: boolean = false;

  /**
   * Add a page to load queue
   */
  queuePage(
    pageNumber: number,
    priority: number,
    callback: (page: any) => void,
    errorCallback?: (error: Error) => void
  ): void {
    const task: LoadTask = {
      pageNumber,
      priority,
      callback,
      errorCallback,
    };

    // Insert based on priority (higher priority first)
    const index = this.taskQueue.findIndex(t => t.priority < priority);
    if (index === -1) {
      this.taskQueue.push(task);
    } else {
      this.taskQueue.splice(index, 0, task);
    }

    this.processQueue();
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    if (this.taskQueue.length === 0) return;
    if (this.activeTasks.size >= this.maxConcurrent) return;

    this.processing = true;

    while (this.taskQueue.length > 0 && this.activeTasks.size < this.maxConcurrent) {
      const task = this.taskQueue.shift()!;
      
      if (this.activeTasks.has(task.pageNumber)) {
        continue; // Skip if already loading
      }

      this.activeTasks.add(task.pageNumber);
      this.loadPage(task).finally(() => {
        this.activeTasks.delete(task.pageNumber);
        this.processing = false;
        this.processQueue();
      });
    }

    this.processing = false;
  }

  /**
   * Load a single page
   */
  private async loadPage(task: LoadTask): Promise<void> {
    try {
      // This would actually load the page
      // For now, simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // In real implementation:
      // const page = await pdfDoc.getPage(task.pageNumber);
      // task.callback(page);
      
      task.callback({ pageNumber: task.pageNumber });
    } catch (error) {
      if (task.errorCallback) {
        task.errorCallback(error as Error);
      }
    }
  }

  /**
   * Cancel a page load
   */
  cancelPage(pageNumber: number): void {
    this.taskQueue = this.taskQueue.filter(t => t.pageNumber !== pageNumber);
    this.activeTasks.delete(pageNumber);
  }

  /**
   * Clear all queued tasks
   */
  clear(): void {
    this.taskQueue = [];
    this.activeTasks.clear();
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queued: number;
    active: number;
    total: number;
  } {
    return {
      queued: this.taskQueue.length,
      active: this.activeTasks.size,
      total: this.taskQueue.length + this.activeTasks.size,
    };
  }
}

// Singleton instance
let loaderInstance: ProgressiveLoader | null = null;

export const getProgressiveLoader = (): ProgressiveLoader => {
  if (!loaderInstance) {
    loaderInstance = new ProgressiveLoader();
  }
  return loaderInstance;
};


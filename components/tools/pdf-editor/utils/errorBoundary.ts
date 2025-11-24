// Advanced Error Boundaries and Recovery
// Provides comprehensive error handling and recovery mechanisms

export interface ErrorInfo {
  error: Error;
  errorInfo: {
    componentStack: string;
    errorBoundary?: string;
  };
  timestamp: number;
  context?: Record<string, any>;
}

export interface ErrorRecoveryStrategy {
  name: string;
  canHandle: (error: Error) => boolean;
  recover: (error: Error, context: any) => Promise<any>;
  priority: number;
}

export class ErrorBoundaryManager {
  private errors: ErrorInfo[] = [];
  private maxErrors: number = 100;
  private recoveryStrategies: ErrorRecoveryStrategy[] = [];
  private errorHandlers: Set<(error: ErrorInfo) => void> = new Set();
  private isRecovering: boolean = false;

  /**
   * Register error recovery strategy
   */
  registerRecoveryStrategy(strategy: ErrorRecoveryStrategy): () => void {
    this.recoveryStrategies.push(strategy);
    this.recoveryStrategies.sort((a, b) => b.priority - a.priority);

    return () => {
      const index = this.recoveryStrategies.indexOf(strategy);
      if (index > -1) {
        this.recoveryStrategies.splice(index, 1);
      }
    };
  }

  /**
   * Handle error
   */
  async handleError(
    error: Error,
    errorInfo?: { componentStack: string; errorBoundary?: string },
    context?: Record<string, any>
  ): Promise<boolean> {
    const errorInfoObj: ErrorInfo = {
      error,
      errorInfo: errorInfo || { componentStack: '' },
      timestamp: Date.now(),
      context,
    };

    // Store error
    this.errors.push(errorInfoObj);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Notify handlers
    this.errorHandlers.forEach(handler => {
      try {
        handler(errorInfoObj);
      } catch (e) {
        console.error('[ErrorBoundary] Handler error:', e);
      }
    });

    // Attempt recovery
    if (!this.isRecovering) {
      return await this.attemptRecovery(error, context);
    }

    return false;
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(
    error: Error,
    context: any
  ): Promise<boolean> {
    this.isRecovering = true;

    try {
      for (const strategy of this.recoveryStrategies) {
        if (strategy.canHandle(error)) {
          try {
            await strategy.recover(error, context);
            console.log(`[ErrorBoundary] Recovered using strategy: ${strategy.name}`);
            return true;
          } catch (recoveryError) {
            console.error(`[ErrorBoundary] Recovery strategy ${strategy.name} failed:`, recoveryError);
            continue;
          }
        }
      }
    } finally {
      this.isRecovering = false;
    }

    return false;
  }

  /**
   * Register error handler
   */
  onError(handler: (error: ErrorInfo) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Get error history
   */
  getErrorHistory(limit?: number): ErrorInfo[] {
    const errors = [...this.errors];
    errors.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? errors.slice(0, limit) : errors;
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    total: number;
    byType: Record<string, number>;
    recent: number;
    recoveryRate: number;
  } {
    const byType: Record<string, number> = {};
    const recent = this.errors.filter(e => Date.now() - e.timestamp < 3600000).length;

    this.errors.forEach(error => {
      const type = error.error.name || 'Unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType,
      recent,
      recoveryRate: 0, // Would track successful recoveries
    };
  }
}

// Default recovery strategies
export const createDefaultRecoveryStrategies = (): ErrorRecoveryStrategy[] => {
  return [
    {
      name: 'MemoryCleanup',
      canHandle: (error: Error) => error.message.includes('memory') || error.message.includes('allocation'),
      recover: async (error: Error, context: any) => {
        // Force garbage collection if available
        if ((globalThis as any).gc) {
          (globalThis as any).gc();
        }
        // Clear caches
        if (context.clearCache) {
          context.clearCache();
        }
      },
      priority: 10,
    },
    {
      name: 'ReloadPage',
      canHandle: (error: Error) => error.message.includes('chunk') || error.message.includes('module'),
      recover: async () => {
        // Reload page after delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      priority: 5,
    },
    {
      name: 'ResetState',
      canHandle: () => true, // Fallback strategy
      recover: async (error: Error, context: any) => {
        // Reset application state
        if (context.resetState) {
          context.resetState();
        }
      },
      priority: 1,
    },
  ];
};

// Singleton instance
let errorBoundaryInstance: ErrorBoundaryManager | null = null;

export const getErrorBoundaryManager = (): ErrorBoundaryManager => {
  if (!errorBoundaryInstance) {
    errorBoundaryInstance = new ErrorBoundaryManager();
    // Register default strategies
    createDefaultRecoveryStrategies().forEach(strategy => {
      errorBoundaryInstance!.registerRecoveryStrategy(strategy);
    });
  }
  return errorBoundaryInstance;
};


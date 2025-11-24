// Advanced Error Recovery and Retry Mechanisms

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

interface RecoveryStrategy {
  name: string;
  canHandle: (error: Error) => boolean;
  recover: (error: Error, context: any) => Promise<any>;
}

export class ErrorRecovery {
  private strategies: RecoveryStrategy[] = [];

  /**
   * Register a recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Retry a function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2,
      onRetry,
      shouldRetry = () => true,
    } = options;

    let lastError: Error;
    let delay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !shouldRetry(lastError)) {
          throw lastError;
        }

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Exponential backoff
        await this.sleep(delay);
        delay *= backoffMultiplier;
      }
    }

    throw lastError!;
  }

  /**
   * Attempt to recover from an error
   */
  async recover<T>(error: Error, context: any): Promise<T | null> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          return await strategy.recover(error, context);
        } catch (recoveryError) {
          console.error(`[ErrorRecovery] Strategy ${strategy.name} failed:`, recoveryError);
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default recovery strategies
export const createDefaultStrategies = (): RecoveryStrategy[] => {
  return [
    {
      name: 'NetworkRetry',
      canHandle: (error: Error) => {
        return error.message.includes('network') || 
               error.message.includes('fetch') ||
               error.message.includes('timeout');
      },
      recover: async (error: Error, context: any) => {
        // Wait and retry network request
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (context.retryFn) {
          return await context.retryFn();
        }
        throw error;
      },
    },
    {
      name: 'MemoryCleanup',
      canHandle: (error: Error) => {
        return error.message.includes('memory') || 
               error.message.includes('allocation');
      },
      recover: async (error: Error, context: any) => {
        // Force garbage collection if available
        if ((globalThis as any).gc) {
          (globalThis as any).gc();
        }
        
        // Clear caches
        if (context.clearCache) {
          context.clearCache();
        }
        
        // Retry after cleanup
        if (context.retryFn) {
          return await context.retryFn();
        }
        throw error;
      },
    },
    {
      name: 'PDFRepair',
      canHandle: (error: Error) => {
        return error.message.includes('PDF') || 
               error.message.includes('corrupt') ||
               error.message.includes('invalid');
      },
      recover: async (error: Error, context: any) => {
        // Attempt to repair PDF
        if (context.repairFn) {
          return await context.repairFn();
        }
        throw error;
      },
    },
  ];
};

// Singleton instance
let recoveryInstance: ErrorRecovery | null = null;

export const getErrorRecovery = (): ErrorRecovery => {
  if (!recoveryInstance) {
    recoveryInstance = new ErrorRecovery();
    // Register default strategies
    createDefaultStrategies().forEach(strategy => {
      recoveryInstance!.registerStrategy(strategy);
    });
  }
  return recoveryInstance;
};


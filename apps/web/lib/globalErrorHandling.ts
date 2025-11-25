/**
 * Global Error Handling
 * System-wide error handling and recovery
 */

/**
 * Global error handler
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: event.error?.message || 'Unknown error',
        fatal: false,
      });
    }

    // Show user-friendly error message
    showErrorNotification('An error occurred. Please try again.');
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: event.reason?.message || 'Unhandled promise rejection',
        fatal: false,
      });
    }

    // Show user-friendly error message
    showErrorNotification('An error occurred. Please try again.');
  });
}

/**
 * Show error notification
 */
function showErrorNotification(message: string): void {
  // Create error notification element
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}

/**
 * Error boundary component
 */
export class GlobalErrorBoundary extends Error {
  constructor(message: string, public componentStack: string) {
    super(message);
    this.name = 'GlobalErrorBoundary';
  }
}

/**
 * Retry failed operations
 */
export function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let retries = 0;

    const attempt = () => {
      operation()
        .then(resolve)
        .catch((error) => {
          retries++;
          if (retries < maxRetries) {
            setTimeout(attempt, delay * retries);
          } else {
            reject(error);
          }
        });
    };

    attempt();
  });
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  onError?: (error: Error) => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Safe async operation failed:', error);
    if (onError) {
      onError(error as Error);
    }
    return fallback;
  }
}

/**
 * Error recovery strategies
 */
export const ErrorRecoveryStrategies = {
  /**
   * Retry with exponential backoff
   */
  exponentialBackoff: async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 5
  ): Promise<T> => {
    let retries = 0;
    let delay = 100;

    while (retries < maxRetries) {
      try {
        return await operation();
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }

    throw new Error('Max retries exceeded');
  },

  /**
   * Fallback to cached data
   */
  fallbackToCache: async <T>(
    operation: () => Promise<T>,
    getCached: () => T | null
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      const cached = getCached();
      if (cached) {
        return cached;
      }
      throw error;
    }
  },

  /**
   * Graceful degradation
   */
  gracefulDegradation: async <T>(
    operation: () => Promise<T>,
    fallback: T
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      console.warn('Operation failed, using fallback:', error);
      return fallback;
    }
  },
};

/**
 * Initialize global error handling
 */
export function initGlobalErrorHandling(): void {
  setupGlobalErrorHandling();
}


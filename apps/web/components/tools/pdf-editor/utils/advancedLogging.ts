// Advanced Logging and Debugging System
// Provides structured logging with levels, filters, and export

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

export interface LogFilter {
  level?: LogLevel;
  context?: Record<string, any>;
  message?: string | RegExp;
  timeRange?: { start: number; end: number };
}

export class AdvancedLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private level: LogLevel = 'info';
  private filters: LogFilter[] = [];
  private handlers: Map<string, (entry: LogEntry) => void> = new Map();
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Set user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'error',
      message,
      context: {
        ...context,
        error: error?.message,
        stack: error?.stack,
      },
      stack: error?.stack,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.addLog(entry);
    console.error(`[${entry.level.toUpperCase()}] ${message}`, error, context);
  }

  /**
   * Log fatal message
   */
  fatal(message: string, error?: Error | any, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: 'fatal',
      message,
      context: {
        ...context,
        error: error?.message,
        stack: error?.stack,
      },
      stack: error?.stack,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.addLog(entry);
    console.error(`[FATAL] ${message}`, error, context);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.addLog(entry);

    // Console output
    const consoleMethod = level === 'debug' ? 'log' : level === 'fatal' ? 'error' : level;
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || '');
  }

  /**
   * Check if should log
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  /**
   * Add log entry
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Limit log size
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Apply filters
    if (this.matchesFilters(entry)) {
      // Trigger handlers
      this.handlers.forEach(handler => handler(entry));
    }
  }

  /**
   * Check if entry matches filters
   */
  private matchesFilters(entry: LogEntry): boolean {
    if (this.filters.length === 0) return true;

    return this.filters.some(filter => {
      if (filter.level && entry.level !== filter.level) return false;
      if (filter.message) {
        if (typeof filter.message === 'string') {
          if (!entry.message.includes(filter.message)) return false;
        } else {
          if (!filter.message.test(entry.message)) return false;
        }
      }
      if (filter.context) {
        for (const [key, value] of Object.entries(filter.context)) {
          if (entry.context?.[key] !== value) return false;
        }
      }
      if (filter.timeRange) {
        if (entry.timestamp < filter.timeRange.start || entry.timestamp > filter.timeRange.end) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Add filter
   */
  addFilter(filter: LogFilter): () => void {
    this.filters.push(filter);
    
    // Return remove function
    return () => {
      const index = this.filters.indexOf(filter);
      if (index > -1) {
        this.filters.splice(index, 1);
      }
    };
  }

  /**
   * Register handler
   */
  onLog(handler: (entry: LogEntry) => void): () => void {
    const id = `handler-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.handlers.set(id, handler);

    // Return remove function
    return () => {
      this.handlers.delete(id);
    };
  }

  /**
   * Get logs
   */
  getLogs(filter?: LogFilter): LogEntry[] {
    if (!filter) return [...this.logs];

    const tempFilters = this.filters;
    this.filters = [filter];
    const filtered = this.logs.filter(entry => this.matchesFilters(entry));
    this.filters = tempFilters;

    return filtered;
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Export logs
   */
  export(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);
      case 'csv':
        const headers = ['timestamp', 'level', 'message', 'context', 'userId', 'sessionId'];
        const rows = this.logs.map(log => [
          new Date(log.timestamp).toISOString(),
          log.level,
          log.message,
          JSON.stringify(log.context || {}),
          log.userId || '',
          log.sessionId,
        ]);
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      case 'txt':
        return this.logs.map(log => 
          `[${new Date(log.timestamp).toISOString()}] [${log.level.toUpperCase()}] ${log.message} ${log.context ? JSON.stringify(log.context) : ''}`
        ).join('\n');
      default:
        return '';
    }
  }

  /**
   * Get log statistics
   */
  getStatistics(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    errors: number;
    warnings: number;
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
    };

    this.logs.forEach(log => {
      byLevel[log.level]++;
    });

    return {
      total: this.logs.length,
      byLevel,
      errors: byLevel.error + byLevel.fatal,
      warnings: byLevel.warn,
    };
  }
}

// Singleton instance
let loggerInstance: AdvancedLogger | null = null;

export const getAdvancedLogger = (): AdvancedLogger => {
  if (!loggerInstance) {
    loggerInstance = new AdvancedLogger();
  }
  return loggerInstance;
};

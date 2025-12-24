/**
 * Production-safe logger utility
 * 
 * In production: Only logs errors and warnings (no debug info)
 * In development: Logs everything for debugging
 * 
 * This prevents sensitive data leakage and improves performance in production.
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  /** Additional context data to log */
  data?: Record<string, unknown>;
  /** Whether to force log even in production (use sparingly) */
  force?: boolean;
}

class Logger {
  private prefix: string;

  constructor(prefix: string = 'QuickRoom8') {
    this.prefix = prefix;
  }

  /**
   * Create a scoped logger for a specific module
   */
  scope(module: string): Logger {
    return new Logger(`${this.prefix}:${module}`);
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, options?: LogOptions): void {
    if (isDevelopment || isDebugEnabled || options?.force) {
      console.debug(`[${this.prefix}] ${message}`, options?.data ?? '');
    }
  }

  /**
   * Info logs - only in development
   */
  info(message: string, options?: LogOptions): void {
    if (isDevelopment || isDebugEnabled || options?.force) {
      console.info(`[${this.prefix}] ${message}`, options?.data ?? '');
    }
  }

  /**
   * Warning logs - always logged but sanitized in production
   */
  warn(message: string, options?: LogOptions): void {
    if (isDevelopment) {
      console.warn(`[${this.prefix}] ${message}`, options?.data ?? '');
    } else {
      // In production, log without potentially sensitive data
      console.warn(`[${this.prefix}] ${message}`);
    }
  }

  /**
   * Error logs - always logged but sanitized in production
   */
  error(message: string, error?: unknown, options?: LogOptions): void {
    // Extract error message from various error formats
    const getErrorMessage = (err: unknown): string => {
      if (!err) return 'No error details';
      if (err instanceof Error) return err.message;
      if (typeof err === 'string') return err;
      if (typeof err === 'object') {
        const obj = err as Record<string, unknown>;
        return obj.message as string || 
               obj.error_description as string || 
               obj.error as string ||
               (Object.keys(obj).length === 0 ? 'Empty error object' : JSON.stringify(obj));
      }
      return String(err);
    };

    const errorMsg = getErrorMessage(error);

    if (isDevelopment) {
      console.error(`[${this.prefix}] ${message}:`, errorMsg, options?.data ?? '');
    } else {
      // In production, sanitize error details to prevent data leakage
      console.error(`[${this.prefix}] ${message}: ${errorMsg}`);
    }
  }

  /**
   * Performance measurement - only in development
   */
  time(label: string): void {
    if (isDevelopment || isDebugEnabled) {
      console.time(`[${this.prefix}] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (isDevelopment || isDebugEnabled) {
      console.timeEnd(`[${this.prefix}] ${label}`);
    }
  }

  /**
   * Group logs - only in development
   */
  group(label: string): void {
    if (isDevelopment || isDebugEnabled) {
      console.group(`[${this.prefix}] ${label}`);
    }
  }

  groupEnd(): void {
    if (isDevelopment || isDebugEnabled) {
      console.groupEnd();
    }
  }
}

// Default logger instance
export const logger = new Logger();

// Pre-scoped loggers for common modules
export const authLogger = logger.scope('Auth');
export const apiLogger = logger.scope('API');
export const securityLogger = logger.scope('Security');
export const performanceLogger = logger.scope('Performance');

export default logger;


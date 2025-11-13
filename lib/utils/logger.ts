/**
 * Logger utility for structured logging
 * Provides consistent logging across the application
 * Integrates with Sentry for error tracking in production
 */

import * as Sentry from '@sentry/nextjs';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);

    // Send warnings to Sentry in production
    if (!this.isDevelopment) {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: {
          custom: context || {},
        },
      });
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? {
          ...context,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : context;

    this.log(LogLevel.ERROR, message, errorContext);

    // Send to Sentry in production
    if (!this.isDevelopment && error) {
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
        tags: {
          logMessage: message,
        },
      });
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // In development, use console with colors
    if (this.isDevelopment) {
      this.logToConsole(entry);
    } else {
      // In production, log as JSON for structured logging
      console.log(JSON.stringify(entry));
    }
  }

  /**
   * Log to console with formatting (development only)
   */
  private logToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level];

    const prefix = `${color}[${entry.level.toUpperCase()}]${reset}`;
    const timestamp = `\x1b[90m${entry.timestamp}${reset}`;

    console.log(`${timestamp} ${prefix} ${entry.message}`);

    if (entry.context) {
      console.log('Context:', entry.context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const logDebug = (message: string, context?: LogContext) =>
  logger.debug(message, context);

export const logInfo = (message: string, context?: LogContext) =>
  logger.info(message, context);

export const logWarn = (message: string, context?: LogContext) =>
  logger.warn(message, context);

export const logError = (message: string, error?: Error, context?: LogContext) =>
  logger.error(message, error, context);

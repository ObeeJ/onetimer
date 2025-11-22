export enum LogLevel {
  _DEBUG = 'DEBUG',
  _INFO = 'INFO', 
  _WARN = 'WARN',
  _ERROR = 'ERROR',
}

export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  timestamp: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    message: string
    stack?: string
    code?: string
  }
}

class Logger {
  private isServer = typeof window === 'undefined'
  private isDevelopment = this.isServer
    ? process.env.NODE_ENV === 'development'
    : process.env.NEXT_PUBLIC_NODE_ENV === 'development'

  private logToBrowser(entry: LogEntry) {
    const colors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: 'color: #808080; font-weight: bold;',
      [LogLevel.INFO]: 'color: #0066cc; font-weight: bold;',
      [LogLevel.WARN]: 'color: #ff9900; font-weight: bold;',
      [LogLevel.ERROR]: 'color: #cc0000; font-weight: bold;',
    }

    const style = colors[entry.level]
    console.log(
      `%c[${entry.level}] ${entry.message}`,
      style,
      entry.context || ''
    )

    if (entry.error) {
      console.error(entry.error)
    }
  }

  private log(entry: LogEntry) {
    // Log to browser in development
    if (!this.isServer && this.isDevelopment) {
      this.logToBrowser(entry)
    }

    // Log to server console in development
    if (this.isServer && this.isDevelopment) {
      const prefix = `[${entry.level}]`
      const output = entry.error
        ? { message: entry.message, error: entry.error, context: entry.context }
        : { message: entry.message, context: entry.context }

      switch (entry.level) {
        case LogLevel.DEBUG:
          console.debug(prefix, output)
          break
        case LogLevel.INFO:
          console.info(prefix, output)
          break
        case LogLevel.WARN:
          console.warn(prefix, output)
          break
        case LogLevel.ERROR:
          console.error(prefix, output)
          break
      }
    }

    // In production, send errors to monitoring service
    if (entry.level === LogLevel.ERROR && !this.isDevelopment) {
      // TODO: Send to Sentry, DataDog, or other monitoring service
      // Example: Sentry.captureException(entry.error, { extra: entry.context })
      this.logToBrowser(entry) // Still show in console for debugging
    }
  }

  debug(message: string, context?: LogContext) {
    this.log({
      level: LogLevel.DEBUG,
      message,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  info(message: string, context?: LogContext) {
    this.log({
      level: LogLevel.INFO,
      message,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  warn(message: string, context?: LogContext) {
    this.log({
      level: LogLevel.WARN,
      message,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log({
      level: LogLevel.ERROR,
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
      context: { ...context, timestamp: new Date().toISOString() },
    })
  }

  logApiCall(method: string, endpoint: string, status: number, duration: number) {
    this.info('API Call', {
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    })
  }

  logUserAction(action: string, details?: Record<string, any>) {
    this.info('User Action', {
      action,
      ...details,
      timestamp: new Date().toISOString()
    })
  }
}

export const logger = new Logger()
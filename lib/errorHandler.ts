// Global error handling utilities

export interface ErrorReport {
  message: string;
  stack?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  timestamp: Date;
  userAgent: string;
  userId?: string;
  sessionId?: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupGlobalHandlers();
    this.setupNetworkHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupGlobalHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
      });
    });
  }

  private setupNetworkHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  handleError(error: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber,
      timestamp: error.timestamp || new Date(),
      userAgent: error.userAgent || navigator.userAgent,
      userId: error.userId,
      sessionId: error.sessionId || this.getSessionId(),
    };

    console.error('Error captured:', errorReport);

    if (this.isOnline) {
      this.sendErrorReport(errorReport);
    } else {
      this.queueError(errorReport);
    }
  }

  private queueError(error: ErrorReport) {
    this.errorQueue.push(error);
    
    // Store in localStorage as backup
    try {
      const storedErrors = JSON.parse(localStorage.getItem('errorQueue') || '[]');
      storedErrors.push(error);
      localStorage.setItem('errorQueue', JSON.stringify(storedErrors.slice(-10))); // Keep last 10 errors
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e);
    }
  }

  private async sendErrorReport(error: ErrorReport) {
    if (import.meta.env.DEV) {
      console.warn('Error report (dev mode):', error);
      return;
    }

    try {
      // In production, send to error reporting service
      // Replace with your actual error reporting service (Sentry, LogRocket, etc.)
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });

      if (!response.ok) {
        throw new Error(`Failed to send error report: ${response.status}`);
      }
    } catch (e) {
      console.warn('Failed to send error report:', e);
      this.queueError(error);
    }
  }

  private flushErrorQueue() {
    const errors = [...this.errorQueue];
    this.errorQueue = [];

    // Also get errors from localStorage
    try {
      const storedErrors = JSON.parse(localStorage.getItem('errorQueue') || '[]');
      errors.push(...storedErrors);
      localStorage.removeItem('errorQueue');
    } catch (e) {
      console.warn('Failed to retrieve stored errors:', e);
    }

    errors.forEach(error => this.sendErrorReport(error));
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Manual error reporting
  reportError(message: string, extra?: Record<string, any>) {
    this.handleError({
      message,
      stack: new Error().stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      ...extra,
    });
  }

  // Performance monitoring
  reportPerformance(metric: string, value: number, extra?: Record<string, any>) {
    if (import.meta.env.DEV) {
      console.log(`Performance metric - ${metric}:`, value, extra);
      return;
    }

    // In production, send to analytics service
    try {
      // Replace with your analytics service
      console.log('Performance metric:', { metric, value, ...extra });
    } catch (e) {
      console.warn('Failed to report performance metric:', e);
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const reportError = (message: string, extra?: Record<string, any>) => {
  errorHandler.reportError(message, extra);
};

export const reportPerformance = (metric: string, value: number, extra?: Record<string, any>) => {
  errorHandler.reportPerformance(metric, value, extra);
};

// React error boundary helper
export const logReactError = (error: Error, errorInfo: React.ErrorInfo) => {
  errorHandler.handleError({
    message: `React Error: ${error.message}`,
    stack: error.stack,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    sessionId: errorHandler['getSessionId'](),
  });
};

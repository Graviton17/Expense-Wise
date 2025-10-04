import { NextRequest } from "next/server";

export interface LogContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  companyId?: string;
  timestamp: string;
}

export interface LogData {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context: LogContext;
  data?: any;
  error?: Error;
  duration?: number;
}

// Generate correlation ID for request tracking
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract context from request
export function extractLogContext(
  request: NextRequest,
  requestId?: string
): LogContext {
  const context: LogContext = {
    requestId: requestId || generateRequestId(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent") || undefined,
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown",
    timestamp: new Date().toISOString(),
  };

  // Add user context if available
  const user = (request as any).user;
  if (user) {
    context.userId = user.userId;
    context.companyId = user.companyId;
  }

  return context;
}

// Structured logger
export class Logger {
  private context: Partial<LogContext>;

  constructor(context: Partial<LogContext> = {}) {
    this.context = context;
  }

  private log(data: LogData): void {
    const logEntry = {
      ...data,
      context: { ...this.context, ...data.context },
    };

    // In production, you might want to use a proper logging service
    // like Winston, Pino, or send to external services like Datadog, New Relic
    if (process.env.NODE_ENV === "production") {
      // Send to external logging service
      console.log(JSON.stringify(logEntry));
    } else {
      // Development logging
      const timestamp = new Date().toISOString();
      const level = data.level.toUpperCase();
      const requestId = logEntry.context.requestId;

      console.log(`[${timestamp}] ${level} [${requestId}] ${data.message}`);

      if (data.data) {
        console.log("Data:", data.data);
      }

      if (data.error) {
        console.error("Error:", data.error);
      }
    }
  }

  info(message: string, data?: any, context: Partial<LogContext> = {}): void {
    this.log({
      level: "info",
      message,
      context: {
        ...this.context,
        ...context,
        timestamp: new Date().toISOString(),
      } as LogContext,
      data,
    });
  }

  warn(message: string, data?: any, context: Partial<LogContext> = {}): void {
    this.log({
      level: "warn",
      message,
      context: {
        ...this.context,
        ...context,
        timestamp: new Date().toISOString(),
      } as LogContext,
      data,
    });
  }

  error(
    message: string,
    error?: Error,
    data?: any,
    context: Partial<LogContext> = {}
  ): void {
    this.log({
      level: "error",
      message,
      context: {
        ...this.context,
        ...context,
        timestamp: new Date().toISOString(),
      } as LogContext,
      error,
      data,
    });
  }

  debug(message: string, data?: any, context: Partial<LogContext> = {}): void {
    if (process.env.NODE_ENV === "development") {
      this.log({
        level: "debug",
        message,
        context: {
          ...this.context,
          ...context,
          timestamp: new Date().toISOString(),
        } as LogContext,
        data,
      });
    }
  }

  // Create child logger with additional context
  child(additionalContext: Partial<LogContext>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

// Request logging middleware
export function withRequestLogging(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const logContext = extractLogContext(request, requestId);

    const logger = new Logger(logContext);

    // Log incoming request
    logger.info("Incoming request", {
      body:
        request.method !== "GET"
          ? await request
              .clone()
              .text()
              .catch(() => "Unable to parse body")
          : undefined,
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    });

    try {
      // Add logger to request for use in handlers
      (request as any).logger = logger;
      (request as any).requestId = requestId;

      const response = await handler(request, context);

      const duration = Date.now() - startTime;

      // Log successful response
      logger.info(
        "Request completed",
        {
          status: response.status,
          duration: `${duration}ms`,
        },
        { duration }
      );

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error
      logger.error(
        "Request failed",
        error as Error,
        {
          duration: `${duration}ms`,
        },
        { duration }
      );

      throw error;
    }
  };
}

// Business logic logger
export class BusinessLogger extends Logger {
  logUserAction(action: string, userId: string, data?: any): void {
    this.info(`User action: ${action}`, data, { userId });
  }

  logExpenseEvent(
    event: string,
    expenseId: string,
    userId: string,
    data?: any
  ): void {
    this.info(`Expense ${event}`, { expenseId, ...data }, { userId });
  }

  logApprovalEvent(
    event: string,
    approvalId: string,
    expenseId: string,
    approverId: string,
    data?: any
  ): void {
    this.info(
      `Approval ${event}`,
      { approvalId, expenseId, ...data },
      { userId: approverId }
    );
  }

  logSecurityEvent(event: string, userId?: string, data?: any): void {
    this.warn(`Security event: ${event}`, data, { userId });
  }

  logSystemEvent(event: string, data?: any): void {
    this.info(`System event: ${event}`, data);
  }

  logDataAccess(
    resource: string,
    action: string,
    userId: string,
    resourceId?: string
  ): void {
    this.debug(
      `Data access: ${action} ${resource}`,
      { resourceId },
      { userId }
    );
  }

  logPerformanceMetric(operation: string, duration: number, data?: any): void {
    this.info(
      `Performance: ${operation}`,
      { duration: `${duration}ms`, ...data },
      { duration }
    );
  }
}

// Create default logger instances
export const logger = new Logger();
export const businessLogger = new BusinessLogger();

// Audit logging helpers
export const auditLog = {
  login: (userId: string, ip: string) =>
    businessLogger.logSecurityEvent("user_login", userId, { ip }),

  logout: (userId: string) =>
    businessLogger.logSecurityEvent("user_logout", userId),

  passwordChange: (userId: string) =>
    businessLogger.logSecurityEvent("password_change", userId),

  expenseCreated: (expenseId: string, userId: string, amount: number) =>
    businessLogger.logExpenseEvent("created", expenseId, userId, { amount }),

  expenseSubmitted: (expenseId: string, userId: string) =>
    businessLogger.logExpenseEvent("submitted", expenseId, userId),

  expenseApproved: (expenseId: string, approverId: string) =>
    businessLogger.logExpenseEvent("approved", expenseId, approverId),

  expenseRejected: (expenseId: string, approverId: string, reason: string) =>
    businessLogger.logExpenseEvent("rejected", expenseId, approverId, {
      reason,
    }),

  fileUploaded: (userId: string, fileName: string, fileSize: number) =>
    businessLogger.logUserAction("file_uploaded", userId, {
      fileName,
      fileSize,
    }),

  dataExport: (userId: string, type: string, filters: any) =>
    businessLogger.logUserAction("data_export", userId, { type, filters }),
};

// Example usage:
/*
import { withRequestLogging, businessLogger, auditLog } from '@/middleware/logger';

export const POST = withRequestLogging(async (request: NextRequest) => {
  const logger = (request as any).logger;
  
  logger.info('Processing expense creation');
  
  // Your business logic here
  
  auditLog.expenseCreated(expense.id, user.id, expense.amount);
  
  return NextResponse.json(expense);
});
*/

/**
 * Comprehensive error handling and logging utilities for approval endpoints
 * Provides consistent error responses, audit trail logging, and monitoring
 */

import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";

// Error types and codes
export const APPROVAL_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  EXPENSE_NOT_FOUND: "EXPENSE_NOT_FOUND",
  APPROVAL_NOT_FOUND: "APPROVAL_NOT_FOUND",
  RULE_NOT_FOUND: "RULE_NOT_FOUND",

  // Business logic errors
  ALREADY_PROCESSED: "ALREADY_PROCESSED",
  APPROVAL_DENIED: "APPROVAL_DENIED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  RULE_VALIDATION_FAILED: "RULE_VALIDATION_FAILED",

  // System errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const;

export type ApprovalErrorCode =
  (typeof APPROVAL_ERROR_CODES)[keyof typeof APPROVAL_ERROR_CODES];

// Error response interface
interface ApprovalError {
  code: ApprovalErrorCode;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  traceId?: string;
}

// Audit event types
export const AUDIT_EVENT_TYPES = {
  APPROVAL_REQUESTED: "APPROVAL_REQUESTED",
  EXPENSE_APPROVED: "EXPENSE_APPROVED",
  EXPENSE_REJECTED: "EXPENSE_REJECTED",
  RULE_CREATED: "RULE_CREATED",
  RULE_UPDATED: "RULE_UPDATED",
  RULE_DELETED: "RULE_DELETED",
  ACCESS_DENIED: "ACCESS_DENIED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
} as const;

export type AuditEventType =
  (typeof AUDIT_EVENT_TYPES)[keyof typeof AUDIT_EVENT_TYPES];

// Audit log entry interface
interface AuditLogEntry {
  eventType: AuditEventType;
  userId: string;
  companyId: string;
  resourceId: string;
  resourceType: "expense" | "approval" | "rule";
  action: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Error Handler Class
 */
export class ApprovalErrorHandler {
  /**
   * Create standardized error response
   */
  static createErrorResponse<T = never>(
    error: ApprovalError,
    statusCode: number = 500
  ): NextResponse<ApiResponse<T>> {
    const errorResponse: ApiResponse<T> = {
      success: false,
      message: error.message,
    };

    // Log error for monitoring
    console.error(`[APPROVAL_ERROR] ${error.code}: ${error.message}`, {
      details: error.details,
      statusCode,
      timestamp: new Date().toISOString(),
      code: error.code,
    });

    return NextResponse.json(errorResponse, { status: statusCode });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    errors: string[],
    details?: Record<string, unknown>
  ): NextResponse<ApiResponse<never>> {
    return this.createErrorResponse(
      {
        code: APPROVAL_ERROR_CODES.VALIDATION_ERROR,
        message: "Request validation failed",
        details: {
          validationErrors: errors,
          ...details,
        },
      },
      400
    );
  }

  /**
   * Handle authorization errors
   */
  static handleAuthorizationError(
    message: string = "Access denied",
    details?: Record<string, unknown>
  ): NextResponse<ApiResponse<never>> {
    return this.createErrorResponse(
      {
        code: APPROVAL_ERROR_CODES.FORBIDDEN,
        message,
        details,
      },
      403
    );
  }

  /**
   * Handle not found errors
   */
  static handleNotFoundError(
    resourceType: string,
    resourceId?: string
  ): NextResponse<ApiResponse<never>> {
    return this.createErrorResponse(
      {
        code: APPROVAL_ERROR_CODES.NOT_FOUND,
        message: `${resourceType} not found`,
        details: { resourceType, resourceId },
      },
      404
    );
  }

  /**
   * Handle business logic errors
   */
  static handleBusinessError(
    code: ApprovalErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): NextResponse<ApiResponse<never>> {
    const statusCode = this.getStatusCodeForError(code);

    return this.createErrorResponse(
      {
        code,
        message,
        details,
      },
      statusCode
    );
  }

  /**
   * Handle unexpected errors
   */
  static handleUnexpectedError(
    error: unknown,
    context?: Record<string, unknown>
  ): NextResponse<ApiResponse<never>> {
    console.error("[UNEXPECTED_ERROR]", error, context);

    return this.createErrorResponse(
      {
        code: APPROVAL_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: "An unexpected error occurred",
        details: {
          context,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      500
    );
  }

  /**
   * Get appropriate HTTP status code for error
   */
  private static getStatusCodeForError(code: ApprovalErrorCode): number {
    switch (code) {
      case APPROVAL_ERROR_CODES.UNAUTHORIZED:
      case APPROVAL_ERROR_CODES.INVALID_TOKEN:
        return 401;

      case APPROVAL_ERROR_CODES.FORBIDDEN:
      case APPROVAL_ERROR_CODES.INSUFFICIENT_PERMISSIONS:
      case APPROVAL_ERROR_CODES.APPROVAL_DENIED:
        return 403;

      case APPROVAL_ERROR_CODES.NOT_FOUND:
      case APPROVAL_ERROR_CODES.EXPENSE_NOT_FOUND:
      case APPROVAL_ERROR_CODES.APPROVAL_NOT_FOUND:
      case APPROVAL_ERROR_CODES.RULE_NOT_FOUND:
        return 404;

      case APPROVAL_ERROR_CODES.ALREADY_PROCESSED:
      case APPROVAL_ERROR_CODES.RULE_VALIDATION_FAILED:
        return 409;

      case APPROVAL_ERROR_CODES.VALIDATION_ERROR:
      case APPROVAL_ERROR_CODES.INVALID_INPUT:
      case APPROVAL_ERROR_CODES.MISSING_REQUIRED_FIELD:
        return 400;

      case APPROVAL_ERROR_CODES.SERVICE_UNAVAILABLE:
        return 503;

      default:
        return 500;
    }
  }
}

/**
 * Audit Logger Class
 */
export class ApprovalAuditLogger {
  /**
   * Log audit event
   */
  static async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      // Log to console (in production, this would go to a proper audit log system)
      console.log(`[AUDIT_LOG] ${entry.eventType}`, {
        userId: entry.userId,
        companyId: entry.companyId,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        action: entry.action,
        timestamp: entry.timestamp,
        metadata: entry.metadata,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      });

      // TODO: In production, store in dedicated audit table
      // await prisma.auditLog.create({ data: entry });
    } catch (error) {
      console.error("[AUDIT_LOG_ERROR] Failed to log audit event:", error);
    }
  }

  /**
   * Log approval request
   */
  static async logApprovalRequest(
    userId: string,
    companyId: string,
    expenseId: string,
    approvalId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.APPROVAL_REQUESTED,
      userId,
      companyId,
      resourceId: approvalId,
      resourceType: "approval",
      action: "created",
      metadata: {
        expenseId,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log expense approval
   */
  static async logExpenseApproval(
    userId: string,
    companyId: string,
    expenseId: string,
    approvalId: string,
    comment?: string
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.EXPENSE_APPROVED,
      userId,
      companyId,
      resourceId: expenseId,
      resourceType: "expense",
      action: "approved",
      metadata: {
        approvalId,
        comment,
        approvedBy: userId,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log expense rejection
   */
  static async logExpenseRejection(
    userId: string,
    companyId: string,
    expenseId: string,
    approvalId: string,
    reason: string,
    comment: string
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.EXPENSE_REJECTED,
      userId,
      companyId,
      resourceId: expenseId,
      resourceType: "expense",
      action: "rejected",
      metadata: {
        approvalId,
        reason,
        comment,
        rejectedBy: userId,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log approval rule creation
   */
  static async logRuleCreation(
    userId: string,
    companyId: string,
    ruleId: string,
    ruleName: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.RULE_CREATED,
      userId,
      companyId,
      resourceId: ruleId,
      resourceType: "rule",
      action: "created",
      metadata: {
        ruleName,
        createdBy: userId,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log approval rule update
   */
  static async logRuleUpdate(
    userId: string,
    companyId: string,
    ruleId: string,
    changes: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.RULE_UPDATED,
      userId,
      companyId,
      resourceId: ruleId,
      resourceType: "rule",
      action: "updated",
      metadata: {
        changes,
        updatedBy: userId,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log approval rule deletion
   */
  static async logRuleDeletion(
    userId: string,
    companyId: string,
    ruleId: string,
    ruleName: string
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.RULE_DELETED,
      userId,
      companyId,
      resourceId: ruleId,
      resourceType: "rule",
      action: "deleted",
      metadata: {
        ruleName,
        deletedBy: userId,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log access denied
   */
  static async logAccessDenied(
    userId: string,
    companyId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    reason?: string
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.ACCESS_DENIED,
      userId,
      companyId,
      resourceId,
      resourceType: resourceType as "expense" | "approval" | "rule",
      action,
      metadata: {
        reason,
        deniedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log validation failure
   */
  static async logValidationFailure(
    userId: string,
    companyId: string,
    endpoint: string,
    errors: string[],
    requestData?: Record<string, unknown>
  ): Promise<void> {
    await this.logEvent({
      eventType: AUDIT_EVENT_TYPES.VALIDATION_FAILED,
      userId,
      companyId,
      resourceId: endpoint,
      resourceType: "approval",
      action: "validation_failed",
      metadata: {
        endpoint,
        validationErrors: errors,
        requestData,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Performance Monitor Class
 */
export class ApprovalPerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  /**
   * Track operation duration
   */
  static trackOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();

    return operation().finally(() => {
      const duration = Date.now() - startTime;
      this.recordMetric(operationName, duration);
    });
  }

  /**
   * Record performance metric
   */
  private static recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(duration);

    // Keep only last 100 measurements
    if (operationMetrics.length > 100) {
      operationMetrics.shift();
    }

    // Log slow operations (> 5 seconds)
    if (duration > 5000) {
      console.warn(`[SLOW_OPERATION] ${operation} took ${duration}ms`);
    }
  }

  /**
   * Get performance statistics
   */
  static getStats(operation: string): {
    count: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const count = metrics.length;
    const sum = metrics.reduce((a, b) => a + b, 0);
    const average = sum / count;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return { count, average, min, max };
  }
}

/**
 * Helper functions for common error scenarios
 */
export const ApprovalErrors = {
  unauthorized: () =>
    ApprovalErrorHandler.handleAuthorizationError("Authentication required"),

  forbidden: (message?: string) =>
    ApprovalErrorHandler.handleAuthorizationError(message),

  expenseNotFound: (expenseId?: string) =>
    ApprovalErrorHandler.handleNotFoundError("Expense", expenseId),

  approvalNotFound: (approvalId?: string) =>
    ApprovalErrorHandler.handleNotFoundError("Approval", approvalId),

  ruleNotFound: (ruleId?: string) =>
    ApprovalErrorHandler.handleNotFoundError("Approval Rule", ruleId),

  alreadyProcessed: (status: string) =>
    ApprovalErrorHandler.handleBusinessError(
      APPROVAL_ERROR_CODES.ALREADY_PROCESSED,
      `Approval has already been ${status.toLowerCase()}`,
      { currentStatus: status }
    ),

  validationFailed: (errors: string[]) =>
    ApprovalErrorHandler.handleValidationError(errors),

  unexpected: (error: unknown, context?: Record<string, unknown>) =>
    ApprovalErrorHandler.handleUnexpectedError(error, context),
};

import { NextRequest, NextResponse } from "next/server";

export interface AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
}

// Custom error classes
export class ValidationError extends Error implements AppError {
  statusCode = 400;
  code = "VALIDATION_ERROR";
  isOperational = true;

  constructor(message: string, public details?: any) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error implements AppError {
  statusCode = 401;
  code = "AUTHENTICATION_ERROR";
  isOperational = true;

  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error implements AppError {
  statusCode = 403;
  code = "AUTHORIZATION_ERROR";
  isOperational = true;

  constructor(message: string = "Insufficient permissions") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  code = "NOT_FOUND";
  isOperational = true;

  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error implements AppError {
  statusCode = 409;
  code = "CONFLICT";
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class BusinessLogicError extends Error implements AppError {
  statusCode = 422;
  code = "BUSINESS_LOGIC_ERROR";
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "BusinessLogicError";
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429;
  code = "RATE_LIMIT_EXCEEDED";
  isOperational = true;

  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class InternalServerError extends Error implements AppError {
  statusCode = 500;
  code = "INTERNAL_SERVER_ERROR";
  isOperational = false;

  constructor(message: string = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }
}

// Error response formatter
export function formatErrorResponse(error: Error | AppError) {
  const isAppError = "statusCode" in error && "code" in error;

  const response = {
    error: {
      message: error.message,
      code: isAppError ? (error as AppError).code : "UNKNOWN_ERROR",
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        details: "details" in error ? (error as any).details : undefined,
      }),
    },
    timestamp: new Date().toISOString(),
  };

  const statusCode = isAppError ? (error as AppError).statusCode : 500;

  return NextResponse.json(response, { status: statusCode });
}

// Global error handler wrapper
export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("API Error:", error);

      // Handle Prisma errors
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        const prismaError = error as any;

        switch (prismaError.code) {
          case "P2002":
            return formatErrorResponse(
              new ConflictError("Resource already exists")
            );
          case "P2025":
            return formatErrorResponse(new NotFoundError("Resource not found"));
          default:
            return formatErrorResponse(
              new InternalServerError("Database operation failed")
            );
        }
      }

      // Handle validation errors
      if (error instanceof Error && error.name === "ZodError") {
        return formatErrorResponse(
          new ValidationError("Validation failed", error)
        );
      }

      // Handle known application errors
      if ("statusCode" in error && "code" in error) {
        return formatErrorResponse(error as AppError);
      }

      // Handle unknown errors
      return formatErrorResponse(new InternalServerError());
    }
  };
}

// Async error wrapper for individual functions
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error; // Re-throw to be caught by withErrorHandler
    }
  };
}

// HTTP status code constants
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error factory functions
export const createError = {
  validation: (message: string, details?: any) =>
    new ValidationError(message, details),
  authentication: (message?: string) => new AuthenticationError(message),
  authorization: (message?: string) => new AuthorizationError(message),
  notFound: (message?: string) => new NotFoundError(message),
  conflict: (message: string) => new ConflictError(message),
  businessLogic: (message: string) => new BusinessLogicError(message),
  rateLimit: (message?: string) => new RateLimitError(message),
  internal: (message?: string) => new InternalServerError(message),
};

// Example usage:
/*
import { withErrorHandler, createError } from '@/middleware/error-handler';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await getUserById(id);
  
  if (!user) {
    throw createError.notFound('User not found');
  }
  
  return NextResponse.json(user);
});
*/

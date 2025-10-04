import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessToken,
  extractTokenFromHeader,
  isTokenBlacklisted,
  JWTPayload,
} from "@/lib/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// Authentication middleware
export async function authenticateUser(
  request: NextRequest
): Promise<{ success: boolean; user?: JWTPayload; error?: string }> {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return { success: false, error: "Authorization token required" };
    }

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return { success: false, error: "Token has been revoked" };
    }

    // Verify and decode token
    const user = verifyAccessToken(token);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Invalid or expired token" };
  }
}

// Create authenticated response helper
export function createAuthResponse(
  message: string,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code: "AUTHENTICATION_REQUIRED",
    },
    { status }
  );
}

// Authorization helpers
export function hasRole(user: JWTPayload, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role);
}

export function isAdminOrManager(user: JWTPayload): boolean {
  return ["ADMIN", "MANAGER"].includes(user.role);
}

export function isAdmin(user: JWTPayload): boolean {
  return user.role === "ADMIN";
}

export function isSameCompany(user: JWTPayload, companyId: string): boolean {
  return user.companyId === companyId;
}

export function isSameUser(user: JWTPayload, userId: string): boolean {
  return user.userId === userId;
}

// Check if user can access resource
export function canAccessUser(
  currentUser: JWTPayload,
  targetUserId: string,
  targetUserCompanyId?: string
): boolean {
  // User can access their own profile
  if (currentUser.userId === targetUserId) {
    return true;
  }

  // Admin can access any user in their company
  if (
    currentUser.role === "ADMIN" &&
    currentUser.companyId === targetUserCompanyId
  ) {
    return true;
  }

  return false;
}

export function canAccessExpense(
  currentUser: JWTPayload,
  expenseUserId: string,
  expenseCompanyId: string
): boolean {
  // User can access their own expenses
  if (currentUser.userId === expenseUserId) {
    return true;
  }

  // Admin/Manager can access expenses in their company
  if (
    isAdminOrManager(currentUser) &&
    currentUser.companyId === expenseCompanyId
  ) {
    return true;
  }

  return false;
}

// Middleware wrapper for API routes
export function withAuth(
  handler: Function,
  options: { roles?: string[] } = {}
) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await authenticateUser(request);

    if (!authResult.success || !authResult.user) {
      return createAuthResponse(authResult.error || "Authentication failed");
    }

    // Check role-based authorization
    if (options.roles && !hasRole(authResult.user, options.roles)) {
      return NextResponse.json(
        {
          error: "Insufficient permissions",
          code: "AUTHORIZATION_FAILED",
        },
        { status: 403 }
      );
    }

    // Add user to request object
    (request as AuthenticatedRequest).user = authResult.user;

    return handler(request, context);
  };
}

// Specific role middlewares
export const withAdminAuth = (handler: Function) =>
  withAuth(handler, { roles: ["ADMIN"] });
export const withManagerAuth = (handler: Function) =>
  withAuth(handler, { roles: ["ADMIN", "MANAGER"] });
export const withEmployeeAuth = (handler: Function) =>
  withAuth(handler, { roles: ["ADMIN", "MANAGER", "EMPLOYEE"] });

// Example usage in API routes:
/*
export const GET = withAuth(async (request: NextRequest) => {
  const user = (request as AuthenticatedRequest).user;
  // Your authenticated route logic here
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  // Only admin can access this route
});
*/

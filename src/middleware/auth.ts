import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  extractTokenFromHeader,
  isTokenBlacklisted,
  AccessTokenPayload,
} from "@/lib/jwt";

export interface AuthenticatedRequest extends NextRequest {
  user?: AccessTokenPayload;
}

// Authentication middleware
export async function authenticateUser(
  request: NextRequest
): Promise<{ success: boolean; user?: AccessTokenPayload; error?: string }> {
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
    const decoded = verifyToken(token) as AccessTokenPayload;

    // Ensure it's an access token, not a refresh token
    if ("type" in decoded && decoded.type === "refresh") {
      return { success: false, error: "Access token required" };
    }

    return { success: true, user: decoded };
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
export function hasRole(
  user: AccessTokenPayload,
  requiredRoles: string[]
): boolean {
  return requiredRoles.includes(user.role);
}

export function isAdminOrManager(user: AccessTokenPayload): boolean {
  return ["ADMIN", "MANAGER"].includes(user.role);
}

export function isAdmin(user: AccessTokenPayload): boolean {
  return user.role === "ADMIN";
}

export function isSameCompany(
  user: AccessTokenPayload,
  companyId: string
): boolean {
  return user.companyId === companyId;
}

export function isSameUser(user: AccessTokenPayload, userId: string): boolean {
  return user.sub === userId;
}

// Check if user can access resource
export function canAccessUser(
  currentUser: AccessTokenPayload,
  targetUserId: string,
  targetUserCompanyId?: string
): boolean {
  // User can access their own profile
  if (currentUser.sub === targetUserId) {
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
  currentUser: AccessTokenPayload,
  expenseUserId: string,
  expenseCompanyId: string
): boolean {
  // User can access their own expenses
  if (currentUser.sub === expenseUserId) {
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

// Check if user has specific permission
export function hasPermission(
  user: AccessTokenPayload,
  permission: string
): boolean {
  // Admin has all permissions
  if (user.permissions.includes("*")) {
    return true;
  }

  return user.permissions.includes(permission);
}

// Middleware wrapper for API routes
export function withAuth(
  handler: (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => Promise<NextResponse>,
  options: { roles?: string[]; permissions?: string[] } = {}
) {
  return async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    const authResult = await authenticateUser(request);

    if (!authResult.success || !authResult.user) {
      return createAuthResponse(authResult.error || "Authentication failed");
    }

    // Check role-based authorization
    if (options.roles && !hasRole(authResult.user, options.roles)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHORIZATION_ERROR",
            message: "Insufficient permissions",
          },
        },
        { status: 403 }
      );
    }

    // Check permission-based authorization
    if (options.permissions) {
      const hasRequiredPermissions = options.permissions.every((permission) =>
        hasPermission(authResult.user!, permission)
      );

      if (!hasRequiredPermissions) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Insufficient permissions",
            },
          },
          { status: 403 }
        );
      }
    }

    // Add user to request object
    (request as AuthenticatedRequest).user = authResult.user;

    return handler(request, context);
  };
}

// Specific role middlewares
type AuthHandler = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse>;

export const withAdminAuth = (handler: AuthHandler) =>
  withAuth(handler, { roles: ["ADMIN"] });
export const withManagerAuth = (handler: AuthHandler) =>
  withAuth(handler, { roles: ["ADMIN", "MANAGER"] });
export const withEmployeeAuth = (handler: AuthHandler) =>
  withAuth(handler, { roles: ["ADMIN", "MANAGER", "EMPLOYEE"] });

// Permission-based middlewares
export const withPermission = (handler: AuthHandler, permissions: string[]) =>
  withAuth(handler, { permissions });

// Example usage in API routes:
/*
export const GET = withAuth(async (request: NextRequest) => {
  const user = (request as AuthenticatedRequest).user;
  // Your authenticated route logic here
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  // Only admin can access this route
});

export const PUT = withPermission(async (request: NextRequest) => {
  // Only users with specific permissions can access this route
}, ['expense:update:own']);
*/

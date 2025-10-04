import { NextRequest, NextResponse } from "next/server";
import {
  extractTokenFromHeader,
  blacklistToken,
  removeRefreshToken,
  verifyToken,
  AccessTokenPayload,
} from "@/lib/jwt";
import { logoutSchema, validateInput } from "@/lib/validations/auth";

/**
 * User Logout
 * POST /api/auth/logout
 *
 * Invalidates a user's session by revoking their refresh token.
 * Based on API specification in docs/backend/01-api-specifications.md
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(logoutSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validation.errors,
          },
        },
        { status: 400 }
      );
    }

    const { refreshToken } = validation.data!;

    // Extract access token from Authorization header
    const authHeader = request.headers.get("authorization");
    const accessToken = extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Authorization header required",
          },
        },
        { status: 401 }
      );
    }

    // Verify access token to get user ID
    let userId: string;
    try {
      const decoded = verifyToken(accessToken) as AccessTokenPayload;
      userId = decoded.sub;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Invalid access token",
          },
        },
        { status: 401 }
      );
    }

    // Blacklist both access and refresh tokens
    await Promise.all([
      blacklistToken(accessToken),
      blacklistToken(refreshToken),
      removeRefreshToken(userId),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully logged out",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Logout failed",
        },
      },
      { status: 500 }
    );
  }
}

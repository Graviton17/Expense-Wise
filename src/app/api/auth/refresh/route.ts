import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyToken,
  generateAccessToken,
  validateRefreshToken,
  User,
  RefreshTokenPayload,
  isTokenBlacklisted,
} from "@/lib/jwt";
import { refreshTokenSchema, validateInput } from "@/lib/validations/auth";

/**
 * Refresh Access Token
 * POST /api/auth/refresh
 *
 * Issues a new access token using a valid refresh token.
 * Based on API specification in docs/backend/01-api-specifications.md
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(refreshTokenSchema, body);
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

    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(refreshToken);
    if (isBlacklisted) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Refresh token has been revoked",
          },
        },
        { status: 401 }
      );
    }

    // Verify and decode refresh token
    let decoded: RefreshTokenPayload;
    try {
      const tokenData = verifyToken(refreshToken) as RefreshTokenPayload;

      // Ensure it's a refresh token
      if (!("type" in tokenData) || tokenData.type !== "refresh") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TOKEN",
              message: "Invalid token type",
            },
          },
          { status: 401 }
        );
      }

      decoded = tokenData;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired refresh token",
          },
        },
        { status: 401 }
      );
    }

    // Validate refresh token against stored token in Redis
    const isValidRefreshToken = await validateRefreshToken(
      decoded.sub,
      refreshToken
    );
    if (!isValidRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Refresh token not found or expired",
          },
        },
        { status: 401 }
      );
    }

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 401 }
      );
    }

    // Generate new access token
    const userForToken: User = {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "MANAGER" | "EMPLOYEE",
      companyId: user.companyId,
    };

    const newAccessToken = generateAccessToken(userForToken);

    // Prepare response data
    const responseData = {
      accessToken: newAccessToken,
      expiresIn: 3600, // 1 hour in seconds
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token refresh error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Token refresh failed",
        },
      },
      { status: 500 }
    );
  }
}

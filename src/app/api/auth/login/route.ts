import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { generateTokenPair, User, storeRefreshToken } from "@/lib/jwt";
import { loginSchema, validateInput } from "@/lib/validations/auth";

/**
 * User Login
 * POST /api/auth/login
 *
 * Authenticates a user and provides access and refresh tokens.
 * Based on API specification in docs/backend/01-api-specifications.md
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(loginSchema, body);
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

    const { email, password } = validation.data!;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            baseCurrency: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Check if user account is active (you can add status field to User model later)
    // For now, we assume all users are active

    // Generate JWT tokens
    const userForToken: User = {
      id: user.id,
      email: user.email,
      role: user.role as "ADMIN" | "MANAGER" | "EMPLOYEE",
      companyId: user.companyId,
    };

    const tokens = generateTokenPair(userForToken);

    // Store refresh token in Redis
    await storeRefreshToken(user.id, tokens.refreshToken);

    // Extract first and last name from the stored name field
    const nameParts = user.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
        companyId: user.companyId,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Login failed",
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";
import crypto from "crypto";
import { forgotPasswordSchema, validateInput } from "@/lib/validations/auth";

/**
 * Password Reset Request
 * POST /api/auth/forgot-password
 *
 * Initiates a password reset flow by sending a reset email.
 * Based on API specification in docs/backend/01-api-specifications.md
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(forgotPasswordSchema, body);
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

    const { email } = validation.data!;

    // Find user by email (case insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Always return success message to prevent email enumeration
    // But only process reset if user exists
    if (user) {
      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = 15 * 60; // 15 minutes in seconds

      // Store reset token in Redis with expiry
      const redis = await getRedisClient();
      await redis.setEx(
        `password_reset:${resetToken}`,
        resetTokenExpiry,
        user.id
      );

      // TODO: Send password reset email
      // In a real application, you would send an email here
      // For now, we'll just log the reset token (NEVER do this in production)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(
        `Reset URL: ${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/reset-password?token=${resetToken}`
      );

      // In production, you would:
      // await sendPasswordResetEmail(user.email, user.name, resetToken);
    }

    // Always return the same response to prevent email enumeration attacks
    return NextResponse.json(
      {
        success: true,
        message: "Password reset email sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Password reset request failed",
        },
      },
      { status: 500 }
    );
  }
}

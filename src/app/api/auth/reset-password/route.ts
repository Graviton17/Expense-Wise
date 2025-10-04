import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getRedisClient } from "@/lib/redis";
import { resetPasswordSchema, validateInput } from "@/lib/validations/auth";

/**
 * Password Reset Confirmation
 * POST /api/auth/reset-password
 *
 * Completes the password reset using the reset token.
 * Based on API specification in docs/backend/01-api-specifications.md
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(resetPasswordSchema, body);
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

    const { token, newPassword } = validation.data!;

    // Get user ID from Redis using reset token
    const redis = await getRedisClient();
    const userId = await redis.get(`password_reset:${token}`);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid or expired reset token",
          },
        },
        { status: 400 }
      );
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
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
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password in database and delete reset token in a transaction
    await prisma.$transaction(async (tx) => {
      // Update password
      await tx.user.update({
        where: { id: userId },
        data: { password: passwordHash },
      });
    });

    // Delete reset token from Redis
    await redis.del(`password_reset:${token}`);

    // TODO: Send password changed confirmation email
    // In a real application, you would send a confirmation email here
    console.log(`Password successfully reset for user: ${user.email}`);

    // In production, you would:
    // await sendPasswordChangedEmail(user.email, user.name);

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Password reset failed",
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 *
 * Request Body:
 * {
 *   email: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // TODO: Implement forgot password logic
    // - Find user by email
    // - Generate password reset token
    // - Store token in Redis with expiry (15 mins)
    // - Send password reset email
    // - Return success message (don't reveal if email exists)

    return NextResponse.json(
      {
        message: "If the email exists, a password reset link has been sent",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Password reset request failed" },
      { status: 500 }
    );
  }
}

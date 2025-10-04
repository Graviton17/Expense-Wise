import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual authentication logic with Prisma
    // For now, return a mock success response based on email
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock authentication - determine role based on email
    let role = "EMPLOYEE";
    if (email.includes("admin")) {
      role = "ADMIN";
    } else if (email.includes("manager")) {
      role = "MANAGER";
    }

    // Mock response
    return NextResponse.json(
      {
        message: "Sign in successful",
        user: {
          id: "mock-user-id",
          name: email.split("@")[0],
          email: email,
          role: role,
        },
        token: "mock-jwt-token",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

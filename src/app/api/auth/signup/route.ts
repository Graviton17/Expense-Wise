import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminName, email, companyName, country, password } = body;

    // Validate required fields
    if (!adminName || !email || !companyName || !country || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // TODO: Implement actual signup logic with Prisma
    // For now, return a mock success response
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response
    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: "mock-user-id",
          name: adminName,
          email: email,
          role: "ADMIN",
        },
        company: {
          id: "mock-company-id",
          name: companyName,
          country: country,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

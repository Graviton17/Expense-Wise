import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement actual signout logic (clear session, invalidate token)
    
    return NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

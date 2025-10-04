import { NextRequest, NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Health check failed" }, { status: 503 });
  }
}

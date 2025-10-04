import { NextRequest, NextResponse } from "next/server";

/**
 * Get All Expenses
 * GET /api/expenses?page=1&limit=20&status=PENDING_APPROVAL&userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    // TODO: Implement get expenses logic
    // - Verify authentication
    // - Filter by user role (employees see own, managers see team, admins see all)
    // - Apply filters (status, userId, date range)
    // - Apply pagination
    // - Return expenses list

    return NextResponse.json(
      {
        message: "Get expenses - To be implemented",
        data: [],
        pagination: { page, limit, total: 0 },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

/**
 * Create Expense
 * POST /api/expenses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Implement create expense logic
    // - Verify authentication
    // - Validate input (amount > 0, date not in future)
    // - Create expense in database with DRAFT status
    // - Return created expense

    return NextResponse.json(
      {
        message: "Create expense - To be implemented",
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}

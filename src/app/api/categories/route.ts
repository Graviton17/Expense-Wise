import { NextRequest, NextResponse } from "next/server";

/**
 * Get Expense Categories
 * GET /api/categories
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement get categories logic
    // - Verify authentication
    // - Fetch categories for user's company
    // - Return categories list

    return NextResponse.json(
      {
        message: "Get expense categories - To be implemented",
        data: [],
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * Create Expense Category (Admin only)
 * POST /api/categories
 *
 * Request Body:
 * {
 *   name: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // TODO: Implement create category logic
    // - Verify authentication
    // - Check ADMIN role
    // - Validate category name is unique for company
    // - Create category in database
    // - Return created category

    return NextResponse.json(
      {
        message: "Create expense category - To be implemented",
        data: { name },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

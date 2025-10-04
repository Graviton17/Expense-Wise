import { NextRequest, NextResponse } from "next/server";

/**
 * Get Webhooks
 * GET /api/webhooks
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement get webhooks logic
    // - Verify authentication
    // - Check ADMIN role
    // - Fetch webhooks for company
    // - Return webhooks list

    return NextResponse.json(
      {
        message: "Get webhooks - To be implemented",
        data: [],
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

/**
 * Create Webhook (Admin only)
 * POST /api/webhooks
 *
 * Request Body:
 * {
 *   url: string;
 *   events: string[]; // ['expense.submitted', 'expense.approved', etc.]
 *   secret: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, events, secret } = body;

    // TODO: Implement create webhook logic
    // - Verify authentication
    // - Check ADMIN role
    // - Validate webhook URL
    // - Validate events
    // - Create webhook in database
    // - Return created webhook

    return NextResponse.json(
      {
        message: "Create webhook - To be implemented",
        data: { url, events },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}

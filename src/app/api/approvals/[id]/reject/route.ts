import { NextRequest, NextResponse } from "next/server";

/**
 * Reject Expense
 * POST /api/approvals/:id/reject
 *
 * Request Body:
 * {
 *   comment: string; (required)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { comment } = body;

    // TODO: Implement reject expense logic
    // - Verify authentication
    // - Check user is the assigned approver
    // - Verify approval is in PENDING status
    // - Validate comment is provided (required for rejection)
    // - Update approval status to REJECTED
    // - Set approvedAt timestamp
    // - Add comment
    // - Update expense status to REJECTED
    // - Send notification to expense owner with rejection reason
    // - Return updated approval

    return NextResponse.json(
      {
        message: "Reject expense - To be implemented",
        data: { id, comment },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reject expense" },
      { status: 500 }
    );
  }
}

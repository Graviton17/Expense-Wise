import { NextRequest, NextResponse } from "next/server";

/**
 * Approve Expense
 * POST /api/approvals/:id/approve
 *
 * Request Body:
 * {
 *   comment?: string;
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

    // TODO: Implement approve expense logic
    // - Verify authentication
    // - Check user is the assigned approver
    // - Verify approval is in PENDING status
    // - Update approval status to APPROVED
    // - Set approvedAt timestamp
    // - Add optional comment
    // - Update expense status to APPROVED
    // - Send notification to expense owner
    // - Return updated approval

    return NextResponse.json(
      {
        message: "Approve expense - To be implemented",
        data: { id, comment },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to approve expense" },
      { status: 500 }
    );
  }
}

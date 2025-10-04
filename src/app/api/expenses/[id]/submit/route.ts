import { NextRequest, NextResponse } from "next/server";

/**
 * Submit Expense for Approval
 * POST /api/expenses/:id/submit
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // TODO: Implement submit expense logic
    // - Verify authentication
    // - Check ownership
    // - Verify expense is in DRAFT status
    // - Validate expense has at least one receipt (if required)
    // - Update status to PENDING_APPROVAL
    // - Set submittedAt timestamp
    // - Create approval record(s) based on workflow
    // - Send notification to approvers
    // - Return updated expense

    return NextResponse.json(
      {
        message: "Submit expense - To be implemented",
        data: { id },
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit expense" },
      { status: 500 }
    );
  }
}

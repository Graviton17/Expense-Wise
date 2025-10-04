import { NextRequest, NextResponse } from "next/server";
import { EnhancedExpenseService } from "@/services/enhanced-expense.service";
import { authenticateUser } from "@/middleware/auth";
import { logger } from "@/middleware/logger";

/**
 * POST /api/expenses/[id]/submit
 * Submit expense for approval with business rules validation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate expense ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId } = authResult.user!;

    // Submit expense using enhanced service
    const result = await EnhancedExpenseService.submitExpense(id, userId);

    if (!result.success) {
      const statusCode = result.error?.includes("not found")
        ? 404
        : result.error?.includes("Access denied")
        ? 403
        : result.error?.includes("cannot") || result.error?.includes("require")
        ? 400
        : 500;

      logger.error(
        "Failed to submit expense",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to submit expense" },
        { status: statusCode }
      );
    }

    // Log successful submission
    logger.info(`Expense submitted for approval: ${id}`);

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Expense submitted for approval successfully",
    });
  } catch (error) {
    logger.error(
      "Unexpected error in POST /api/expenses/[id]/submit:",
      error as Error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

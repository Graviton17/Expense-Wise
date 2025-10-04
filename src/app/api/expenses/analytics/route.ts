import { NextRequest, NextResponse } from "next/server";
import { EnhancedExpenseService } from "@/services/enhanced-expense.service";
import { authenticateUser } from "@/middleware/auth";
import { logger } from "@/middleware/logger";

/**
 * GET /api/expenses/analytics
 * Get expense analytics with role-based data aggregation
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId, role: userRole, companyId } = authResult.user!;

    // Parse query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate") || undefined;
    const endDate = url.searchParams.get("endDate") || undefined;

    // Validate date parameters if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: "Invalid startDate format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return NextResponse.json(
        { error: "Invalid endDate format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: "startDate cannot be after endDate" },
        { status: 400 }
      );
    }

    // Get analytics using enhanced service
    const result = await EnhancedExpenseService.getExpenseAnalytics(
      companyId,
      userId,
      userRole,
      startDate,
      endDate
    );

    if (!result.success) {
      logger.error(
        "Failed to get expense analytics",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to retrieve expense analytics" },
        { status: 500 }
      );
    }

    // Log successful request
    logger.info("Expense analytics retrieved successfully");

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error(
      "Unexpected error in GET /api/expenses/analytics:",
      error as Error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { formatErrorResponse } from "@/middleware/error-handler";
import {
  expenseReportQuerySchema,
  validateReportInput,
} from "@/lib/validations/reports";
import { ReportsService } from "@/services";

/**
 * Generate Expense Report
 * GET /api/reports/expenses?startDate=2025-01-01&endDate=2025-12-31&userId=xxx&format=json&page=1&limit=50
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { user } = authResult;

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryData = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      userId: searchParams.get("userId") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      status: searchParams.get("status") || undefined,
      format: searchParams.get("format") || "json",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
    };

    const validation = validateReportInput(expenseReportQuerySchema, queryData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get expense report
    const reportData = await ReportsService.getExpenseReport(
      user.companyId,
      validation.data!,
      user.sub,
      user.role
    );

    return NextResponse.json({
      success: true,
      data: reportData,
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
}

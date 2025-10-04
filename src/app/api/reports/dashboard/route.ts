import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { formatErrorResponse } from "@/middleware/error-handler";
import {
  dashboardQuerySchema,
  validateReportInput,
} from "@/lib/validations/reports";
import { ReportsService } from "@/services";

/**
 * Get Dashboard Analytics
 * GET /api/reports/dashboard?period=month&startDate=2024-01-01&endDate=2024-01-31&userId=user123
 *
 * Returns comprehensive dashboard data including:
 * - Summary statistics (total, average expenses)
 * - Status breakdown (draft, pending, approved, rejected)
 * - Category breakdown with amounts
 * - Monthly trends over the last 12 months
 * - Top spenders (for managers/admins)
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
      period: searchParams.get("period") || "month",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      userId: searchParams.get("userId") || undefined,
    };

    const validation = validateReportInput(dashboardQuerySchema, queryData);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get dashboard analytics data
    const dashboardData = await ReportsService.getDashboardAnalytics(
      user.companyId,
      validation.data!,
      user.sub,
      user.role
    );

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
}

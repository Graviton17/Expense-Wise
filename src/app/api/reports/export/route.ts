import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { formatErrorResponse } from "@/middleware/error-handler";
import {
  exportReportSchema,
  validateReportInput,
} from "@/lib/validations/reports";
import { ReportsService } from "@/services";

/**
 * Create Export Task
 * POST /api/reports/export
 *
 * Body: {
 *   format: "csv" | "xlsx" | "pdf" | "json",
 *   filters: {
 *     startDate: "2024-01-01",
 *     endDate: "2024-12-31",
 *     status?: ["APPROVED", "PENDING_APPROVAL"],
 *     categoryId?: "category123",
 *     userId?: "user123",
 *     minAmount?: 100,
 *     maxAmount?: 5000
 *   },
 *   includeReceipts?: boolean
 * }
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();

    const validation = validateReportInput(exportReportSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create export task
    const exportTask = await ReportsService.createExportTask(
      user.companyId,
      validation.data!,
      user.sub,
      user.role
    );

    return NextResponse.json(
      {
        success: true,
        data: exportTask,
      },
      { status: 202 }
    ); // 202 Accepted for async processing
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
}

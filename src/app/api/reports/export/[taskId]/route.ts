import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { formatErrorResponse, NotFoundError } from "@/middleware/error-handler";
import { ReportsService } from "@/services";

/**
 * Get Export Task Status
 * GET /api/reports/export/[taskId]
 *
 * Returns the status of an export task:
 * - PROCESSING: Task is being processed
 * - COMPLETED: Export is ready for download
 * - FAILED: Export failed with error details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
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
    const { taskId } = params;

    if (!taskId) {
      throw new NotFoundError("Task ID is required");
    }

    // Get export task status
    const taskStatus = await ReportsService.getExportStatus(
      taskId,
      user.companyId,
      user.sub
    );

    return NextResponse.json({
      success: true,
      data: taskStatus,
    });
  } catch (error) {
    return formatErrorResponse(error as Error);
  }
}

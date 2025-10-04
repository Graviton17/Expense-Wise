import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/middleware/logger";
import CompanyService from "@/services/company.service";
import {
  companyStatsQuerySchema,
  validateCompanyInput,
} from "@/lib/validations/companies";

/**
 * Get Company Statistics
 * GET /api/companies/[id]/stats
 * Returns company analytics and reporting data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: companyId } = params;

    // Extract and verify JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decodedToken = verifyAccessToken(token);
    if (!decodedToken?.userId) {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // Validate user belongs to company
    const accessValidation = await CompanyService.validateUserCompanyAccess(
      decodedToken.userId,
      companyId
    );

    if (!accessValidation.success) {
      return NextResponse.json(
        { error: accessValidation.error },
        { status: 403 }
      );
    }

    // Check role-based access - only ADMIN and MANAGER can view stats
    const canViewStats = ["ADMIN", "MANAGER"].includes(
      accessValidation.data!.userRole
    );
    if (!canViewStats) {
      return NextResponse.json(
        {
          error:
            "Access denied: Insufficient permissions to view company statistics",
        },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      includeUsers: searchParams.get("includeUsers") || undefined,
      includeExpenses: searchParams.get("includeExpenses") || undefined,
      includeApprovals: searchParams.get("includeApprovals") || undefined,
    };

    const validation = validateCompanyInput(
      companyStatsQuerySchema,
      queryParams
    );
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get company statistics
    const result = await CompanyService.getCompanyStats(
      companyId,
      validation.data!
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    logger.info(`Company statistics retrieved: ${companyId}`, {
      companyId,
      requestedBy: decodedToken.userId,
      userRole: accessValidation.data!.userRole,
      dateRange: {
        start: validation.data?.startDate,
        end: validation.data?.endDate,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: result.data,
        period: {
          startDate: validation.data?.startDate,
          endDate: validation.data?.endDate,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error retrieving company statistics:", error as Error);

    // Handle specific JWT errors
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve company statistics" },
      { status: 500 }
    );
  }
}

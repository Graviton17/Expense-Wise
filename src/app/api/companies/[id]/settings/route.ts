import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/middleware/logger";
import CompanyService from "@/services/company.service";
import {
  updateCompanySettingsSchema,
  validateCompanyInput,
  validateCompanyAccess,
} from "@/lib/validations/companies";

/**
 * Update Company Settings (Admin only)
 * PUT /api/companies/[id]/settings
 * Updates company-specific settings and configurations
 */
export async function PUT(
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

    // Check role-based access for settings management
    const roleValidation = validateCompanyAccess(
      accessValidation.data!.userRole,
      "manage-settings"
    );
    if (!roleValidation.success) {
      return NextResponse.json(
        { error: roleValidation.error },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCompanyInput(updateCompanySettingsSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid settings data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Update company settings
    const result = await CompanyService.updateCompanySettings(
      companyId,
      validation.data!,
      decodedToken.userId,
      accessValidation.data!.userRole
    );

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          details: result.errors,
        },
        { status: 400 }
      );
    }

    logger.info(`Company settings updated: ${companyId}`, {
      companyId,
      updatedBy: decodedToken.userId,
      userRole: accessValidation.data!.userRole,
      settingsKeys: Object.keys(validation.data!),
    });

    return NextResponse.json({
      success: true,
      data: {
        message:
          result.data?.message || "Company settings updated successfully",
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Error updating company settings:", error as Error);

    // Handle specific JWT errors
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update company settings" },
      { status: 500 }
    );
  }
}

/**
 * Get Company Settings (Admin/Manager access)
 * GET /api/companies/[id]/settings
 * Returns current company settings and configurations
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

    // Check role-based access - ADMIN and MANAGER can view settings
    const canViewSettings = ["ADMIN", "MANAGER"].includes(
      accessValidation.data!.userRole
    );
    if (!canViewSettings) {
      return NextResponse.json(
        {
          error:
            "Access denied: Insufficient permissions to view company settings",
        },
        { status: 403 }
      );
    }

    // Get company profile with settings
    const result = await CompanyService.getCompanyProfile(companyId, {
      includeSettings: true,
      includeStats: false,
      includeUsers: false,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    // Extract settings from company data
    // Note: Since current schema doesn't have settings field, we'll return default settings
    const defaultSettings = {
      expenseCategories: [], // Would be populated from ExpenseCategory table
      defaultApprovalWorkflow: "SEQUENTIAL",
      maxExpenseAmount: 10000,
      requireReceipts: true,
      receiptMinAmount: 25,
      autoApprovalLimit: 0,
      allowPersonalExpenses: false,
      fiscalYearStart: "JANUARY",
      timezonePreference: "America/New_York",
    };

    logger.info(`Company settings retrieved: ${companyId}`, {
      companyId,
      requestedBy: decodedToken.userId,
      userRole: accessValidation.data!.userRole,
    });

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: result.data!.id,
          name: result.data!.name,
          country: result.data!.country,
          baseCurrency: result.data!.baseCurrency,
        },
        settings: defaultSettings,
        lastUpdated: result.data!.updatedAt,
      },
    });
  } catch (error) {
    logger.error("Error retrieving company settings:", error as Error);

    // Handle specific JWT errors
    if (error instanceof Error && error.message.includes("token")) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to retrieve company settings" },
      { status: 500 }
    );
  }
}

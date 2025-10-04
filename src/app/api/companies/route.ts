import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { logger } from "@/middleware/logger";
import CompanyService from "@/services/company.service";
import {
  getCompanyProfileSchema,
  createCompanySchema,
  validateCompanyInput,
} from "@/lib/validations/companies";

/**
 * Get Company Profile
 * GET /api/companies
 * Returns the authenticated user's company profile
 */
export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const validation = validateCompanyInput(getCompanyProfileSchema, {
      includeSettings: searchParams.get("includeSettings") || undefined,
      includeStats: searchParams.get("includeStats") || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get user's company
    const companyResult = await CompanyService.getCompanyByUserId(
      decodedToken.userId
    );
    if (!companyResult.success) {
      return NextResponse.json({ error: companyResult.error }, { status: 404 });
    }

    // Get detailed company profile
    const profileResult = await CompanyService.getCompanyProfile(
      companyResult.data!.id,
      {
        includeSettings: validation.data?.includeSettings,
        includeStats: validation.data?.includeStats,
        includeUsers: false, // Don't include user list in basic profile
      }
    );

    if (!profileResult.success) {
      return NextResponse.json({ error: profileResult.error }, { status: 500 });
    }

    logger.info(`Company profile retrieved by user: ${decodedToken.userId}`, {
      userId: decodedToken.userId,
      companyId: companyResult.data!.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        company: profileResult.data,
        settings: validation.data?.includeSettings
          ? {
              // Add any settings-specific formatting here
              expenseCategories: [], // This would come from related ExpenseCategory records
            }
          : undefined,
      },
    });
  } catch (error) {
    logger.error("Error fetching company profile:", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

/**
 * Create Company (For registration/onboarding)
 * POST /api/companies
 * Creates a new company with admin user during registration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateCompanyInput(createCompanySchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create company
    const result = await CompanyService.createCompany(
      validation.data!,
      "system" // Created by system during registration
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

    logger.info(`Company created: ${result.data!.id}`, {
      companyId: result.data!.id,
      companyName: result.data!.name,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          company: result.data,
          message: "Company created successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating company:", error as Error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}

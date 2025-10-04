import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth";
import {
  updateProfileSchema,
  validateUserInput,
} from "@/lib/validations/users";

// Define user type for TypeScript
interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

/**
 * Get Current User Profile
 * GET /api/users/me
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as AuthenticatedRequest).user;

    // Fetch detailed user information from database
    const userProfile = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            country: true,
            baseCurrency: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            submittedExpenses: true,
            subordinates: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User profile not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          managerId: userProfile.managerId,
          manager: userProfile.manager
            ? {
                id: userProfile.manager.id,
                name: userProfile.manager.name,
                email: userProfile.manager.email,
              }
            : null,
          company: {
            id: userProfile.company.id,
            name: userProfile.company.name,
            country: userProfile.company.country,
            baseCurrency: userProfile.company.baseCurrency,
          },
          stats: {
            totalExpenses: userProfile._count.submittedExpenses,
            subordinates: userProfile._count.subordinates,
          },
          createdAt: userProfile.createdAt,
          updatedAt: userProfile.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch user profile",
        },
      },
      { status: 500 }
    );
  }
});

/**
 * Update Current User Profile
 * PUT /api/users/me
 */
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as AuthenticatedRequest).user;
    const body = await request.json();

    // Validate input
    const validation = validateUserInput(updateProfileSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: validation.errors,
          },
        },
        { status: 400 }
      );
    }

    const { name } = validation.data!;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...(name && { name }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update current user error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update user profile",
        },
      },
      { status: 500 }
    );
  }
});

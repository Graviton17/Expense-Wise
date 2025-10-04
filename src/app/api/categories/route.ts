import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth";
import {
  createCategorySchema,
  validateCategoryInput,
} from "@/lib/validations/categories";
import type { CategoryPublic } from "@/types/database";

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
 * Get Expense Categories
 * GET /api/categories
 *
 * Returns all expense categories for the user's company
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const user = (request as AuthenticatedRequest).user;

    // Fetch categories for user's company
    const categories = await prisma.expenseCategory.findMany({
      where: {
        companyId: user.companyId,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: categories.map((category) => ({
          id: category.id,
          name: category.name,
          expenseCount: category._count.expenses,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get categories error:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch categories",
        },
      },
      { status: 500 }
    );
  }
});

/**
 * Create Expense Category (Admin only)
 * POST /api/categories
 *
 * Creates a new expense category for the company
 * Only admins can create categories
 */
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const user = (request as AuthenticatedRequest).user;

      // Check if user is admin
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins can create expense categories",
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Validate input
      const validation = validateCategoryInput(createCategorySchema, body);
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

      // Check if category with same name already exists for this company
      const existingCategory = await prisma.expenseCategory.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          companyId: user.companyId,
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CATEGORY_EXISTS",
              message: "A category with this name already exists",
            },
          },
          { status: 409 }
        );
      }

      // Create the category
      const category = await prisma.expenseCategory.create({
        data: {
          name,
          companyId: user.companyId,
        },
        select: {
          id: true,
          name: true,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: category.id,
            name: category.name,
            expenseCount: 0,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create category error:", error);

      // Handle specific Prisma errors
      if (error instanceof Error) {
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "CATEGORY_EXISTS",
                message: "A category with this name already exists",
              },
            },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create category",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

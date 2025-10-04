import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth";
import {
  updateCategorySchema,
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
 * Update Expense Category (Admin only)
 * PUT /api/categories/[id]
 *
 * Updates an existing expense category
 * Only admins can update categories
 */
export const PUT = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const categoryId = context?.params?.id;

      if (!categoryId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Category ID is required",
            },
          },
          { status: 400 }
        );
      }

      // Check if user is admin
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins can update expense categories",
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Validate input
      const validation = validateCategoryInput(updateCategorySchema, body);
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

      // Check if category exists and belongs to user's company
      const existingCategory = await prisma.expenseCategory.findFirst({
        where: {
          id: categoryId,
          companyId: user.companyId,
        },
      });

      if (!existingCategory) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CATEGORY_NOT_FOUND",
              message: "Category not found or access denied",
            },
          },
          { status: 404 }
        );
      }

      // Check if category with same name already exists for this company (excluding current category)
      const duplicateCategory = await prisma.expenseCategory.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
          companyId: user.companyId,
          id: {
            not: categoryId,
          },
        },
      });

      if (duplicateCategory) {
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

      // Update the category
      const updatedCategory = await prisma.expenseCategory.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
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
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updatedCategory.id,
            name: updatedCategory.name,
            expenseCount: updatedCategory._count.expenses,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Update category error:", error);

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
            message: "Failed to update category",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

/**
 * Delete Expense Category (Admin only)
 * DELETE /api/categories/[id]
 *
 * Deletes an expense category
 * Only admins can delete categories
 * Cannot delete categories that have associated expenses
 */
export const DELETE = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const categoryId = context?.params?.id;

      if (!categoryId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "Category ID is required",
            },
          },
          { status: 400 }
        );
      }

      // Check if user is admin
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins can delete expense categories",
            },
          },
          { status: 403 }
        );
      }

      // Check if category exists and belongs to user's company
      const existingCategory = await prisma.expenseCategory.findFirst({
        where: {
          id: categoryId,
          companyId: user.companyId,
        },
        include: {
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      });

      if (!existingCategory) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CATEGORY_NOT_FOUND",
              message: "Category not found or access denied",
            },
          },
          { status: 404 }
        );
      }

      // Check if category has associated expenses
      if (existingCategory._count.expenses > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CATEGORY_IN_USE",
              message: `Cannot delete category as it has ${existingCategory._count.expenses} associated expense(s)`,
            },
          },
          { status: 409 }
        );
      }

      // Delete the category
      await prisma.expenseCategory.delete({
        where: {
          id: categoryId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            message: "Category deleted successfully",
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete category error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to delete category",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth";
import {
  updateUserSchema,
  validateUserInput,
  validateManagerAssignment,
  validateRoleHierarchy,
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
 * Get User by ID
 * GET /api/users/[id]
 */
export const GET = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const userId = context?.params?.id;

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "User ID is required",
            },
          },
          { status: 400 }
        );
      }

      // Authorization logic:
      // - Users can view their own profile
      // - ADMINs can view any user in their company
      // - MANAGERs can view their subordinates and their own profile
      let canAccess = false;

      if (userId === user.id) {
        // User viewing their own profile
        canAccess = true;
      } else if (user.role === "ADMIN") {
        // Admin can view any user in company
        canAccess = true;
      } else if (user.role === "MANAGER") {
        // Manager can view their subordinates
        const subordinate = await prisma.user.findFirst({
          where: {
            id: userId,
            companyId: user.companyId,
            managerId: user.id,
          },
        });
        canAccess = !!subordinate;
      }

      if (!canAccess) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Access denied",
            },
          },
          { status: 403 }
        );
      }

      // Fetch user details
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          companyId: user.companyId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
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
          subordinates: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
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

      if (!targetUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.name,
            role: targetUser.role,
            managerId: targetUser.managerId,
            manager: targetUser.manager
              ? {
                  id: targetUser.manager.id,
                  name: targetUser.manager.name,
                  email: targetUser.manager.email,
                }
              : null,
            subordinates: targetUser.subordinates.map((sub) => ({
              id: sub.id,
              name: sub.name,
              email: sub.email,
              role: sub.role,
            })),
            company: {
              id: targetUser.company.id,
              name: targetUser.company.name,
              country: targetUser.company.country,
              baseCurrency: targetUser.company.baseCurrency,
            },
            stats: {
              totalExpenses: targetUser._count.submittedExpenses,
              subordinates: targetUser._count.subordinates,
            },
            createdAt: targetUser.createdAt,
            updatedAt: targetUser.updatedAt,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get user by ID error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch user",
          },
        },
        { status: 500 }
      );
    }
  }
);

/**
 * Update User (Admin only)
 * PUT /api/users/[id]
 */
export const PUT = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const userId = context?.params?.id;

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "User ID is required",
            },
          },
          { status: 400 }
        );
      }

      // Check authorization - only ADMINs can update other users
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins can update users",
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Validate input
      const validation = validateUserInput(updateUserSchema, body);
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

      const { name, role, managerId } = validation.data!;

      // Check if target user exists and belongs to same company
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          companyId: user.companyId,
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          },
          { status: 404 }
        );
      }

      // Validate role hierarchy
      if (role) {
        const roleValidation = validateRoleHierarchy(user.role, role);
        if (!roleValidation.success) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "AUTHORIZATION_ERROR",
                message: roleValidation.error,
              },
            },
            { status: 403 }
          );
        }
      }

      // Validate manager assignment
      const finalRole = role || targetUser.role;
      const finalManagerId =
        managerId !== undefined ? managerId : targetUser.managerId;

      const managerValidation = validateManagerAssignment(
        finalRole,
        finalManagerId
      );
      if (!managerValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BUSINESS_RULE_VIOLATION",
              message: managerValidation.error,
            },
          },
          { status: 400 }
        );
      }

      // Validate manager exists and belongs to same company
      if (finalManagerId && finalManagerId !== targetUser.managerId) {
        const manager = await prisma.user.findFirst({
          where: {
            id: finalManagerId,
            companyId: user.companyId,
            role: { in: ["ADMIN", "MANAGER"] },
          },
        });

        if (!manager) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "MANAGER_NOT_FOUND",
                message: "Manager not found or invalid",
              },
            },
            { status: 400 }
          );
        }
      }

      // Update the user
      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          ...(name && { name }),
          ...(role && { role }),
          ...(managerId !== undefined && { managerId }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          managerId: true,
          updatedAt: true,
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

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            managerId: updatedUser.managerId,
            manager: updatedUser.manager
              ? {
                  id: updatedUser.manager.id,
                  name: updatedUser.manager.name,
                  email: updatedUser.manager.email,
                }
              : null,
            stats: {
              totalExpenses: updatedUser._count.submittedExpenses,
              subordinates: updatedUser._count.subordinates,
            },
            updatedAt: updatedUser.updatedAt,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Update user error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to update user",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

/**
 * Delete/Deactivate User (Admin only)
 * DELETE /api/users/[id]
 */
export const DELETE = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ) => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const userId = context?.params?.id;

      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_REQUEST",
              message: "User ID is required",
            },
          },
          { status: 400 }
        );
      }

      // Check authorization - only ADMINs can delete users
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins can delete users",
            },
          },
          { status: 403 }
        );
      }

      // Prevent self-deletion
      if (userId === user.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BUSINESS_RULE_VIOLATION",
              message: "You cannot delete your own account",
            },
          },
          { status: 400 }
        );
      }

      // Check if target user exists and belongs to same company
      const targetUser = await prisma.user.findFirst({
        where: {
          id: userId,
          companyId: user.companyId,
        },
        include: {
          _count: {
            select: {
              submittedExpenses: true,
              subordinates: true,
            },
          },
        },
      });

      if (!targetUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: "User not found",
            },
          },
          { status: 404 }
        );
      }

      // Check if user has subordinates that need reassignment
      if (targetUser._count.subordinates > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BUSINESS_RULE_VIOLATION",
              message: `Cannot delete user as they manage ${targetUser._count.subordinates} subordinate(s). Please reassign their team members first.`,
            },
          },
          { status: 409 }
        );
      }

      // For this implementation, we'll do a soft delete by updating a hypothetical status field
      // Since our schema doesn't have an isActive field, we'll delete the user record
      // Note: In production, you'd want to soft delete to preserve referential integrity

      // Check if user has expenses that would be affected
      if (targetUser._count.submittedExpenses > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BUSINESS_RULE_VIOLATION",
              message: `Cannot delete user as they have ${targetUser._count.submittedExpenses} expense(s). Consider deactivating instead.`,
            },
          },
          { status: 409 }
        );
      }

      // Delete the user (in production, implement soft delete)
      await prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            message: "User deleted successfully",
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete user error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to delete user",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

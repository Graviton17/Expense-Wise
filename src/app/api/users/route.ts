import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/middleware/auth";
import {
  usersQuerySchema,
  createUserSchema,
  validateUserInput,
  validateManagerAssignment,
} from "@/lib/validations/users";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

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
 * Get All Users (Admin/Manager only)
 * GET /api/users?page=1&limit=20&role=EMPLOYEE&search=john
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const user = (request as AuthenticatedRequest).user;

      // Check authorization - only ADMINs and MANAGERs can list users
      if (user.role !== "ADMIN" && user.role !== "MANAGER") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins and managers can list users",
            },
          },
          { status: 403 }
        );
      }

      // Parse and validate query parameters
      const searchParams = Object.fromEntries(
        request.nextUrl.searchParams.entries()
      );
      const validation = validateUserInput(usersQuerySchema, searchParams);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              details: validation.errors,
            },
          },
          { status: 400 }
        );
      }

      const { page, limit, role, search, sortBy, sortOrder } = validation.data!;
      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions: Record<string, unknown> = {
        companyId: user.companyId,
      };

      // Role filter
      if (role) {
        whereConditions.role = role;
      }

      // Search filter (name or email)
      if (search) {
        whereConditions.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      // For MANAGERs, only show their subordinates + themselves
      if (user.role === "MANAGER") {
        whereConditions.OR = [
          { managerId: user.id }, // Their subordinates
          { id: user.id }, // Themselves
        ];
      }

      // Build order by
      const orderBy: Record<string, "asc" | "desc"> = {};
      if (sortBy === "createdAt") {
        orderBy.createdAt = sortOrder;
      } else {
        orderBy[sortBy] = sortOrder;
      }

      // Execute queries
      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where: whereConditions,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            managerId: true,
            createdAt: true,
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
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.user.count({
          where: whereConditions,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json(
        {
          success: true,
          data: {
            users: users.map((user) => ({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              managerId: user.managerId,
              manager: user.manager
                ? {
                    id: user.manager.id,
                    name: user.manager.name,
                    email: user.manager.email,
                  }
                : null,
              stats: {
                totalExpenses: user._count.submittedExpenses,
                subordinates: user._count.subordinates,
              },
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            })),
            pagination: {
              page,
              limit,
              total: totalCount,
              totalPages,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get users error:", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch users",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

/**
 * Create User (Admin only)
 * POST /api/users
 */
export const POST = withAuth(
  async (request: NextRequest) => {
    try {
      const user = (request as AuthenticatedRequest).user;

      // Check authorization - only ADMINs can create users
      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHORIZATION_ERROR",
              message: "Only admins can create users",
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Validate input
      const validation = validateUserInput(createUserSchema, body);
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

      const { email, name, role, managerId } = validation.data!;

      // Validate manager assignment business rules
      const managerValidation = validateManagerAssignment(role, managerId);
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

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "USER_EXISTS",
              message: "A user with this email already exists",
            },
          },
          { status: 409 }
        );
      }

      // Validate manager exists and belongs to same company
      if (managerId) {
        const manager = await prisma.user.findFirst({
          where: {
            id: managerId,
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

      // Generate temporary password
      const temporaryPassword = crypto.randomBytes(8).toString("hex");
      const hashedPassword = await hashPassword(temporaryPassword);

      // Create the user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
          companyId: user.companyId,
          managerId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          managerId: true,
          createdAt: true,
          manager: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // TODO: Send invitation email with temporary password
      // This would be implemented with the email service

      return NextResponse.json(
        {
          success: true,
          data: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            managerId: newUser.managerId,
            manager: newUser.manager
              ? {
                  id: newUser.manager.id,
                  name: newUser.manager.name,
                  email: newUser.manager.email,
                }
              : null,
            temporaryPassword,
            createdAt: newUser.createdAt,
          },
          message: "User created successfully. Invitation details provided.",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create user error:", error);

      // Handle specific Prisma errors
      if (error instanceof Error) {
        if (error.message.includes("Unique constraint")) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "USER_EXISTS",
                message: "A user with this email already exists",
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
            message: "Failed to create user",
          },
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

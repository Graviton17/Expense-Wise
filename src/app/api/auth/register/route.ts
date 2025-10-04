import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateTokenPair, User } from "@/lib/jwt";
import {
  companyRegistrationSchema,
  validateInput,
} from "@/lib/validations/auth";

/**
 * Company Registration
 * POST /api/auth/register
 *
 * Creates a new company account with an admin user.
 * Based on API specification in docs/backend/01-api-specifications.md
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(companyRegistrationSchema, body);
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

    const { company: companyData, admin: adminData } = validation.data!;

    // Check if company with same name already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: {
          equals: companyData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "COMPANY_EXISTS",
            message: "A company with this name already exists",
          },
        },
        { status: 409 }
      );
    }

    // Check if user with same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "A user with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(adminData.password);

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const newCompany = await tx.company.create({
        data: {
          name: companyData.name,
          country: companyData.country,
          baseCurrency: "USD", // Default to USD, can be made configurable
        },
      });

      // Create admin user
      const newUser = await tx.user.create({
        data: {
          email: adminData.email,
          name: `${adminData.firstName} ${adminData.lastName}`,
          password: passwordHash,
          role: "ADMIN",
          companyId: newCompany.id,
        },
      });

      // Create default expense categories for the company
      await tx.expenseCategory.createMany({
        data: [
          { name: "Travel", companyId: newCompany.id },
          { name: "Meals & Entertainment", companyId: newCompany.id },
          { name: "Office Supplies", companyId: newCompany.id },
          { name: "Equipment", companyId: newCompany.id },
          { name: "Software & Subscriptions", companyId: newCompany.id },
          { name: "Transportation", companyId: newCompany.id },
          { name: "Accommodation", companyId: newCompany.id },
        ],
      });

      return { company: newCompany, user: newUser };
    });

    // Generate JWT tokens for the admin user
    const userForToken: User = {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role as "ADMIN" | "MANAGER" | "EMPLOYEE",
      companyId: result.user.companyId,
    };

    const tokens = generateTokenPair(userForToken);

    // Prepare response data
    const responseData = {
      company: {
        id: result.company.id,
        name: result.company.name,
        status: "ACTIVE",
        createdAt: result.company.createdAt,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Company registration error:", error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "CONFLICT",
              message: "Company or email already exists",
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
          message: "Company registration failed",
        },
      },
      { status: 500 }
    );
  }
}

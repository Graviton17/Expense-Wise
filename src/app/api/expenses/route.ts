import { NextRequest, NextResponse } from "next/server";
import { EnhancedExpenseService } from "@/services/enhanced-expense.service";
import {
  listExpensesQuerySchema,
  createExpenseSchema,
  CreateExpenseInput,
  ListExpensesQueryInput,
} from "@/lib/validations/expenses";
import { authenticateUser } from "@/middleware/auth";
import { logger } from "@/middleware/logger";

/**
 * Helper function to validate query parameters against schema
 */
function validateListExpensesQuery(data: any): {
  success: boolean;
  data?: ListExpensesQueryInput;
  errors?: string[];
} {
  try {
    const result = listExpensesQuerySchema.parse(data);
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      errors: error.errors?.map(
        (e: any) => `${e.path.join(".")}: ${e.message}`
      ) || ["Validation failed"],
    };
  }
}

/**
 * Helper function to validate create expense input
 */
function validateCreateExpenseInput(data: any): {
  success: boolean;
  data?: CreateExpenseInput;
  errors?: string[];
} {
  try {
    const result = createExpenseSchema.parse(data);
    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      errors: error.errors?.map(
        (e: any) => `${e.path.join(".")}: ${e.message}`
      ) || ["Validation failed"],
    };
  }
}

/**
 * GET /api/expenses
 * List expenses with filtering, pagination, and role-based access
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId, role: userRole, companyId } = authResult.user!;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page")
        ? parseInt(url.searchParams.get("page")!)
        : undefined,
      limit: url.searchParams.get("limit")
        ? parseInt(url.searchParams.get("limit")!)
        : undefined,
      sortBy: url.searchParams.get("sortBy") || undefined,
      sortOrder: url.searchParams.get("sortOrder") as
        | "asc"
        | "desc"
        | undefined,
      status: url.searchParams.get("status") || undefined,
      category: url.searchParams.get("category") || undefined,
      userId: url.searchParams.get("userId") || undefined,
      startDate: url.searchParams.get("startDate") || undefined,
      endDate: url.searchParams.get("endDate") || undefined,
      minAmount: url.searchParams.get("minAmount")
        ? parseFloat(url.searchParams.get("minAmount")!)
        : undefined,
      maxAmount: url.searchParams.get("maxAmount")
        ? parseFloat(url.searchParams.get("maxAmount")!)
        : undefined,
      merchantName: url.searchParams.get("merchantName") || undefined,
    };

    // Validate query parameters
    const validation = validateListExpensesQuery(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get expenses using enhanced service
    const result = await EnhancedExpenseService.listExpenses(
      validation.data!,
      userId,
      userRole,
      companyId
    );

    if (!result.success) {
      logger.error(
        "Failed to list expenses",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to retrieve expenses" },
        { status: 500 }
      );
    }

    // Log successful request
    logger.info("Expenses listed successfully");

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Unexpected error in GET /api/expenses:", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId, role: userRole, companyId } = authResult.user!;

    // Only employees and managers can create expenses
    if (!["EMPLOYEE", "MANAGER", "ADMIN"].includes(userRole)) {
      return NextResponse.json(
        { error: "Access denied: Insufficient permissions to create expenses" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = validateCreateExpenseInput(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid expense data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create expense using enhanced service
    const result = await EnhancedExpenseService.createExpense(
      validation.data!,
      userId,
      companyId
    );

    if (!result.success) {
      logger.error(
        "Failed to create expense",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to create expense" },
        { status: 400 }
      );
    }

    // Log successful creation
    logger.info("Expense created successfully");

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Unexpected error in POST /api/expenses:", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

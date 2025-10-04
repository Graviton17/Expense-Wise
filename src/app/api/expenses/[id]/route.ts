import { NextRequest, NextResponse } from "next/server";
import { EnhancedExpenseService } from "@/services/enhanced-expense.service";
import {
  updateExpenseSchema,
  UpdateExpenseInput,
} from "@/lib/validations/expenses";
import { authenticateUser } from "@/middleware/auth";
import { logger } from "@/middleware/logger";

/**
 * Helper function to validate update expense input
 */
function validateUpdateExpenseInput(data: any): {
  success: boolean;
  data?: UpdateExpenseInput;
  errors?: string[];
} {
  try {
    const result = updateExpenseSchema.parse(data);
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
 * GET /api/expenses/[id]
 * Get expense details by ID with access control
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate expense ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId, role: userRole } = authResult.user!;

    // Get expense details using enhanced service
    const result = await EnhancedExpenseService.getExpenseById(
      id,
      userId,
      userRole
    );

    if (!result.success) {
      const statusCode = result.error?.includes("not found")
        ? 404
        : result.error?.includes("Access denied")
        ? 403
        : 500;

      logger.error(
        "Failed to get expense details",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to retrieve expense" },
        { status: statusCode }
      );
    }

    // Log successful request
    logger.info(`Expense details retrieved: ${id}`);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Unexpected error in GET /api/expenses/[id]:", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/expenses/[id]
 * Update expense with business rules validation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate expense ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId } = authResult.user!;

    // Parse and validate request body
    const body = await request.json();
    const validation = validateUpdateExpenseInput(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid expense data",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Update expense using enhanced service
    const result = await EnhancedExpenseService.updateExpense(
      id,
      validation.data!,
      userId
    );

    if (!result.success) {
      const statusCode = result.error?.includes("not found")
        ? 404
        : result.error?.includes("Access denied")
        ? 403
        : result.error?.includes("cannot")
        ? 400
        : 500;

      logger.error(
        "Failed to update expense",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to update expense" },
        { status: statusCode }
      );
    }

    // Log successful update
    logger.info(`Expense updated: ${id}`);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error("Unexpected error in PUT /api/expenses/[id]:", error as Error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expenses/[id]
 * Delete expense with proper access control
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate expense ID format
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid expense ID" },
        { status: 400 }
      );
    }

    // Extract and validate authentication
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { sub: userId } = authResult.user!;

    // Delete expense using enhanced service
    const result = await EnhancedExpenseService.deleteExpense(id, userId);

    if (!result.success) {
      const statusCode = result.error?.includes("not found")
        ? 404
        : result.error?.includes("Access denied")
        ? 403
        : result.error?.includes("cannot")
        ? 400
        : 500;

      logger.error(
        "Failed to delete expense",
        new Error(result.error || "Unknown error")
      );

      return NextResponse.json(
        { error: result.error || "Failed to delete expense" },
        { status: statusCode }
      );
    }

    // Log successful deletion
    logger.info(`Expense deleted: ${id}`);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error(
      "Unexpected error in DELETE /api/expenses/[id]:",
      error as Error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ReceiptService } from "@/services/receipt.service";
import { EnhancedExpenseService } from "@/services/enhanced-expense.service";
import { authenticateUser } from "@/middleware/auth";
import { logger } from "@/middleware/logger";

/**
 * POST /api/expenses/[id]/receipts
 * Upload receipt file for an expense
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: expenseId } = params;

    // Validate expense ID format
    if (!expenseId || typeof expenseId !== "string") {
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

    // Check if expense exists and user has access
    const expenseResult = await EnhancedExpenseService.getExpenseById(
      expenseId,
      userId,
      userRole
    );

    if (!expenseResult.success) {
      const statusCode = expenseResult.error?.includes("not found")
        ? 404
        : expenseResult.error?.includes("Access denied")
        ? 403
        : 500;

      return NextResponse.json(
        { error: expenseResult.error || "Failed to access expense" },
        { status: statusCode }
      );
    }

    // Check if expense is still modifiable (DRAFT or REJECTED status)
    const expense = expenseResult.data!;
    if (!["DRAFT", "REJECTED"].includes(expense.status)) {
      return NextResponse.json(
        {
          error:
            "Cannot upload receipts to expenses that are not in DRAFT or REJECTED status",
          currentStatus: expense.status,
        },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No receipt file provided" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, and PDF files are allowed",
          allowedTypes,
        },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File size too large. Maximum size is 10MB",
          maxSizeBytes: maxSize,
          receivedSizeBytes: file.size,
        },
        { status: 400 }
      );
    }

    // Check if expense already has a receipt (schema limitation)
    if (expense.receipt) {
      return NextResponse.json(
        {
          error:
            "Expense already has a receipt. Please delete the existing receipt first or update it",
          existingReceiptId: expense.receipt.id,
        },
        { status: 409 }
      );
    }

    // Upload receipt using receipt service
    const uploadResult = await ReceiptService.uploadReceipt(
      file,
      expenseId,
      userId
    );

    if (!uploadResult.success) {
      logger.error(
        "Failed to upload receipt",
        new Error("Receipt upload failed")
      );

      return NextResponse.json(
        { error: uploadResult.error || "Failed to upload receipt" },
        { status: 500 }
      );
    }

    // Log successful upload
    logger.info(`Receipt uploaded for expense: ${expenseId}`, {
      receiptId: uploadResult.data?.id,
      fileName: uploadResult.data?.fileName,
      fileSize: file.size,
    });

    // Return success with receipt data and updated expense info
    return NextResponse.json(
      {
        success: true,
        data: {
          receipt: uploadResult.data,
          message: "Receipt uploaded successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(
      "Unexpected error in POST /api/expenses/[id]/receipts:",
      error as Error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expenses/[id]/receipts
 * Get receipts for an expense
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: expenseId } = params;

    // Validate expense ID format
    if (!expenseId || typeof expenseId !== "string") {
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

    // Check if expense exists and user has access
    const expenseResult = await EnhancedExpenseService.getExpenseById(
      expenseId,
      userId,
      userRole
    );

    if (!expenseResult.success) {
      const statusCode = expenseResult.error?.includes("not found")
        ? 404
        : expenseResult.error?.includes("Access denied")
        ? 403
        : 500;

      return NextResponse.json(
        { error: expenseResult.error || "Failed to access expense" },
        { status: statusCode }
      );
    }

    // Get receipts for the expense using receipt service
    const receiptsResult = await ReceiptService.getReceiptsForExpense(
      expenseId
    );

    if (!receiptsResult.success) {
      logger.error(
        "Failed to get receipts for expense",
        new Error(receiptsResult.error || "Unknown error")
      );

      return NextResponse.json(
        { error: receiptsResult.error || "Failed to retrieve receipts" },
        { status: 500 }
      );
    }

    // Log successful retrieval
    logger.info(`Retrieved receipts for expense: ${expenseId}`, {
      receiptCount: receiptsResult.data?.length || 0,
    });

    return NextResponse.json({
      success: true,
      data: {
        receipts: receiptsResult.data || [],
        expenseId: expenseId,
      },
    });
  } catch (error) {
    logger.error(
      "Unexpected error in GET /api/expenses/[id]/receipts:",
      error as Error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

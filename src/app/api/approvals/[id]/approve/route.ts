import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { ApiResponse } from "@/types/api";
import {
  approveExpenseSchema,
  validateApprovalAccess,
  validateUserInput,
  validateExpenseApprovalAuth,
  type ApproveExpenseInput,
} from "@/lib/validations/approvals";
import { prisma } from "@/lib/prisma";

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

interface ApproveExpenseResponse {
  approval: {
    id: string;
    status: string;
    comment: string | null;
    processedAt: string;
    expense: {
      id: string;
      status: string;
      description: string;
      amount: number;
      currency: string;
    };
    approver: {
      id: string;
      name: string;
      email: string;
    };
  };
}

/**
 * POST /api/approvals/[id]/approve
 * Approve an expense approval request
 */
export const POST = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse<ApiResponse<ApproveExpenseResponse>>> => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const expenseId = context?.params?.id;

      if (!expenseId) {
        return NextResponse.json(
          {
            success: false,
            message: "Expense ID is required",
            error: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      // Validate role-based access
      const accessValidation = validateApprovalAccess(user.role, "approve");
      if (!accessValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message: accessValidation.error || "Access denied",
            error: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      const validation = validateUserInput(approveExpenseSchema, body);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid request body",
            error: "VALIDATION_ERROR",
            details: validation.errors,
          },
          { status: 400 }
        );
      }

      const { comment }: ApproveExpenseInput = validation.data!;

      // Check if the expense and approval exist
      const existingApproval = await prisma.expenseApproval.findFirst({
        where: {
          expenseId,
          approverId: user.id,
        },
        include: {
          expense: {
            include: {
              submitter: true,
              category: true,
            },
          },
          approver: true,
        },
      });

      if (!existingApproval) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Approval not found or you are not authorized to approve this expense",
            error: "NOT_FOUND",
          },
          { status: 404 }
        );
      }

      // Validate approval authorization
      const authValidation = validateExpenseApprovalAuth(
        existingApproval.approverId,
        user.id,
        existingApproval.status
      );

      if (!authValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message: authValidation.error || "Cannot approve this expense",
            error: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      // Update approval status
      const updatedApproval = await prisma.expenseApproval.update({
        where: {
          id: existingApproval.id,
        },
        data: {
          status: "APPROVED",
          comments: comment || null,
          processedAt: new Date(),
        },
        include: {
          expense: {
            include: {
              submitter: true,
              category: true,
            },
          },
          approver: true,
        },
      });

      // Update expense status to approved
      await prisma.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          status: "APPROVED",
          updatedAt: new Date(),
        },
      });

      // TODO: Send notification to expense owner
      // TODO: Check if there are more approvals needed

      return NextResponse.json(
        {
          success: true,
          message: "Expense approved successfully",
          data: {
            approval: {
              id: updatedApproval.id,
              status: updatedApproval.status,
              comment: updatedApproval.comments,
              processedAt:
                updatedApproval.processedAt?.toISOString() ||
                new Date().toISOString(),
              expense: {
                id: updatedApproval.expense.id,
                status: updatedApproval.expense.status,
                description: updatedApproval.expense.description,
                amount: parseFloat(updatedApproval.expense.amount.toString()),
                currency: updatedApproval.expense.currency,
              },
              approver: {
                id: updatedApproval.approver.id,
                name: updatedApproval.approver.name,
                email: updatedApproval.approver.email,
              },
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error approving expense:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to approve expense",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

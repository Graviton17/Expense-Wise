import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { ApiResponse } from "@/types/api";
import {
  rejectExpenseSchema,
  validateApprovalAccess,
  validateUserInput,
  validateExpenseApprovalAuth,
  type RejectExpenseInput,
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

interface RejectExpenseResponse {
  approval: {
    id: string;
    status: string;
    reason: string;
    comment: string;
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
 * POST /api/approvals/[id]/reject
 * Reject an expense approval request
 */
export const POST = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse<ApiResponse<RejectExpenseResponse>>> => {
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
      const accessValidation = validateApprovalAccess(user.role, "reject");
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
      const validation = validateUserInput(rejectExpenseSchema, body);

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

      const { reason, comment }: RejectExpenseInput = validation.data!;

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
              "Approval not found or you are not authorized to reject this expense",
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
            message: authValidation.error || "Cannot reject this expense",
            error: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      // Update approval status with rejection details
      const updatedApproval = await prisma.expenseApproval.update({
        where: {
          id: existingApproval.id,
        },
        data: {
          status: "REJECTED",
          comments: `Reason: ${reason}\nComment: ${comment}`,
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

      // Update expense status to rejected
      await prisma.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          status: "REJECTED",
          updatedAt: new Date(),
        },
      });

      // TODO: Send notification to expense owner with rejection reason
      // TODO: Log rejection for audit trail

      return NextResponse.json(
        {
          success: true,
          message: "Expense rejected successfully",
          data: {
            approval: {
              id: updatedApproval.id,
              status: updatedApproval.status,
              reason: reason,
              comment: comment,
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
      console.error("Error rejecting expense:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to reject expense",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { ApiResponse } from "@/types/api";
import {
  pendingApprovalsQuerySchema,
  validateApprovalAccess,
  validateUserInput,
  type PendingApprovalsQueryInput,
} from "@/lib/validations/approvals";
import { ApprovalService } from "@/services/approval.service";
import { ExpenseStatus } from "@prisma/client";

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

interface PendingApprovalsResponse {
  approvals: Array<{
    id: string;
    expense: {
      id: string;
      title: string;
      description: string | null;
      amount: number;
      currency: string;
      category: {
        id: string;
        name: string;
      };
      status: ExpenseStatus;
      submittedAt: string;
      submittedBy: {
        id: string;
        name: string;
        email: string;
      };
      receipts: Array<{
        id: string;
        filename: string;
        fileUrl: string;
      }>;
    };
    status: string;
    requiredBy: string | null;
    comment: string | null;
    assignedTo: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * GET /api/approvals?page=1&limit=20&status=PENDING
 * Get pending approvals for the current user
 */
export const GET = withAuth(
  async (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<PendingApprovalsResponse>>> => {
    try {
      const user = (request as AuthenticatedRequest).user;

      // Validate role-based access
      const accessValidation = validateApprovalAccess(user.role, "view");
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

      // Parse and validate query parameters
      const searchParams = Object.fromEntries(
        request.nextUrl.searchParams.entries()
      );
      const validation = validateUserInput(
        pendingApprovalsQuerySchema,
        searchParams
      );

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid query parameters",
            error: "VALIDATION_ERROR",
            details: validation.errors,
          },
          { status: 400 }
        );
      }

      const validatedQuery: PendingApprovalsQueryInput = validation.data!;

      // Create pagination parameters
      const paginationParams = {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        offset: (validatedQuery.page - 1) * validatedQuery.limit,
      };

      // Get pending approvals for the user
      const result = await ApprovalService.getPendingApprovals(
        user.id,
        paginationParams
      );

      if (!result.success || !result.data) {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to retrieve pending approvals",
            error: "SERVICE_ERROR",
          },
          { status: 500 }
        );
      }

      // Format response
      const formattedApprovals = result.data.data.map((approval) => ({
        id: approval.id,
        expense: {
          id: approval.expenseId,
          title: approval.expenseId, // Using expense ID as title for now
          description: null, // TODO: Add description from expense
          amount: 0, // TODO: Add amount from expense
          currency: "USD", // TODO: Add currency from expense
          category: {
            id: "category-1", // TODO: Add from expense
            name: "General", // TODO: Add from expense
          },
          status: "PENDING_APPROVAL" as ExpenseStatus,
          submittedAt: new Date().toISOString(), // TODO: Add from expense
          submittedBy: {
            id: approval.approverId,
            name: "Unknown User", // TODO: Add from expense
            email: "user@example.com", // TODO: Add from expense
          },
          receipts: [], // TODO: Add receipts
        },
        status: approval.status,
        requiredBy: null,
        comment: approval.comment || null,
        assignedTo: {
          id: approval.approverId,
          name: "Approver", // TODO: Add actual approver name
          email: "approver@example.com", // TODO: Add actual approver email
        },
        createdAt: new Date().toISOString(), // TODO: Add actual creation date
      }));

      return NextResponse.json(
        {
          success: true,
          message: "Pending approvals retrieved successfully",
          data: {
            approvals: formattedApprovals,
            pagination: {
              total: result.data.meta.total,
              page: result.data.meta.page,
              limit: result.data.meta.limit,
              totalPages: result.data.meta.pages,
              hasNext: result.data.meta.hasNext,
              hasPrevious: result.data.meta.hasPrevious,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching pending approvals:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch pending approvals",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN", "MANAGER"] }
);

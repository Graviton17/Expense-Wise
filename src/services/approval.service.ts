import { prisma } from "@/lib/prisma";
import {
  Approval,
  ApprovalPublic,
  ApprovalStatus,
  ServiceResult,
  PaginatedResult,
  PaginationParams,
} from "@/types";
import { businessLogger } from "@/middleware/logger";
import { businessMetrics } from "@/middleware/metrics";
import { sendEmail } from "@/lib/email";

export class ApprovalService {
  // Create approval request
  static async createApproval(data: {
    expenseId: string;
    approverId: string;
  }): Promise<ServiceResult<ApprovalPublic>> {
    try {
      const approval = await prisma.approval.create({
        data: {
          ...data,
          status: "PENDING" as ApprovalStatus,
        },
        include: {
          expense: {
            include: {
              user: true,
            },
          },
          approver: true,
        },
      });

      businessLogger.logApprovalEvent(
        "created",
        approval.id,
        approval.expenseId,
        approval.approverId
      );

      return {
        success: true,
        data: this.toPublicApproval(approval),
      };
    } catch (error) {
      businessLogger.error("Failed to create approval", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to create approval",
          code: "APPROVAL_CREATION_FAILED",
        },
      };
    }
  }

  // Get approval by ID
  static async getApprovalById(
    id: string
  ): Promise<ServiceResult<ApprovalPublic>> {
    try {
      const approval = await prisma.approval.findUnique({
        where: { id },
        include: {
          expense: {
            include: {
              user: true,
              category: true,
            },
          },
          approver: true,
        },
      });

      if (!approval) {
        return {
          success: false,
          error: {
            message: "Approval not found",
            code: "APPROVAL_NOT_FOUND",
          },
        };
      }

      return {
        success: true,
        data: this.toPublicApproval(approval),
      };
    } catch (error) {
      businessLogger.error("Failed to get approval", error as Error, {
        approvalId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve approval",
          code: "APPROVAL_FETCH_FAILED",
        },
      };
    }
  }

  // Get pending approvals for an approver
  static async getPendingApprovals(
    approverId: string,
    pagination: PaginationParams
  ): Promise<ServiceResult<PaginatedResult<ApprovalPublic>>> {
    try {
      const where = {
        approverId,
        status: "PENDING" as ApprovalStatus,
      };

      const total = await prisma.approval.count({ where });

      const approvals = await prisma.approval.findMany({
        where,
        include: {
          expense: {
            include: {
              user: true,
              category: true,
            },
          },
          approver: true,
        },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const approvalPublics = approvals.map((approval) =>
        this.toPublicApproval(approval)
      );

      return {
        success: true,
        data: {
          data: approvalPublics,
          meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit),
            hasNext: pagination.offset + pagination.limit < total,
            hasPrevious: pagination.page > 1,
          },
        },
      };
    } catch (error) {
      businessLogger.error("Failed to get pending approvals", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to retrieve pending approvals",
          code: "APPROVALS_FETCH_FAILED",
        },
      };
    }
  }

  // Approve expense
  static async approveExpense(
    approvalId: string,
    approverId: string,
    comment?: string
  ): Promise<ServiceResult<ApprovalPublic>> {
    try {
      // Update approval
      const approval = await prisma.approval.update({
        where: { id: approvalId },
        data: {
          status: "APPROVED" as ApprovalStatus,
          comment,
          processedAt: new Date(),
        },
        include: {
          expense: {
            include: {
              user: true,
            },
          },
          approver: true,
        },
      });

      // Update expense status
      await prisma.expense.update({
        where: { id: approval.expenseId },
        data: {
          status: "APPROVED",
        },
      });

      // Record metrics
      businessMetrics.expenseApproved(
        approval.expense.amount,
        approval.expense.currency,
        approverId
      );

      // Send notification email to expense owner
      await sendEmail({
        to: approval.expense.user.email,
        subject: "Expense Approved",
        html: `
          <h2>Your expense has been approved</h2>
          <p>Expense: ${approval.expense.description}</p>
          <p>Amount: ${approval.expense.currency} ${approval.expense.amount}</p>
          ${comment ? `<p>Comment: ${comment}</p>` : ""}
        `,
      }).catch((error) => {
        businessLogger.error("Failed to send approval email", error);
      });

      businessLogger.logApprovalEvent(
        "approved",
        approvalId,
        approval.expenseId,
        approverId,
        { comment }
      );

      return {
        success: true,
        data: this.toPublicApproval(approval),
      };
    } catch (error) {
      businessLogger.error("Failed to approve expense", error as Error, {
        approvalId,
      });
      return {
        success: false,
        error: {
          message: "Failed to approve expense",
          code: "EXPENSE_APPROVAL_FAILED",
        },
      };
    }
  }

  // Reject expense
  static async rejectExpense(
    approvalId: string,
    approverId: string,
    comment: string
  ): Promise<ServiceResult<ApprovalPublic>> {
    try {
      // Update approval
      const approval = await prisma.approval.update({
        where: { id: approvalId },
        data: {
          status: "REJECTED" as ApprovalStatus,
          comment,
          processedAt: new Date(),
        },
        include: {
          expense: {
            include: {
              user: true,
            },
          },
          approver: true,
        },
      });

      // Update expense status
      await prisma.expense.update({
        where: { id: approval.expenseId },
        data: {
          status: "REJECTED",
        },
      });

      // Record metrics
      businessMetrics.expenseRejected(
        approval.expense.amount,
        approval.expense.currency,
        comment
      );

      // Send notification email to expense owner
      await sendEmail({
        to: approval.expense.user.email,
        subject: "Expense Rejected",
        html: `
          <h2>Your expense has been rejected</h2>
          <p>Expense: ${approval.expense.description}</p>
          <p>Amount: ${approval.expense.currency} ${approval.expense.amount}</p>
          <p>Reason: ${comment}</p>
        `,
      }).catch((error) => {
        businessLogger.error("Failed to send rejection email", error);
      });

      businessLogger.logApprovalEvent(
        "rejected",
        approvalId,
        approval.expenseId,
        approverId,
        { comment }
      );

      return {
        success: true,
        data: this.toPublicApproval(approval),
      };
    } catch (error) {
      businessLogger.error("Failed to reject expense", error as Error, {
        approvalId,
      });
      return {
        success: false,
        error: {
          message: "Failed to reject expense",
          code: "EXPENSE_REJECTION_FAILED",
        },
      };
    }
  }

  // Get approvals for an expense
  static async getApprovalsForExpense(
    expenseId: string
  ): Promise<ServiceResult<ApprovalPublic[]>> {
    try {
      const approvals = await prisma.approval.findMany({
        where: { expenseId },
        include: {
          approver: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const approvalPublics = approvals.map((approval) =>
        this.toPublicApproval(approval)
      );

      return {
        success: true,
        data: approvalPublics,
      };
    } catch (error) {
      businessLogger.error(
        "Failed to get approvals for expense",
        error as Error,
        { expenseId }
      );
      return {
        success: false,
        error: {
          message: "Failed to retrieve approvals",
          code: "APPROVALS_FETCH_FAILED",
        },
      };
    }
  }

  // Get all approvals with filters
  static async getApprovals(
    filters: {
      approverId?: string;
      status?: string | string[];
      startDate?: string;
      endDate?: string;
    },
    pagination: PaginationParams
  ): Promise<ServiceResult<PaginatedResult<ApprovalPublic>>> {
    try {
      const where: any = {};

      if (filters.approverId) {
        where.approverId = filters.approverId;
      }

      if (filters.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) {
          where.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.createdAt.lte = new Date(filters.endDate);
        }
      }

      const total = await prisma.approval.count({ where });

      const approvals = await prisma.approval.findMany({
        where,
        include: {
          expense: {
            include: {
              user: true,
              category: true,
            },
          },
          approver: true,
        },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const approvalPublics = approvals.map((approval) =>
        this.toPublicApproval(approval)
      );

      return {
        success: true,
        data: {
          data: approvalPublics,
          meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit),
            hasNext: pagination.offset + pagination.limit < total,
            hasPrevious: pagination.page > 1,
          },
        },
      };
    } catch (error) {
      businessLogger.error("Failed to get approvals", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to retrieve approvals",
          code: "APPROVALS_FETCH_FAILED",
        },
      };
    }
  }

  // Bulk approve expenses
  static async bulkApproveExpenses(
    approvalIds: string[],
    approverId: string,
    comment?: string
  ): Promise<
    ServiceResult<{ succeeded: number; failed: number; errors: any[] }>
  > {
    try {
      const results = {
        succeeded: 0,
        failed: 0,
        errors: [] as any[],
      };

      for (const approvalId of approvalIds) {
        try {
          await this.approveExpense(approvalId, approverId, comment);
          results.succeeded++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            approvalId,
            error: (error as Error).message,
          });
        }
      }

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      businessLogger.error("Failed to bulk approve expenses", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to bulk approve expenses",
          code: "BULK_APPROVAL_FAILED",
        },
      };
    }
  }

  // Helper method to convert Approval to ApprovalPublic
  private static toPublicApproval(approval: any): ApprovalPublic {
    return approval as ApprovalPublic;
  }
}

export default ApprovalService;

import { prisma } from "@/lib/prisma";
import {
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

  // Enhanced methods for approval workflow management

  /**
   * Evaluate which approval rules apply to an expense
   */
  static async evaluateApprovalRules(
    expenseId: string,
    companyId: string
  ): Promise<ServiceResult<string[]>> {
    try {
      const expense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          companyId,
        },
        include: {
          submitter: true,
          category: true,
        },
      });

      if (!expense) {
        return {
          success: false,
          error: {
            message: "Expense not found",
            code: "EXPENSE_NOT_FOUND",
          },
        };
      }

      // Get all active approval rules for the company
      const rules = await prisma.approvalRule.findMany({
        where: {
          companyId,
          // TODO: Add isActive field to schema
        },
        include: {
          approvers: {
            include: {
              approver: true,
            },
          },
        },
      });

      const applicableRuleIds: string[] = [];

      for (const rule of rules) {
        // Check amount threshold condition
        // TODO: Parse conditions from database or add conditions field
        // For now, assume all rules apply
        applicableRuleIds.push(rule.id);
      }

      return {
        success: true,
        data: applicableRuleIds,
      };
    } catch (error) {
      businessLogger.error(
        "Failed to evaluate approval rules",
        error as Error,
        {
          expenseId,
          companyId,
        }
      );
      return {
        success: false,
        error: {
          message: "Failed to evaluate approval rules",
          code: "RULE_EVALUATION_FAILED",
        },
      };
    }
  }

  /**
   * Create approval chain based on applicable rules
   */
  static async createApprovalChain(
    expenseId: string,
    ruleIds: string[]
  ): Promise<ServiceResult<string[]>> {
    try {
      const approvalIds: string[] = [];

      for (const ruleId of ruleIds) {
        const rule = await prisma.approvalRule.findUnique({
          where: { id: ruleId },
          include: {
            approvers: {
              include: {
                approver: true,
              },
              orderBy: {
                sequenceOrder: "asc",
              },
            },
          },
        });

        if (!rule) continue;

        // Create approvals based on rule configuration
        if (rule.isSequenceRequired) {
          // Sequential approval - create one approval at a time
          const firstApprover = rule.approvers[0];
          if (firstApprover) {
            const approval = await prisma.expenseApproval.create({
              data: {
                expenseId,
                approverId: firstApprover.approverId,
                status: "PENDING",
              },
            });
            approvalIds.push(approval.id);
          }
        } else {
          // Parallel approval - create all approvals at once
          for (const approver of rule.approvers) {
            const approval = await prisma.expenseApproval.create({
              data: {
                expenseId,
                approverId: approver.approverId,
                status: "PENDING",
              },
            });
            approvalIds.push(approval.id);
          }
        }
      }

      return {
        success: true,
        data: approvalIds,
      };
    } catch (error) {
      businessLogger.error("Failed to create approval chain", error as Error, {
        expenseId,
        ruleIds,
      });
      return {
        success: false,
        error: {
          message: "Failed to create approval chain",
          code: "APPROVAL_CHAIN_CREATION_FAILED",
        },
      };
    }
  }

  /**
   * Process approval workflow for an expense
   */
  static async processApprovalWorkflow(
    expenseId: string,
    companyId: string
  ): Promise<ServiceResult<{ approvalIds: string[]; message: string }>> {
    try {
      // Evaluate applicable rules
      const rulesResult = await this.evaluateApprovalRules(
        expenseId,
        companyId
      );
      if (!rulesResult.success) {
        return rulesResult;
      }

      const applicableRules = rulesResult.data!;

      if (applicableRules.length === 0) {
        // No approval rules apply, auto-approve the expense
        await prisma.expense.update({
          where: { id: expenseId },
          data: { status: "APPROVED" },
        });

        return {
          success: true,
          data: {
            approvalIds: [],
            message: "Expense auto-approved (no approval rules apply)",
          },
        };
      }

      // Create approval chain
      const chainResult = await this.createApprovalChain(
        expenseId,
        applicableRules
      );
      if (!chainResult.success) {
        return chainResult;
      }

      // Update expense status to pending approval
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: "PENDING_APPROVAL" },
      });

      return {
        success: true,
        data: {
          approvalIds: chainResult.data!,
          message: `Approval workflow started with ${
            chainResult.data!.length
          } approval(s)`,
        },
      };
    } catch (error) {
      businessLogger.error(
        "Failed to process approval workflow",
        error as Error,
        {
          expenseId,
          companyId,
        }
      );
      return {
        success: false,
        error: {
          message: "Failed to process approval workflow",
          code: "APPROVAL_WORKFLOW_FAILED",
        },
      };
    }
  }

  /**
   * Check if all required approvals are complete
   */
  static async checkApprovalCompletion(
    expenseId: string
  ): Promise<ServiceResult<{ isComplete: boolean; status: string }>> {
    try {
      const approvals = await prisma.expenseApproval.findMany({
        where: { expenseId },
        include: {
          approver: true,
        },
      });

      if (approvals.length === 0) {
        return {
          success: true,
          data: { isComplete: true, status: "APPROVED" },
        };
      }

      const pendingApprovals = approvals.filter((a) => a.status === "PENDING");
      const rejectedApprovals = approvals.filter(
        (a) => a.status === "REJECTED"
      );

      // If any approval is rejected, the expense is rejected
      if (rejectedApprovals.length > 0) {
        return {
          success: true,
          data: { isComplete: true, status: "REJECTED" },
        };
      }

      // If no pending approvals, the expense is approved
      if (pendingApprovals.length === 0) {
        return {
          success: true,
          data: { isComplete: true, status: "APPROVED" },
        };
      }

      // Still pending approvals
      return {
        success: true,
        data: { isComplete: false, status: "PENDING_APPROVAL" },
      };
    } catch (error) {
      businessLogger.error(
        "Failed to check approval completion",
        error as Error,
        {
          expenseId,
        }
      );
      return {
        success: false,
        error: {
          message: "Failed to check approval completion",
          code: "APPROVAL_CHECK_FAILED",
        },
      };
    }
  }

  /**
   * Get approval statistics for a company
   */
  static async getApprovalStatistics(
    companyId: string,
    dateRange?: { startDate: Date; endDate: Date }
  ): Promise<
    ServiceResult<{
      totalApprovals: number;
      pendingApprovals: number;
      approvedApprovals: number;
      rejectedApprovals: number;
      averageApprovalTime: number;
    }>
  > {
    try {
      const whereClause: any = {
        expense: {
          companyId,
        },
      };

      if (dateRange) {
        whereClause.expense.createdAt = {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        };
      }

      const [
        totalApprovals,
        pendingApprovals,
        approvedApprovals,
        rejectedApprovals,
        processedApprovals,
      ] = await Promise.all([
        prisma.expenseApproval.count({ where: whereClause }),
        prisma.expenseApproval.count({
          where: { ...whereClause, status: "PENDING" },
        }),
        prisma.expenseApproval.count({
          where: { ...whereClause, status: "APPROVED" },
        }),
        prisma.expenseApproval.count({
          where: { ...whereClause, status: "REJECTED" },
        }),
        prisma.expenseApproval.findMany({
          where: {
            ...whereClause,
            status: { in: ["APPROVED", "REJECTED"] },
            processedAt: { not: null },
          },
          select: {
            processedAt: true,
            expense: {
              select: {
                createdAt: true,
              },
            },
          },
        }),
      ]);

      // Calculate average approval time
      let averageApprovalTime = 0;
      if (processedApprovals.length > 0) {
        const totalTime = processedApprovals.reduce((sum, approval) => {
          if (approval.processedAt) {
            const timeDiff =
              approval.processedAt.getTime() -
              approval.expense.createdAt.getTime();
            return sum + timeDiff;
          }
          return sum;
        }, 0);
        averageApprovalTime =
          totalTime / processedApprovals.length / (1000 * 60 * 60); // Convert to hours
      }

      return {
        success: true,
        data: {
          totalApprovals,
          pendingApprovals,
          approvedApprovals,
          rejectedApprovals,
          averageApprovalTime,
        },
      };
    } catch (error) {
      businessLogger.error(
        "Failed to get approval statistics",
        error as Error,
        {
          companyId,
        }
      );
      return {
        success: false,
        error: {
          message: "Failed to get approval statistics",
          code: "STATISTICS_FETCH_FAILED",
        },
      };
    }
  }
}

export default ApprovalService;

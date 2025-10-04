import { prisma } from "@/lib/prisma";
import { logger } from "@/middleware/logger";
import {
  CreateExpenseInput,
  UpdateExpenseInput,
  ListExpensesQueryInput,
  validateExpenseModification,
  validateExpenseAccess,
} from "@/lib/validations/expenses";
import {
  Company,
  User,
  Expense,
  ExpenseCategory,
  Receipt,
  ExpenseApproval,
} from "@prisma/client";
import { ApprovalService } from "./approval.service";
import { NotificationService } from "./notification.service";

/**
 * Enhanced Expense Service
 * Handles all business logic for expense management with role-based access control
 */

// Type definitions for filters and queries
type PrismaWhereFilter = Record<string, any>;
type PrismaOrderBy = Record<string, "asc" | "desc">;
type PrismaUpdateData = Record<string, any>;

interface ExpenseAnalyticsResponse {
  summary: {
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
  period: {
    startDate?: string;
    endDate?: string;
  };
}

// Extended types for service responses
export interface ExpenseWithDetails extends Expense {
  submitter?: Partial<User>;
  company?: Company;
  category?: ExpenseCategory;
  receipt?: Receipt | null;
  approvals?: Array<ExpenseApproval & { approver: Partial<User> }>;
}

export interface ExpenseListItem {
  id: string;
  submitterId: string;
  userName: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  status: string;
  expenseDate: Date;
  createdAt: Date;
  receiptCount: number;
}

export interface ExpenseListResponse {
  expenses: ExpenseListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
}

export interface ExpenseServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  warning?: string;
}

export class EnhancedExpenseService {
  /**
   * Create a new expense
   */
  static async createExpense(
    data: CreateExpenseInput,
    userId: string,
    companyId: string
  ): Promise<ExpenseServiceResponse<ExpenseWithDetails>> {
    try {
      // Validate category exists and is active for company
      const category = await prisma.expenseCategory.findFirst({
        where: {
          name: data.category,
          companyId: companyId,
        },
      });

      if (!category) {
        return {
          success: false,
          error:
            "Invalid expense category or category not available for your company",
        };
      }

      // Get company settings for validation
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: "Company not found",
        };
      }

      // Create expense using Prisma schema field names
      const expense = await prisma.expense.create({
        data: {
          submitterId: userId,
          companyId: companyId,
          categoryId: category.id,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          expenseDate: new Date(data.date),
          remarks: data.merchantName, // Using remarks field for merchant name
          status: "DRAFT",
        },
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          company: true,
          category: true,
          receipt: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // Handle receipt associations if provided
      if (data.receiptIds && data.receiptIds.length > 0) {
        // Note: Current schema supports one receipt per expense
        // If multiple receipts needed, schema would need modification
        if (data.receiptIds.length > 1) {
          return {
            success: false,
            error: "Current schema supports only one receipt per expense",
          };
        }

        // Update the receipt to associate with this expense
        await prisma.receipt.updateMany({
          where: {
            id: { in: data.receiptIds },
          },
          data: {
            expenseId: expense.id,
          },
        });
      }

      logger.info(`Expense created: ${expense.id}`, {
        expenseId: expense.id,
        userId,
        amount: expense.amount,
        currency: expense.currency,
      });

      return {
        success: true,
        data: expense,
      };
    } catch (error) {
      logger.error("Error creating expense:", error as Error);
      return {
        success: false,
        error: "Failed to create expense",
      };
    }
  }

  /**
   * List expenses with role-based filtering
   */
  static async listExpenses(
    query: ListExpensesQueryInput,
    userId: string,
    userRole: string,
    companyId: string
  ): Promise<ExpenseServiceResponse<ExpenseListResponse>> {
    try {
      // Build base filter
      const where: PrismaWhereFilter = {
        companyId: companyId,
      };

      // Apply role-based filtering
      if (userRole === "EMPLOYEE") {
        where.submitterId = userId;
      } else if (userRole === "MANAGER" && query.userId) {
        // Managers can filter by userId if they manage that user
        // For now, allow managers to see any user in their company
        where.submitterId = query.userId;
      } else if (userRole === "ADMIN" && query.userId) {
        where.submitterId = query.userId;
      }

      // Apply additional filters
      if (query.status) {
        where.status = query.status;
      }

      if (query.category) {
        where.category = {
          name: {
            contains: query.category,
            mode: "insensitive",
          },
        };
      }

      if (query.startDate || query.endDate) {
        where.expenseDate = {};
        if (query.startDate) {
          where.expenseDate.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.expenseDate.lte = new Date(query.endDate);
        }
      }

      if (query.minAmount || query.maxAmount) {
        where.amount = {};
        if (query.minAmount) {
          where.amount.gte = query.minAmount;
        }
        if (query.maxAmount) {
          where.amount.lte = query.maxAmount;
        }
      }

      if (query.merchantName) {
        where.remarks = {
          contains: query.merchantName,
          mode: "insensitive",
        };
      }

      // Calculate pagination
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Build sort order
      const orderBy: PrismaOrderBy = {};
      const sortField = query.sortBy || "createdAt";
      const sortOrder = query.sortOrder || "desc";

      if (sortField === "date") {
        orderBy.expenseDate = sortOrder;
      } else {
        orderBy[sortField] = sortOrder;
      }

      // Get expenses and total count
      const [expenses, totalCount] = await Promise.all([
        prisma.expense.findMany({
          where,
          include: {
            submitter: {
              select: {
                id: true,
                name: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
            receipt: {
              select: {
                id: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.expense.count({ where }),
      ]);

      // Get summary statistics
      const summary = await prisma.expense.aggregate({
        where: {
          companyId: companyId,
          ...(userRole === "EMPLOYEE" ? { submitterId: userId } : {}),
        },
        _sum: {
          amount: true,
        },
      });

      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        prisma.expense.count({
          where: {
            ...where,
            status: "PENDING_APPROVAL",
          },
        }),
        prisma.expense.count({
          where: {
            ...where,
            status: "APPROVED",
          },
        }),
        prisma.expense.count({
          where: {
            ...where,
            status: "REJECTED",
          },
        }),
      ]);

      // Format response
      const formattedExpenses: ExpenseListItem[] = expenses.map((expense) => ({
        id: expense.id,
        submitterId: expense.submitterId,
        userName: expense.submitter?.name || "Unknown",
        amount: Number(expense.amount),
        currency: expense.currency,
        category: expense.category?.name || "Unknown",
        description: expense.description,
        status: expense.status,
        expenseDate: expense.expenseDate,
        createdAt: expense.createdAt,
        receiptCount: expense.receipt ? 1 : 0,
      }));

      const response: ExpenseListResponse = {
        expenses: formattedExpenses,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          totalAmount: Number(summary._sum.amount || 0),
          pendingCount,
          approvedCount,
          rejectedCount,
        },
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      logger.error("Error listing expenses:", error as Error);
      return {
        success: false,
        error: "Failed to list expenses",
      };
    }
  }

  /**
   * Get expense details by ID
   */
  static async getExpenseById(
    expenseId: string,
    userId: string,
    userRole: string
  ): Promise<ExpenseServiceResponse<ExpenseWithDetails>> {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          company: true,
          category: true,
          receipt: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              processedAt: "desc",
            },
          },
        },
      });

      if (!expense) {
        return {
          success: false,
          error: "Expense not found",
        };
      }

      // Validate access permissions
      const accessValidation = validateExpenseAccess(
        userRole,
        userId,
        expense.submitterId
      );

      if (!accessValidation.success) {
        return {
          success: false,
          error: accessValidation.error,
        };
      }

      return {
        success: true,
        data: expense,
      };
    } catch (error) {
      logger.error("Error retrieving expense:", error as Error);
      return {
        success: false,
        error: "Failed to retrieve expense",
      };
    }
  }

  /**
   * Update expense
   */
  static async updateExpense(
    expenseId: string,
    data: UpdateExpenseInput,
    userId: string
  ): Promise<ExpenseServiceResponse<ExpenseWithDetails>> {
    try {
      // Get existing expense
      const existingExpense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          category: true,
        },
      });

      if (!existingExpense) {
        return {
          success: false,
          error: "Expense not found",
        };
      }

      // Validate ownership
      if (existingExpense.submitterId !== userId) {
        return {
          success: false,
          error: "Access denied: You can only update your own expenses",
        };
      }

      // Validate modification permissions
      const modificationValidation = validateExpenseModification(
        existingExpense.status,
        "update"
      );

      if (!modificationValidation.success) {
        return {
          success: false,
          error: modificationValidation.error,
        };
      }

      // Prepare update data
      const updateData: PrismaUpdateData = {};

      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.date !== undefined) updateData.expenseDate = new Date(data.date);
      if (data.merchantName !== undefined)
        updateData.remarks = data.merchantName;

      // Handle category update
      if (data.category !== undefined) {
        const category = await prisma.expenseCategory.findFirst({
          where: {
            name: data.category,
            companyId: existingExpense.companyId,
          },
        });

        if (!category) {
          return {
            success: false,
            error: "Invalid expense category",
          };
        }

        updateData.categoryId = category.id;
      }

      // Update expense
      const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          company: true,
          category: true,
          receipt: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      logger.info(`Expense updated: ${expenseId}`, {
        expenseId,
        userId,
        changes: Object.keys(updateData),
      });

      return {
        success: true,
        data: updatedExpense,
      };
    } catch (error) {
      logger.error("Error updating expense:", error as Error);
      return {
        success: false,
        error: "Failed to update expense",
      };
    }
  }

  /**
   * Delete expense
   */
  static async deleteExpense(
    expenseId: string,
    userId: string
  ): Promise<ExpenseServiceResponse<{ message: string }>> {
    try {
      // Get existing expense
      const existingExpense = await prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (!existingExpense) {
        return {
          success: false,
          error: "Expense not found",
        };
      }

      // Validate ownership
      if (existingExpense.submitterId !== userId) {
        return {
          success: false,
          error: "Access denied: You can only delete your own expenses",
        };
      }

      // Validate modification permissions
      const modificationValidation = validateExpenseModification(
        existingExpense.status,
        "delete"
      );

      if (!modificationValidation.success) {
        return {
          success: false,
          error: modificationValidation.error,
        };
      }

      // Delete expense (cascade deletes receipts and approvals)
      await prisma.expense.delete({
        where: { id: expenseId },
      });

      logger.info(`Expense deleted: ${expenseId}`, {
        expenseId,
        userId,
      });

      return {
        success: true,
        data: { message: "Expense deleted successfully" },
      };
    } catch (error) {
      logger.error("Error deleting expense:", error as Error);
      return {
        success: false,
        error: "Failed to delete expense",
      };
    }
  }

  /**
   * Submit expense for approval
   */
  static async submitExpense(
    expenseId: string,
    userId: string
  ): Promise<ExpenseServiceResponse<ExpenseWithDetails>> {
    try {
      // Get existing expense
      const existingExpense = await prisma.expense.findUnique({
        where: { id: expenseId },
        include: {
          receipt: true,
          company: true,
        },
      });

      if (!existingExpense) {
        return {
          success: false,
          error: "Expense not found",
        };
      }

      // Validate ownership
      if (existingExpense.submitterId !== userId) {
        return {
          success: false,
          error: "Access denied: You can only submit your own expenses",
        };
      }

      // Validate submission permissions
      const submissionValidation = validateExpenseModification(
        existingExpense.status,
        "submit"
      );

      if (!submissionValidation.success) {
        return {
          success: false,
          error: submissionValidation.error,
        };
      }

      // Validate receipt requirements (basic validation)
      const hasReceipt = !!existingExpense.receipt;
      if (Number(existingExpense.amount) > 25 && !hasReceipt) {
        return {
          success: false,
          error: "Expenses over $25 require at least one receipt",
        };
      }

      // Update expense status
      const updatedExpense = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          status: "PENDING_APPROVAL",
          updatedAt: new Date(),
        },
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          company: true,
          category: true,
          receipt: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      // Create approval workflow
      try {
        // Evaluate which approval rules apply to this expense
        const rulesResult = await ApprovalService.evaluateApprovalRules(
          expenseId,
          existingExpense.companyId
        );

        if (
          rulesResult.success &&
          rulesResult.data &&
          rulesResult.data.length > 0
        ) {
          // Create approval chain based on applicable rules
          const chainResult = await ApprovalService.createApprovalChain(
            expenseId,
            rulesResult.data
          );

          if (chainResult.success) {
            logger.info(`Approval workflow created for expense: ${expenseId}`, {
              approvalIds: chainResult.data,
              ruleIds: rulesResult.data,
            });

            // Get approver IDs from the created approval chain
            const approverIds = await prisma.expenseApproval.findMany({
              where: { expenseId },
              select: { approverId: true },
            });

            // Send notification about expense submission
            await NotificationService.notifyExpenseSubmitted(
              expenseId,
              Number(existingExpense.amount),
              existingExpense.currency,
              updatedExpense.submitter.name || "Unknown User",
              approverIds.map((a) => a.approverId)
            );
          } else {
            logger.warn(
              `Failed to create approval chain for expense: ${expenseId}`,
              {
                error: chainResult.error,
              }
            );
          }
        } else {
          // No approval rules found - auto-approve or require manual setup
          logger.warn(`No approval rules found for expense: ${expenseId}`, {
            companyId: existingExpense.companyId,
          });

          // For now, leave in PENDING_APPROVAL status
          // In production, might want to auto-approve or require admin intervention
        }
      } catch (approvalError) {
        // Log approval workflow error but don't fail the submission
        logger.error(
          `Approval workflow setup failed for expense: ${expenseId}`,
          approvalError as Error
        );
      }

      logger.info(`Expense submitted for approval: ${expenseId}`, {
        expenseId,
        userId,
        amount: existingExpense.amount,
      });

      return {
        success: true,
        data: updatedExpense,
      };
    } catch (error) {
      logger.error("Error submitting expense:", error as Error);
      return {
        success: false,
        error: "Failed to submit expense for approval",
      };
    }
  }

  /**
   * Get expense analytics
   */
  static async getExpenseAnalytics(
    companyId: string,
    userId: string,
    userRole: string,
    startDate?: string,
    endDate?: string
  ): Promise<ExpenseServiceResponse<ExpenseAnalyticsResponse>> {
    try {
      // Build base filter
      const where: PrismaWhereFilter = {
        companyId: companyId,
      };

      // Apply role-based filtering
      if (userRole === "EMPLOYEE") {
        where.submitterId = userId;
      }

      // Apply date filters
      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) {
          where.expenseDate.gte = new Date(startDate);
        }
        if (endDate) {
          where.expenseDate.lte = new Date(endDate);
        }
      }

      // Get basic analytics
      const [totalStats, statusStats, categoryStats] = await Promise.all([
        prisma.expense.aggregate({
          where,
          _sum: { amount: true },
          _avg: { amount: true },
          _count: true,
        }),
        prisma.expense.groupBy({
          by: ["status"],
          where,
          _count: true,
          _sum: { amount: true },
        }),
        prisma.expense.groupBy({
          by: ["categoryId"],
          where,
          _count: true,
          _sum: { amount: true },
        }),
      ]);

      // Get category details
      const categories = await prisma.expenseCategory.findMany({
        where: { companyId },
        select: { id: true, name: true },
      });

      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

      // Format category stats
      const formattedCategoryStats = categoryStats.map((stat) => ({
        category: categoryMap.get(stat.categoryId) || "Unknown",
        count: stat._count,
        amount: Number(stat._sum.amount || 0),
      }));

      const analytics = {
        summary: {
          totalExpenses: totalStats._count,
          totalAmount: Number(totalStats._sum.amount || 0),
          averageAmount: Number(totalStats._avg.amount || 0),
        },
        byStatus: statusStats.map((stat) => ({
          status: stat.status,
          count: stat._count,
          amount: Number(stat._sum.amount || 0),
        })),
        byCategory: formattedCategoryStats,
        period: {
          startDate,
          endDate,
        },
      };

      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      logger.error("Error retrieving expense analytics:", error as Error);
      return {
        success: false,
        error: "Failed to retrieve expense analytics",
      };
    }
  }

  /**
   * Validate user can access expense
   */
  static async validateExpenseAccess(
    expenseId: string,
    userId: string,
    userRole: string
  ): Promise<ExpenseServiceResponse<{ canAccess: boolean; expense: Expense }>> {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (!expense) {
        return {
          success: false,
          error: "Expense not found",
        };
      }

      const accessValidation = validateExpenseAccess(
        userRole,
        userId,
        expense.submitterId
      );

      return {
        success: true,
        data: {
          canAccess: accessValidation.success,
          expense,
        },
      };
    } catch (error) {
      logger.error("Error validating expense access:", error as Error);
      return {
        success: false,
        error: "Failed to validate expense access",
      };
    }
  }
}

export default EnhancedExpenseService;

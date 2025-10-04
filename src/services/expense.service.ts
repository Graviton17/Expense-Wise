import { prisma } from "@/lib/prisma";
import { expenseCache } from "@/lib/cache";
import {
  Expense,
  ExpensePublic,
  ExpenseStatus,
  ServiceResult,
  PaginatedResult,
  ExpenseFilters,
  PaginationParams,
} from "@/types";
import { businessLogger } from "@/middleware/logger";
import { businessMetrics } from "@/middleware/metrics";

export class ExpenseService {
  // Create a new expense
  static async createExpense(data: {
    userId: string;
    companyId: string;
    categoryId: string;
    amount: number;
    currency: string;
    description: string;
    date: string;
    merchantName?: string;
  }): Promise<ServiceResult<ExpensePublic>> {
    try {
      const expense = await prisma.expense.create({
        data: {
          ...data,
          date: new Date(data.date),
          status: "DRAFT" as ExpenseStatus,
        },
        include: {
          user: true,
          company: true,
          category: true,
        },
      });

      // Record metrics
      businessMetrics.expenseCreated(
        expense.amount,
        expense.currency,
        expense.categoryId
      );

      // Log business event
      businessLogger.logExpenseEvent("created", expense.id, expense.userId, {
        amount: expense.amount,
        currency: expense.currency,
      });

      // Clear cache
      await expenseCache.del(`expenses:user:${data.userId}`);
      await expenseCache.del(`expenses:company:${data.companyId}`);

      return {
        success: true,
        data: this.toPublicExpense(expense),
      };
    } catch (error) {
      businessLogger.error("Failed to create expense", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to create expense",
          code: "EXPENSE_CREATION_FAILED",
        },
      };
    }
  }

  // Get expense by ID
  static async getExpenseById(
    id: string
  ): Promise<ServiceResult<ExpensePublic>> {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id },
        include: {
          user: true,
          company: true,
          category: true,
          receipts: true,
          approvals: {
            include: {
              approver: true,
            },
          },
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

      return {
        success: true,
        data: this.toPublicExpense(expense),
      };
    } catch (error) {
      businessLogger.error("Failed to get expense", error as Error, {
        expenseId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve expense",
          code: "EXPENSE_FETCH_FAILED",
        },
      };
    }
  }

  // Get expenses with pagination and filters
  static async getExpenses(
    filters: ExpenseFilters,
    pagination: PaginationParams,
    requestingUserId: string
  ): Promise<ServiceResult<PaginatedResult<ExpensePublic>>> {
    try {
      const where: any = {};

      // Apply filters
      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.companyId) {
        where.companyId = filters.companyId;
      }

      if (filters.status) {
        where.status = Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status;
      }

      if (filters.dateRange?.from || filters.dateRange?.to) {
        where.date = {};
        if (filters.dateRange.from) {
          where.date.gte = new Date(filters.dateRange.from);
        }
        if (filters.dateRange.to) {
          where.date.lte = new Date(filters.dateRange.to);
        }
      }

      if (filters.amountRange?.min || filters.amountRange?.max) {
        where.amount = {};
        if (filters.amountRange.min) {
          where.amount.gte = filters.amountRange.min;
        }
        if (filters.amountRange.max) {
          where.amount.lte = filters.amountRange.max;
        }
      }

      if (filters.search) {
        where.OR = [
          { description: { contains: filters.search, mode: "insensitive" } },
          { merchantName: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Get total count
      const total = await prisma.expense.count({ where });

      // Get expenses
      const expenses = await prisma.expense.findMany({
        where,
        include: {
          user: true,
          company: true,
          category: true,
          receipts: true,
        },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const expensePublics = expenses.map((expense) =>
        this.toPublicExpense(expense)
      );

      return {
        success: true,
        data: {
          data: expensePublics,
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
      businessLogger.error("Failed to get expenses", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to retrieve expenses",
          code: "EXPENSES_FETCH_FAILED",
        },
      };
    }
  }

  // Update expense
  static async updateExpense(
    id: string,
    data: {
      categoryId?: string;
      amount?: number;
      currency?: string;
      description?: string;
      date?: string;
      merchantName?: string;
    },
    updatedBy: string
  ): Promise<ServiceResult<ExpensePublic>> {
    try {
      // Check if expense exists and is editable
      const existingExpense = await prisma.expense.findUnique({
        where: { id },
      });

      if (!existingExpense) {
        return {
          success: false,
          error: {
            message: "Expense not found",
            code: "EXPENSE_NOT_FOUND",
          },
        };
      }

      if (existingExpense.status !== "DRAFT") {
        return {
          success: false,
          error: {
            message: "Cannot edit expense that has been submitted",
            code: "EXPENSE_NOT_EDITABLE",
          },
        };
      }

      const updateData: any = { ...data };
      if (data.date) {
        updateData.date = new Date(data.date);
      }

      const expense = await prisma.expense.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          company: true,
          category: true,
        },
      });

      // Clear cache
      await expenseCache.del(`expenses:user:${expense.userId}`);
      await expenseCache.del(`expenses:company:${expense.companyId}`);

      businessLogger.logExpenseEvent("updated", id, updatedBy, {
        changes: data,
      });

      return {
        success: true,
        data: this.toPublicExpense(expense),
      };
    } catch (error) {
      businessLogger.error("Failed to update expense", error as Error, {
        expenseId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to update expense",
          code: "EXPENSE_UPDATE_FAILED",
        },
      };
    }
  }

  // Submit expense for approval
  static async submitExpense(
    id: string,
    submittedBy: string
  ): Promise<ServiceResult<ExpensePublic>> {
    try {
      const expense = await prisma.expense.update({
        where: { id },
        data: {
          status: "PENDING_APPROVAL" as ExpenseStatus,
          submittedAt: new Date(),
        },
        include: {
          user: true,
          company: true,
          category: true,
        },
      });

      // Record metrics
      businessMetrics.expenseSubmitted(expense.amount, expense.currency);

      // Clear cache
      await expenseCache.del(`expenses:user:${expense.userId}`);
      await expenseCache.del(`expenses:company:${expense.companyId}`);

      businessLogger.logExpenseEvent("submitted", id, submittedBy);

      return {
        success: true,
        data: this.toPublicExpense(expense),
      };
    } catch (error) {
      businessLogger.error("Failed to submit expense", error as Error, {
        expenseId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to submit expense",
          code: "EXPENSE_SUBMISSION_FAILED",
        },
      };
    }
  }

  // Delete expense (only if in draft status)
  static async deleteExpense(
    id: string,
    deletedBy: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const expense = await prisma.expense.findUnique({
        where: { id },
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

      if (expense.status !== "DRAFT") {
        return {
          success: false,
          error: {
            message: "Cannot delete expense that has been submitted",
            code: "EXPENSE_NOT_DELETABLE",
          },
        };
      }

      await prisma.expense.delete({
        where: { id },
      });

      // Clear cache
      await expenseCache.del(`expenses:user:${expense.userId}`);
      await expenseCache.del(`expenses:company:${expense.companyId}`);

      businessLogger.logExpenseEvent("deleted", id, deletedBy);

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      businessLogger.error("Failed to delete expense", error as Error, {
        expenseId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to delete expense",
          code: "EXPENSE_DELETION_FAILED",
        },
      };
    }
  }

  // Get expenses summary/statistics
  static async getExpensesSummary(
    userId?: string,
    companyId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<
    ServiceResult<{
      totalAmount: number;
      totalCount: number;
      avgAmount: number;
      byStatus: { status: string; count: number; amount: number }[];
      byCategory: {
        categoryId: string;
        categoryName: string;
        count: number;
        amount: number;
      }[];
    }>
  > {
    try {
      const where: any = {};

      if (userId) where.userId = userId;
      if (companyId) where.companyId = companyId;

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      // This would require raw SQL queries or aggregation
      // For now, return a basic structure
      const expenses = await prisma.expense.findMany({
        where,
        include: {
          category: true,
        },
      });

      const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalCount = expenses.length;
      const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;

      // Group by status
      const byStatus = expenses.reduce((acc: any[], exp) => {
        const existing = acc.find((item) => item.status === exp.status);
        if (existing) {
          existing.count += 1;
          existing.amount += exp.amount;
        } else {
          acc.push({ status: exp.status, count: 1, amount: exp.amount });
        }
        return acc;
      }, []);

      // Group by category
      const byCategory = expenses.reduce((acc: any[], exp) => {
        const existing = acc.find((item) => item.categoryId === exp.categoryId);
        if (existing) {
          existing.count += 1;
          existing.amount += exp.amount;
        } else {
          acc.push({
            categoryId: exp.categoryId,
            categoryName: exp.category?.name || "Unknown",
            count: 1,
            amount: exp.amount,
          });
        }
        return acc;
      }, []);

      return {
        success: true,
        data: {
          totalAmount,
          totalCount,
          avgAmount,
          byStatus,
          byCategory,
        },
      };
    } catch (error) {
      businessLogger.error("Failed to get expenses summary", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to retrieve expenses summary",
          code: "EXPENSES_SUMMARY_FAILED",
        },
      };
    }
  }

  // Helper method to convert Expense to ExpensePublic
  private static toPublicExpense(expense: any): ExpensePublic {
    return expense as ExpensePublic;
  }
}

export default ExpenseService;

import { prisma } from "@/lib/prisma";
import { AuthorizationError, NotFoundError } from "@/middleware/error-handler";
import type {
  DashboardQueryInput,
  ExportReportInput,
  SummaryQueryInput,
  ExpenseReportQueryInput,
} from "@/lib/validations/reports";
import { calculateDateRange } from "@/lib/validations/reports";
import { Prisma } from "@prisma/client";

/**
 * Reports service for handling analytics and export functionality
 */
export class ReportsService {
  /**
   * Get dashboard analytics data
   */
  static async getDashboardAnalytics(
    companyId: string,
    params: DashboardQueryInput,
    requestingUserId: string,
    userRole: string
  ) {
    const { startDate, endDate } = calculateDateRange(
      params.period,
      params.startDate,
      params.endDate
    );

    // Build where clause based on permissions
    const baseWhere: Prisma.ExpenseWhereInput = {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // If user is not ADMIN and specifies userId, validate access
    if (
      params.userId &&
      userRole !== "ADMIN" &&
      params.userId !== requestingUserId
    ) {
      // For managers, validate they can access this user's data
      if (userRole === "MANAGER") {
        const subordinate = await prisma.user.findFirst({
          where: {
            id: params.userId,
            companyId,
            managerId: requestingUserId,
          },
        });

        if (!subordinate) {
          throw new AuthorizationError("User not found or not a subordinate");
        }
      } else {
        throw new AuthorizationError("Insufficient permissions");
      }
    }

    // Add user filter if specified
    const whereClause = params.userId
      ? { ...baseWhere, submitterId: params.userId }
      : userRole === "EMPLOYEE"
      ? { ...baseWhere, submitterId: requestingUserId }
      : baseWhere;

    // Get expense summaries
    const [totalExpenses, expensesByStatus, expensesByCategory] =
      await Promise.all([
        // Total expenses summary
        prisma.expense.aggregate({
          where: whereClause,
          _count: { id: true },
          _sum: { amount: true },
        }),

        // Expenses by status
        prisma.expense.groupBy({
          by: ["status"],
          where: whereClause,
          _count: { id: true },
          _sum: { amount: true },
        }),

        // Expenses by category
        prisma.expense.groupBy({
          by: ["categoryId"],
          where: whereClause,
          _count: { id: true },
          _sum: { amount: true },
        }),
      ]);

    // Get category names for category breakdown
    const categoryIds = expensesByCategory
      .map((item: any) => item.categoryId)
      .filter(Boolean);
    const categories =
      categoryIds.length > 0
        ? await prisma.expenseCategory.findMany({
            where: {
              id: { in: categoryIds },
              companyId,
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [];

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

    // Get monthly trends and top spenders
    const monthlyTrends = await ReportsService.getMonthlyTrends(
      companyId,
      startDate,
      endDate,
      params.userId,
      userRole,
      requestingUserId
    );
    const topSpenders =
      userRole !== "EMPLOYEE"
        ? await ReportsService.getTopSpenders(
            companyId,
            startDate,
            endDate,
            params.userId
          )
        : [];

    return {
      summary: {
        totalExpenses: totalExpenses._count.id || 0,
        totalAmount: Number(totalExpenses._sum.amount) || 0,
        averageExpense: totalExpenses._count.id
          ? Number(totalExpenses._sum.amount || 0) / totalExpenses._count.id
          : 0,
      },
      statusBreakdown: expensesByStatus.map((item: any) => ({
        status: item.status,
        count: item._count.id,
        amount: Number(item._sum.amount) || 0,
      })),
      categoryBreakdown: expensesByCategory.map((item: any) => {
        const category = categoryMap.get(item.categoryId);
        return {
          categoryId: item.categoryId,
          categoryName: category?.name || "Unknown",
          count: item._count.id,
          amount: Number(item._sum.amount) || 0,
        };
      }),
      monthlyTrends,
      topSpenders,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: params.period,
      },
    };
  }

  /**
   * Helper method to get monthly trends
   */
  private static async getMonthlyTrends(
    companyId: string,
    startDate: Date,
    endDate: Date,
    userId?: string,
    userRole?: string,
    requestingUserId?: string
  ) {
    const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    // Build the base query
    let whereConditions = `"companyId" = '${companyId}' AND "createdAt" >= '${yearAgo.toISOString()}' AND "createdAt" <= '${endDate.toISOString()}'`;

    if (userId) {
      whereConditions += ` AND "submitterId" = '${userId}'`;
    } else if (userRole === "EMPLOYEE") {
      whereConditions += ` AND "submitterId" = '${requestingUserId}'`;
    }

    const trends = await prisma.$queryRaw<
      Array<{
        month: Date;
        count: number;
        total: number;
      }>
    >`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as count,
        SUM("amount")::float as total
      FROM "Expense" 
      WHERE ${Prisma.raw(whereConditions)}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return trends;
  }

  /**
   * Helper method to get top spenders
   */
  private static async getTopSpenders(
    companyId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ) {
    let whereConditions = `u."companyId" = '${companyId}' AND e."createdAt" >= '${startDate.toISOString()}' AND e."createdAt" <= '${endDate.toISOString()}'`;

    if (userId) {
      whereConditions += ` AND u.id = '${userId}'`;
    }

    const spenders = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        email: string;
        expenseCount: number;
        totalAmount: number;
      }>
    >`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(e.id)::int as "expenseCount",
        SUM(e.amount)::float as "totalAmount"
      FROM "User" u
      INNER JOIN "Expense" e ON u.id = e."submitterId"
      WHERE ${Prisma.raw(whereConditions)}
      GROUP BY u.id, u.name, u.email
      ORDER BY "totalAmount" DESC
      LIMIT 10
    `;

    return spenders;
  }

  /**
   * Get detailed expense report with pagination
   */
  static async getExpenseReport(
    companyId: string,
    params: ExpenseReportQueryInput,
    requestingUserId: string,
    userRole: string
  ) {
    const { page, limit, ...filters } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const baseWhere: Prisma.ExpenseWhereInput = {
      companyId,
    };

    // Add date filters
    if (filters.startDate || filters.endDate) {
      baseWhere.createdAt = {};
      if (filters.startDate) {
        baseWhere.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        baseWhere.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Add other filters
    if (filters.status) {
      baseWhere.status = filters.status;
    }
    if (filters.categoryId) {
      baseWhere.categoryId = filters.categoryId;
    }

    // Handle user access
    if (filters.userId) {
      if (userRole !== "ADMIN" && filters.userId !== requestingUserId) {
        if (userRole === "MANAGER") {
          // Validate manager can access this user
          const subordinate = await prisma.user.findFirst({
            where: {
              id: filters.userId,
              companyId,
              managerId: requestingUserId,
            },
          });

          if (!subordinate) {
            throw new AuthorizationError("User not found or not a subordinate");
          }
        } else {
          throw new AuthorizationError("Insufficient permissions");
        }
      }
      baseWhere.submitterId = filters.userId;
    } else if (userRole === "EMPLOYEE") {
      baseWhere.submitterId = requestingUserId;
    }

    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where: baseWhere,
        include: {
          submitter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          receipt: {
            select: {
              id: true,
              fileName: true,
              url: true,
              fileType: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.expense.count({
        where: baseWhere,
      }),
    ]);

    return {
      expenses,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: {
        ...filters,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
      },
    };
  }

  /**
   * Create export task (simplified without database storage for now)
   */
  static async createExportTask(
    companyId: string,
    params: ExportReportInput,
    requestingUserId: string,
    userRole: string
  ) {
    // Validate access to the requested user data
    if (
      params.filters.userId &&
      userRole !== "ADMIN" &&
      params.filters.userId !== requestingUserId
    ) {
      if (userRole === "MANAGER") {
        const subordinate = await prisma.user.findFirst({
          where: {
            id: params.filters.userId,
            companyId,
            managerId: requestingUserId,
          },
        });

        if (!subordinate) {
          throw new AuthorizationError("User not found or not a subordinate");
        }
      } else {
        throw new AuthorizationError("Insufficient permissions");
      }
    }

    // Generate a task ID
    const taskId = crypto.randomUUID();

    // TODO: Store export task in database when ExportTask model is added
    // TODO: Queue the export job for background processing
    // For now, we'll return the task ID and simulate processing

    return {
      taskId,
      status: "PROCESSING",
      message:
        "Export task created successfully. Use the task ID to check status.",
    };
  }

  /**
   * Get export task status (simplified without database for now)
   */
  static async getExportStatus(
    taskId: string,
    _companyId: string,
    _requestingUserId: string
  ) {
    // TODO: Retrieve from database when ExportTask model is added
    // For now, simulate a completed export

    if (!taskId) {
      throw new NotFoundError("Export task not found");
    }

    // Simulate export completion
    return {
      taskId,
      status: "COMPLETED",
      format: "CSV",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      downloadUrl: `/api/reports/download/${taskId}`,
      error: null,
    };
  }

  /**
   * Get summary statistics for a period
   */
  static async getSummaryStats(
    companyId: string,
    params: SummaryQueryInput,
    requestingUserId: string,
    userRole: string
  ) {
    const { startDate, endDate } = calculateDateRange(
      params.period,
      params.startDate,
      params.endDate
    );

    const whereClause: Prisma.ExpenseWhereInput = {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Handle user access
    if (params.userId) {
      if (userRole !== "ADMIN" && params.userId !== requestingUserId) {
        if (userRole === "MANAGER") {
          const subordinate = await prisma.user.findFirst({
            where: {
              id: params.userId,
              companyId,
              managerId: requestingUserId,
            },
          });

          if (!subordinate) {
            throw new AuthorizationError("User not found or not a subordinate");
          }
        } else {
          throw new AuthorizationError("Insufficient permissions");
        }
      }
      whereClause.submitterId = params.userId;
    } else if (userRole === "EMPLOYEE") {
      whereClause.submitterId = requestingUserId;
    }

    const summary = await prisma.expense.aggregate({
      where: whereClause,
      _count: { id: true },
      _sum: { amount: true },
      _avg: { amount: true },
      _max: { amount: true },
      _min: { amount: true },
    });

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: params.period,
      },
      summary: {
        totalExpenses: summary._count.id || 0,
        totalAmount: Number(summary._sum.amount) || 0,
        averageAmount: Number(summary._avg.amount) || 0,
        maxAmount: Number(summary._max.amount) || 0,
        minAmount: Number(summary._min.amount) || 0,
      },
    };
  }
}

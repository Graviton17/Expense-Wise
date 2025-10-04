import { prisma } from "@/lib/prisma";
import { Company, User, Expense, ApprovalRule } from "@prisma/client";
import {
  CreateCompanyInput,
  UpdateCompanyInput,
  UpdateCompanySettingsInput,
  CompanyStatsQueryInput,
  validateCompanyNameFormat,
  validateCurrencyChange,
  validateExpenseCategories,
} from "@/lib/validations/companies";
import { logger } from "@/middleware/logger";
import bcrypt from "bcryptjs";

/**
 * Company Service
 * Handles all business logic for company management
 * Note: Based on current Prisma schema - Company model has: id, name, country, baseCurrency, createdAt, updatedAt
 */

// Extended types for service responses
export interface CompanyWithDetails extends Company {
  users?: Partial<User>[];
  expenses?: Expense[];
  approvalRules?: ApprovalRule[];
  _count?: {
    users: number;
    expenses: number;
    approvalRules: number;
  };
}

export interface CompanyStats {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseAmount: number;
  averageExpenseAmount: number;
  pendingApprovals: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  expensesByCategory: Array<{
    category: string;
    count: number;
    amount: number;
  }>;
  expensesByMonth: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface CompanyServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  warning?: string;
}

export class CompanyService {
  /**
   * Retrieve company profile by ID
   */
  static async getCompanyProfile(
    companyId: string,
    options: {
      includeSettings?: boolean;
      includeStats?: boolean;
      includeUsers?: boolean;
    } = {}
  ): Promise<CompanyServiceResponse<CompanyWithDetails>> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          users: options.includeUsers
            ? {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  createdAt: true,
                },
              }
            : false,
          _count: options.includeStats
            ? {
                select: {
                  users: true,
                  expenses: true,
                  approvalRules: true,
                },
              }
            : false,
        },
      });

      if (!company) {
        return {
          success: false,
          error: "Company not found",
        };
      }

      logger.info(`Company profile retrieved: ${companyId}`, {
        companyId,
        includeSettings: options.includeSettings,
        includeStats: options.includeStats,
      });

      return {
        success: true,
        data: company,
      };
    } catch (error) {
      logger.error("Error retrieving company profile:", error as Error);
      return {
        success: false,
        error: "Failed to retrieve company profile",
      };
    }
  }

  /**
   * Create a new company with optional admin user
   * Note: Only basic company fields are created based on current schema
   */
  static async createCompany(
    data: CreateCompanyInput,
    createdBy?: string
  ): Promise<CompanyServiceResponse<Company>> {
    try {
      // Validate company name format
      const nameValidation = validateCompanyNameFormat(data.name);
      if (!nameValidation.success) {
        return {
          success: false,
          error: nameValidation.error,
        };
      }

      // Check for company name uniqueness
      const existingCompany = await prisma.company.findFirst({
        where: {
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
        },
      });

      if (existingCompany) {
        return {
          success: false,
          error: "A company with this name already exists",
        };
      }

      // Validate expense categories if provided
      if (data.settings?.expenseCategories) {
        const categoryValidation = validateExpenseCategories(
          data.settings.expenseCategories
        );
        if (!categoryValidation.success) {
          return {
            success: false,
            errors: categoryValidation.errors,
          };
        }
      }

      // Use transaction for company creation with admin user
      const result = await prisma.$transaction(async (tx) => {
        // Create company with basic fields only
        const company = await tx.company.create({
          data: {
            name: data.name.trim(),
            country: data.country,
            baseCurrency: data.baseCurrency,
          },
        });

        // Create admin user if provided
        if (data.adminUser) {
          const hashedPassword = await bcrypt.hash(data.adminUser.password, 12);

          await tx.user.create({
            data: {
              name: data.adminUser.name.trim(),
              email: data.adminUser.email.toLowerCase().trim(),
              password: hashedPassword,
              role: "ADMIN",
              companyId: company.id,
            },
          });
        }

        // Create default expense categories
        const categories = data.settings?.expenseCategories || [
          "Travel",
          "Meals",
          "Office Supplies",
          "Equipment",
          "Software",
          "Training",
          "Marketing",
          "Utilities",
        ];

        await tx.expenseCategory.createMany({
          data: categories.map((name) => ({
            name: name.trim(),
            companyId: company.id,
          })),
        });

        return company;
      });

      logger.info(`Company created successfully: ${result.id}`, {
        companyId: result.id,
        companyName: result.name,
        createdBy,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      logger.error("Error creating company:", error as Error);

      // Handle specific database errors
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        return {
          success: false,
          error: "A company with this name already exists",
        };
      }

      return {
        success: false,
        error: "Failed to create company",
      };
    }
  }

  /**
   * Update company profile
   * Note: Only basic company fields can be updated based on current schema
   */
  static async updateCompany(
    companyId: string,
    data: UpdateCompanyInput,
    updatedBy: string,
    userRole: string
  ): Promise<CompanyServiceResponse<Company>> {
    try {
      // Check if company exists
      const existingCompany = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          expenses: {
            select: { id: true },
            take: 1, // Just check if any expenses exist
          },
        },
      });

      if (!existingCompany) {
        return {
          success: false,
          error: "Company not found",
        };
      }

      // Validate role permissions
      if (userRole !== "ADMIN") {
        return {
          success: false,
          error:
            "Access denied: Only company admins can update company information",
        };
      }

      // Validate company name if being updated
      if (data.name) {
        const nameValidation = validateCompanyNameFormat(data.name);
        if (!nameValidation.success) {
          return {
            success: false,
            error: nameValidation.error,
          };
        }

        // Check for name uniqueness (excluding current company)
        const existingName = await prisma.company.findFirst({
          where: {
            name: {
              equals: data.name.trim(),
              mode: "insensitive",
            },
            id: {
              not: companyId,
            },
          },
        });

        if (existingName) {
          return {
            success: false,
            error: "A company with this name already exists",
          };
        }
      }

      // Validate currency change
      if (
        data.baseCurrency &&
        data.baseCurrency !== existingCompany.baseCurrency
      ) {
        const currencyValidation = validateCurrencyChange(
          existingCompany.baseCurrency,
          data.baseCurrency,
          existingCompany.expenses.length > 0
        );

        if (!currencyValidation.success) {
          return {
            success: false,
            error: currencyValidation.error,
          };
        }
      }

      // Prepare update data (only basic fields)
      const updateData: Partial<{
        name: string;
        country: string;
        baseCurrency: string;
        updatedAt: Date;
      }> = {};

      if (data.name) updateData.name = data.name.trim();
      if (data.country) updateData.country = data.country;
      if (data.baseCurrency) updateData.baseCurrency = data.baseCurrency;

      // Update company
      const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Update expense categories if provided
      if (data.settings?.expenseCategories) {
        const categoryValidation = validateExpenseCategories(
          data.settings.expenseCategories
        );
        if (!categoryValidation.success) {
          return {
            success: false,
            errors: categoryValidation.errors,
          };
        }

        await prisma.$transaction(async (tx) => {
          // Delete existing categories
          await tx.expenseCategory.deleteMany({
            where: { companyId },
          });

          // Create new categories
          await tx.expenseCategory.createMany({
            data: data.settings!.expenseCategories!.map((name) => ({
              name: name.trim(),
              companyId,
            })),
          });
        });
      }

      logger.info(`Company updated successfully: ${companyId}`, {
        companyId,
        updatedBy,
        changes: Object.keys(updateData),
      });

      return {
        success: true,
        data: updatedCompany,
      };
    } catch (error) {
      logger.error("Error updating company:", error as Error);
      return {
        success: false,
        error: "Failed to update company",
      };
    }
  }

  /**
   * Update company settings (placeholder for future settings implementation)
   * Note: Current schema doesn't have settings field - this is for future extension
   */
  static async updateCompanySettings(
    companyId: string,
    settings: UpdateCompanySettingsInput,
    updatedBy: string,
    userRole: string
  ): Promise<CompanyServiceResponse<{ message: string }>> {
    try {
      // Check permissions
      if (userRole !== "ADMIN") {
        return {
          success: false,
          error:
            "Access denied: Only company admins can update company settings",
        };
      }

      const existingCompany = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!existingCompany) {
        return {
          success: false,
          error: "Company not found",
        };
      }

      // For now, just handle expense categories
      if (settings.expenseCategories) {
        const categoryValidation = validateExpenseCategories(
          settings.expenseCategories
        );
        if (!categoryValidation.success) {
          return {
            success: false,
            errors: categoryValidation.errors,
          };
        }

        await prisma.$transaction(async (tx) => {
          // Delete existing categories
          await tx.expenseCategory.deleteMany({
            where: { companyId },
          });

          // Create new categories
          await tx.expenseCategory.createMany({
            data: settings.expenseCategories!.map((name) => ({
              name: name.trim(),
              companyId,
            })),
          });
        });

        logger.info(`Company expense categories updated: ${companyId}`, {
          companyId,
          updatedBy,
          categoriesCount: settings.expenseCategories.length,
        });
      }

      return {
        success: true,
        data: { message: "Company settings updated successfully" },
      };
    } catch (error) {
      logger.error("Error updating company settings:", error as Error);
      return {
        success: false,
        error: "Failed to update company settings",
      };
    }
  }

  /**
   * Get company statistics and analytics
   */
  static async getCompanyStats(
    companyId: string,
    query: Partial<CompanyStatsQueryInput> = {}
  ): Promise<CompanyServiceResponse<CompanyStats>> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        return {
          success: false,
          error: "Company not found",
        };
      }

      // Build date filter
      const dateFilter: {
        gte?: Date;
        lte?: Date;
      } = {};
      if (query.startDate) {
        dateFilter.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        dateFilter.lte = new Date(query.endDate);
      }

      // Get basic stats
      const [
        totalUsers,
        expenseStats,
        pendingApprovals,
        approvedExpenses,
        rejectedExpenses,
      ] = await Promise.all([
        // Total users
        prisma.user.count({
          where: { companyId },
        }),
        // Expense statistics
        prisma.expense.aggregate({
          where: {
            companyId,
            createdAt:
              Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
          _count: true,
          _sum: { amount: true },
          _avg: { amount: true },
        }),
        // Pending approvals (using correct enum value)
        prisma.expense.count({
          where: {
            companyId,
            status: "PENDING_APPROVAL",
            createdAt:
              Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
        }),
        // Approved expenses
        prisma.expense.count({
          where: {
            companyId,
            status: "APPROVED",
            createdAt:
              Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
        }),
        // Rejected expenses
        prisma.expense.count({
          where: {
            companyId,
            status: "REJECTED",
            createdAt:
              Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
        }),
      ]);

      // Get expenses by category
      const expensesByCategory = await prisma.expense.groupBy({
        by: ["categoryId"],
        where: {
          companyId,
          createdAt:
            Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        _count: true,
        _sum: { amount: true },
      });

      // Get category details
      const categories = await prisma.expenseCategory.findMany({
        where: { companyId },
        select: { id: true, name: true },
      });

      const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

      // Format expenses by category
      const formattedExpensesByCategory = expensesByCategory.map((item) => ({
        category: categoryMap.get(item.categoryId) || "Unknown",
        count: item._count,
        amount: Number(item._sum.amount || 0),
      }));

      // Get expenses by month (last 12 months)
      const expensesByMonth = await prisma.$queryRaw<
        Array<{
          month: string;
          count: bigint;
          amount: number;
        }>
      >`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as amount
        FROM "Expense"
        WHERE "companyId" = ${companyId}
          AND "createdAt" >= NOW() - INTERVAL '12 months'
          ${
            query.startDate
              ? `AND "createdAt" >= ${new Date(query.startDate)}`
              : ``
          }
          ${
            query.endDate ? `AND "createdAt" <= ${new Date(query.endDate)}` : ``
          }
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `;

      // Calculate top expense categories
      const totalAmount = Number(expenseStats._sum.amount || 0);
      const topExpenseCategories = formattedExpensesByCategory
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map((item) => ({
          category: item.category,
          amount: item.amount,
          percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
        }));

      const stats: CompanyStats = {
        totalUsers,
        totalExpenses: expenseStats._count,
        totalExpenseAmount: Number(expenseStats._sum.amount || 0),
        averageExpenseAmount: Number(expenseStats._avg.amount || 0),
        pendingApprovals,
        approvedExpenses,
        rejectedExpenses,
        expensesByCategory: formattedExpensesByCategory,
        expensesByMonth: expensesByMonth.map((item) => ({
          month: item.month,
          count: Number(item.count),
          amount: Number(item.amount),
        })),
        topExpenseCategories,
      };

      logger.info(`Company stats retrieved: ${companyId}`, {
        companyId,
        dateRange: { start: query.startDate, end: query.endDate },
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error("Error retrieving company stats:", error as Error);
      return {
        success: false,
        error: "Failed to retrieve company statistics",
      };
    }
  }

  /**
   * Check if company exists
   */
  static async companyExists(companyId: string): Promise<boolean> {
    try {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });
      return !!company;
    } catch (error) {
      logger.error("Error checking company existence:", error as Error);
      return false;
    }
  }

  /**
   * Get company by user ID
   */
  static async getCompanyByUserId(
    userId: string
  ): Promise<CompanyServiceResponse<Company>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true },
      });

      if (!user || !user.company) {
        return {
          success: false,
          error: "Company not found for user",
        };
      }

      return {
        success: true,
        data: user.company,
      };
    } catch (error) {
      logger.error("Error retrieving company by user ID:", error as Error);
      return {
        success: false,
        error: "Failed to retrieve company",
      };
    }
  }

  /**
   * Validate user belongs to company
   */
  static async validateUserCompanyAccess(
    userId: string,
    companyId: string
  ): Promise<CompanyServiceResponse<{ isValid: boolean; userRole: string }>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true, role: true },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      if (user.companyId !== companyId) {
        return {
          success: false,
          error: "User does not belong to this company",
        };
      }

      return {
        success: true,
        data: {
          isValid: true,
          userRole: user.role,
        },
      };
    } catch (error) {
      logger.error("Error validating user company access:", error as Error);
      return {
        success: false,
        error: "Failed to validate user access",
      };
    }
  }
}

export default CompanyService;

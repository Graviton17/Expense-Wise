import { z } from "zod";

/**
 * Validation schemas for report endpoints
 * Based on the database schema and API documentation requirements
 */

// Common date validation
const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((date) => !isNaN(Date.parse(date)), "Invalid date format");

// Report format validation
const reportFormatSchema = z.enum(["json", "csv", "xlsx", "pdf"], {
  message: "Format must be json, csv, xlsx, or pdf",
});

// Period validation for dashboard
const periodSchema = z.enum(["week", "month", "quarter", "year"], {
  message: "Period must be week, month, quarter, or year",
});

// Export status validation
const exportStatusSchema = z.enum(["PROCESSING", "COMPLETED", "FAILED"], {
  message: "Status must be PROCESSING, COMPLETED, or FAILED",
});

/**
 * Dashboard Query Schema
 * GET /api/reports/dashboard
 */
export const dashboardQuerySchema = z
  .object({
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    userId: z.string().min(1, "User ID must not be empty").optional(),
    period: periodSchema.optional().default("month"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

/**
 * Report Export Schema
 * POST /api/reports/export
 */
export const exportReportSchema = z.object({
  format: reportFormatSchema,
  filters: z
    .object({
      startDate: dateStringSchema,
      endDate: dateStringSchema,
      status: z
        .array(z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"]))
        .optional(),
      categoryId: z.string().min(1, "Category ID must not be empty").optional(),
      userId: z.string().min(1, "User ID must not be empty").optional(),
      minAmount: z
        .number()
        .min(0, "Minimum amount must be positive")
        .optional(),
      maxAmount: z
        .number()
        .min(0, "Maximum amount must be positive")
        .optional(),
    })
    .refine(
      (data) => {
        if (data.minAmount && data.maxAmount) {
          return data.minAmount <= data.maxAmount;
        }
        return true;
      },
      {
        message: "Minimum amount must be less than or equal to maximum amount",
        path: ["minAmount"],
      }
    )
    .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }),
  includeReceipts: z.boolean().optional().default(false),
});

/**
 * Summary Report Query Schema
 * GET /api/reports/summary
 */
export const summaryQuerySchema = z
  .object({
    period: periodSchema.optional().default("month"),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    userId: z.string().min(1, "User ID must not be empty").optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

/**
 * Expense Report Query Schema
 * GET /api/reports/expenses
 */
export const expenseReportQuerySchema = z
  .object({
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    userId: z.string().min(1, "User ID must not be empty").optional(),
    categoryId: z.string().min(1, "Category ID must not be empty").optional(),
    status: z
      .enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"])
      .optional(),
    format: reportFormatSchema.optional().default("json"),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, "Page must be greater than 0"),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine(
        (val) => val > 0 && val <= 1000,
        "Limit must be between 1 and 1000"
      ),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  );

// Type exports for TypeScript
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;
export type ExportReportInput = z.infer<typeof exportReportSchema>;
export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;
export type ExpenseReportQueryInput = z.infer<typeof expenseReportQuerySchema>;

/**
 * Validation utility function for reports
 */
export function validateReportInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((issue) => {
          const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
          return `${path}${issue.message}`;
        }),
      };
    }
    return {
      success: false,
      errors: ["Invalid input data"],
    };
  }
}

/**
 * Helper function to calculate date ranges based on period
 */
export function calculateDateRange(
  period: "week" | "month" | "quarter" | "year",
  customStart?: string,
  customEnd?: string
): {
  startDate: Date;
  endDate: Date;
} {
  if (customStart && customEnd) {
    return {
      startDate: new Date(customStart),
      endDate: new Date(customEnd),
    };
  }

  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);

  switch (period) {
    case "week":
      // Start of current week (Monday)
      const dayOfWeek = startDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);

      // End of current week (Sunday)
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "month":
      // Start of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      // End of current month
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "quarter":
      // Start of current quarter
      const currentQuarter = Math.floor(startDate.getMonth() / 3);
      startDate.setMonth(currentQuarter * 3, 1);
      startDate.setHours(0, 0, 0, 0);

      // End of current quarter
      endDate.setMonth(currentQuarter * 3 + 3, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "year":
      // Start of current year
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);

      // End of current year
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
}

/**
 * Validate role-based access for reports
 */
export function validateReportAccess(
  userRole: string,
  targetUserId?: string,
  requestingUserId?: string
): {
  success: boolean;
  error?: string;
} {
  // ADMINs can access any reports
  if (userRole === "ADMIN") {
    return { success: true };
  }

  // Users can access their own reports
  if (!targetUserId || targetUserId === requestingUserId) {
    return { success: true };
  }

  // MANAGERs can access reports for their subordinates
  // This would need to be validated against the database
  if (userRole === "MANAGER") {
    return { success: true }; // Will be validated in the actual endpoint
  }

  return {
    success: false,
    error: "Access denied: Insufficient permissions to view this report",
  };
}

import { z } from "zod";

/**
 * Validation schemas for expense management endpoints
 * Based on the API documentation and business requirements
 */

// Common validation patterns
const amountSchema = z
  .number()
  .positive("Amount must be positive")
  .max(1000000, "Amount cannot exceed 1,000,000")
  .refine((amount) => {
    // Check for valid decimal places (max 2)
    const decimalPlaces = (amount.toString().split(".")[1] || "").length;
    return decimalPlaces <= 2;
  }, "Amount cannot have more than 2 decimal places");

// ISO 4217 currency codes (major currencies)
const currencyCodeSchema = z.enum(
  [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "MXN",
    "SGD",
    "HKD",
    "NOK",
    "INR",
    "KRW",
    "TRY",
    "RUB",
    "BRL",
    "ZAR",
  ],
  {
    message: "Invalid currency code. Must be a valid ISO 4217 currency code",
  }
);

// Expense status enum matching Prisma schema
const expenseStatusSchema = z.enum(
  ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"],
  {
    message: "Invalid expense status",
  }
);

// Date validation schemas
const expenseDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Allow expenses for today
    return date <= today;
  }, "Expense date cannot be in the future")
  .refine((dateStr) => {
    const date = new Date(dateStr);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date >= oneYearAgo;
  }, "Expense date cannot be more than 1 year ago");

// Merchant name validation
const merchantNameSchema = z
  .string()
  .min(1, "Merchant name is required")
  .max(100, "Merchant name must not exceed 100 characters")
  .trim();

// Description validation
const expenseDescriptionSchema = z
  .string()
  .min(3, "Description must be at least 3 characters")
  .max(500, "Description must not exceed 500 characters")
  .trim();

// Receipt ID validation
const receiptIdSchema = z.string().cuid("Invalid receipt ID format");

// Pagination validation
const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1"))
    .refine((val) => val >= 1, "Page must be at least 1"),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "20"))
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100"),
});

// Sorting validation
const sortBySchema = z.enum(
  [
    "date",
    "amount",
    "status",
    "category",
    "submittedAt",
    "createdAt",
    "updatedAt",
  ],
  {
    message: "Invalid sort field",
  }
);

const sortOrderSchema = z.enum(["asc", "desc"], {
  message: "Sort order must be 'asc' or 'desc'",
});

/**
 * Create Expense Schema
 * POST /api/expenses
 */
export const createExpenseSchema = z
  .object({
    amount: amountSchema,
    currency: currencyCodeSchema,
    category: z
      .string()
      .min(1, "Category is required")
      .max(50, "Category name must not exceed 50 characters"),
    description: expenseDescriptionSchema,
    date: expenseDateSchema,
    merchantName: merchantNameSchema.optional(),
    receiptIds: z
      .array(receiptIdSchema)
      .optional()
      .default([])
      .refine(
        (ids) => ids.length <= 10,
        "Maximum 10 receipts allowed per expense"
      ),
  })
  .refine(
    (data) => {
      // Business rule: Expenses over $25 require receipts (configurable per company)
      if (
        data.amount > 25 &&
        (!data.receiptIds || data.receiptIds.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Expenses over $25 require at least one receipt",
      path: ["receiptIds"],
    }
  );

/**
 * Update Expense Schema
 * PUT /api/expenses/[id]
 */
export const updateExpenseSchema = z
  .object({
    amount: amountSchema.optional(),
    currency: currencyCodeSchema.optional(),
    category: z
      .string()
      .min(1, "Category cannot be empty")
      .max(50, "Category name must not exceed 50 characters")
      .optional(),
    description: expenseDescriptionSchema.optional(),
    date: expenseDateSchema.optional(),
    merchantName: merchantNameSchema.optional(),
    receiptIds: z
      .array(receiptIdSchema)
      .optional()
      .refine(
        (ids) => !ids || ids.length <= 10,
        "Maximum 10 receipts allowed per expense"
      ),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

/**
 * List Expenses Query Schema
 * GET /api/expenses
 */
export const listExpensesQuerySchema = z
  .object({
    status: z
      .string()
      .optional()
      .refine((status) => {
        if (!status) return true;
        return ["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"].includes(
          status
        );
      }, "Invalid status filter"),
    category: z.string().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
      .optional(),
    userId: z.string().cuid("Invalid user ID format").optional(),
    minAmount: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => !val || val >= 0, "Minimum amount must be positive"),
    maxAmount: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => !val || val >= 0, "Maximum amount must be positive"),
    merchantName: z.string().optional(),
    page: z
      .string()
      .optional()
      .transform((val) => parseInt(val || "1"))
      .refine((val) => val >= 1, "Page must be at least 1"),
    limit: z
      .string()
      .optional()
      .transform((val) => parseInt(val || "20"))
      .refine(
        (val) => val >= 1 && val <= 100,
        "Limit must be between 1 and 100"
      ),
    sortBy: sortBySchema.optional().default("createdAt"),
    sortOrder: sortOrderSchema.optional().default("desc"),
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
  )
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
  );

/**
 * Submit Expense Schema
 * POST /api/expenses/[id]/submit
 */
export const submitExpenseSchema = z
  .object({
    comment: z
      .string()
      .max(500, "Comment must not exceed 500 characters")
      .optional(),
  })
  .optional();

/**
 * Expense Analytics Query Schema
 * GET /api/expenses/analytics
 */
export const expenseAnalyticsQuerySchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
      .optional(),
    groupBy: z
      .enum(["category", "user", "status", "month", "week"])
      .optional()
      .default("category"),
    includeComparisons: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    userId: z.string().cuid("Invalid user ID format").optional(),
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
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpensesQueryInput = z.infer<typeof listExpensesQuerySchema>;
export type SubmitExpenseInput = z.infer<typeof submitExpenseSchema>;
export type ExpenseAnalyticsQueryInput = z.infer<
  typeof expenseAnalyticsQuerySchema
>;

/**
 * Validation utility function for expenses
 */
export function validateExpenseInput<T>(
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
 * Validate expense status transitions
 */
export function validateStatusTransition(
  currentStatus: string,
  newStatus: string
): {
  success: boolean;
  error?: string;
} {
  const validTransitions: Record<string, string[]> = {
    DRAFT: ["PENDING_APPROVAL"],
    PENDING_APPROVAL: ["APPROVED", "REJECTED"],
    APPROVED: [], // Final state
    REJECTED: ["PENDING_APPROVAL"], // Can be resubmitted
  };

  if (!validTransitions[currentStatus]) {
    return {
      success: false,
      error: `Invalid current status: ${currentStatus}`,
    };
  }

  if (!validTransitions[currentStatus].includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { success: true };
}

/**
 * Validate expense modification permissions
 */
export function validateExpenseModification(
  expenseStatus: string,
  operation: "update" | "delete" | "submit"
): {
  success: boolean;
  error?: string;
} {
  switch (operation) {
    case "update":
      if (expenseStatus === "DRAFT" || expenseStatus === "REJECTED") {
        return { success: true };
      }
      return {
        success: false,
        error: "Only DRAFT or REJECTED expenses can be updated",
      };

    case "delete":
      if (expenseStatus === "DRAFT") {
        return { success: true };
      }
      return {
        success: false,
        error: "Only DRAFT expenses can be deleted",
      };

    case "submit":
      if (expenseStatus === "DRAFT" || expenseStatus === "REJECTED") {
        return { success: true };
      }
      return {
        success: false,
        error: "Only DRAFT or REJECTED expenses can be submitted",
      };

    default:
      return {
        success: false,
        error: "Invalid operation",
      };
  }
}

/**
 * Validate expense access permissions based on user role
 */
export function validateExpenseAccess(
  userRole: string,
  userId: string,
  expenseUserId: string,
  isManager: boolean = false
): {
  success: boolean;
  error?: string;
} {
  switch (userRole) {
    case "ADMIN":
      // Admins can access all expenses
      return { success: true };

    case "MANAGER":
      // Managers can access their own expenses and their team's expenses
      if (userId === expenseUserId || isManager) {
        return { success: true };
      }
      return {
        success: false,
        error:
          "Access denied: Can only view own expenses or team member expenses",
      };

    case "EMPLOYEE":
      // Employees can only access their own expenses
      if (userId === expenseUserId) {
        return { success: true };
      }
      return {
        success: false,
        error: "Access denied: Can only view own expenses",
      };

    default:
      return {
        success: false,
        error: "Invalid user role",
      };
  }
}

/**
 * Validate receipt requirements based on company settings
 */
export function validateReceiptRequirements(
  amount: number,
  receiptCount: number,
  companySettings: {
    requireReceipts: boolean;
    receiptMinAmount: number;
  }
): {
  success: boolean;
  error?: string;
  warning?: string;
} {
  if (!companySettings.requireReceipts) {
    return { success: true };
  }

  if (amount >= companySettings.receiptMinAmount && receiptCount === 0) {
    return {
      success: false,
      error: `Expenses of ${companySettings.receiptMinAmount} or more require at least one receipt`,
    };
  }

  if (amount >= companySettings.receiptMinAmount && receiptCount === 0) {
    return {
      success: true,
      warning:
        "Consider adding receipts for expenses over the minimum threshold",
    };
  }

  return { success: true };
}

/**
 * Validate expense amount against company limits
 */
export function validateExpenseAmount(
  amount: number,
  companySettings: {
    maxExpenseAmount: number;
    autoApprovalLimit: number;
  }
): {
  success: boolean;
  error?: string;
  requiresApproval?: boolean;
} {
  if (amount > companySettings.maxExpenseAmount) {
    return {
      success: false,
      error: `Expense amount cannot exceed company limit of ${companySettings.maxExpenseAmount}`,
    };
  }

  const requiresApproval = amount > companySettings.autoApprovalLimit;

  return {
    success: true,
    requiresApproval,
  };
}

/**
 * Validate expense category access
 */
export function validateExpenseCategory(
  categoryId: string,
  availableCategories: string[]
): {
  success: boolean;
  error?: string;
} {
  if (!availableCategories.includes(categoryId)) {
    return {
      success: false,
      error:
        "Invalid expense category or category not available for your company",
    };
  }

  return { success: true };
}

/**
 * Validate bulk expense operations
 */
export function validateBulkExpenseOperation(
  expenseIds: string[],
  operation: "approve" | "reject" | "delete",
  maxBatchSize: number = 50
): {
  success: boolean;
  error?: string;
} {
  if (expenseIds.length === 0) {
    return {
      success: false,
      error: "At least one expense ID must be provided",
    };
  }

  if (expenseIds.length > maxBatchSize) {
    return {
      success: false,
      error: `Maximum ${maxBatchSize} expenses can be processed in a single operation`,
    };
  }

  // Check for duplicate IDs
  const uniqueIds = new Set(expenseIds);
  if (uniqueIds.size !== expenseIds.length) {
    return {
      success: false,
      error: "Duplicate expense IDs are not allowed",
    };
  }

  return { success: true };
}

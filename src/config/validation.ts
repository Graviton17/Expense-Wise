import { z } from "zod";

// Common validation schemas for API requests
export const validationSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  // Common field types
  id: z.string().cuid("Invalid ID format"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().min(1, "Description is required").max(500),
  currency: z.string().length(3, "Currency must be 3 characters (ISO 4217)"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(9999999999.99, "Amount too large"),
  date: z.string().datetime("Invalid date format").or(z.date()),

  // Authentication schemas
  auth: {
    login: z.object({
      email: z.string().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    }),

    register: z.object({
      email: z.string().email("Invalid email format"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128),
      firstName: z.string().min(1, "First name is required").max(50),
      lastName: z.string().min(1, "Last name is required").max(50),
      companyId: z.string().cuid("Invalid company ID"),
    }),

    forgotPassword: z.object({
      email: z.string().email("Invalid email format"),
    }),

    resetPassword: z.object({
      token: z.string().min(1, "Reset token is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128),
    }),

    refreshToken: z.object({
      refreshToken: z.string().min(1, "Refresh token is required"),
    }),

    changePassword: z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(128),
    }),
  },

  // User schemas
  user: {
    create: z.object({
      email: z.string().email("Invalid email format"),
      firstName: z.string().min(1, "First name is required").max(50),
      lastName: z.string().min(1, "Last name is required").max(50),
      role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
      managerId: z.string().cuid().optional(),
    }),

    update: z.object({
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
      role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
      managerId: z.string().cuid().optional(),
    }),

    profile: z.object({
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
    }),

    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
      search: z.string().max(100).optional(),
    }),
  },

  // Company schemas
  company: {
    create: z.object({
      name: z.string().min(1, "Company name is required").max(100),
      country: z.string().length(2, "Country must be 2-letter code"),
      baseCurrency: z.string().length(3, "Currency must be 3 characters"),
    }),

    update: z.object({
      name: z.string().min(1).max(100).optional(),
      country: z.string().length(2).optional(),
      baseCurrency: z.string().length(3).optional(),
    }),
  },

  // Expense schemas
  expense: {
    create: z.object({
      categoryId: z.string().cuid("Invalid category ID"),
      amount: z.number().positive("Amount must be positive").max(9999999999.99),
      currency: z.string().length(3, "Currency must be 3 characters"),
      description: z.string().min(1, "Description is required").max(500),
      date: z.string().datetime("Invalid date format"),
      merchantName: z.string().max(100).optional(),
    }),

    update: z.object({
      categoryId: z.string().cuid().optional(),
      amount: z.number().positive().max(9999999999.99).optional(),
      currency: z.string().length(3).optional(),
      description: z.string().min(1).max(500).optional(),
      date: z.string().datetime().optional(),
      merchantName: z.string().max(100).optional(),
    }),

    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z
        .enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"])
        .optional(),
      userId: z.string().cuid().optional(),
      categoryId: z.string().cuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      minAmount: z.coerce.number().positive().optional(),
      maxAmount: z.coerce.number().positive().optional(),
      search: z.string().max(100).optional(),
    }),

    submit: z.object({
      comment: z.string().max(500).optional(),
    }),
  },

  // Approval schemas
  approval: {
    approve: z.object({
      comment: z.string().max(500).optional(),
    }),

    reject: z.object({
      comment: z.string().min(1, "Rejection reason is required").max(500),
    }),

    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),

    bulk: z.object({
      approvalIds: z
        .array(z.string().cuid())
        .min(1, "At least one approval ID required"),
      comment: z.string().max(500).optional(),
    }),
  },

  // Category schemas
  category: {
    create: z.object({
      name: z.string().min(1, "Category name is required").max(50),
    }),

    update: z.object({
      name: z.string().min(1).max(50).optional(),
    }),
  },

  // Notification schemas
  notification: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      unreadOnly: z.coerce.boolean().default(false),
      type: z
        .enum([
          "EXPENSE_SUBMITTED",
          "EXPENSE_APPROVED",
          "EXPENSE_REJECTED",
          "APPROVAL_REQUIRED",
          "SYSTEM_NOTIFICATION",
        ])
        .optional(),
    }),
  },

  // Report schemas
  report: {
    generate: z.object({
      startDate: z.string().datetime("Invalid start date"),
      endDate: z.string().datetime("Invalid end date"),
      userId: z.string().cuid().optional(),
      format: z.enum(["json", "csv", "pdf"]).default("json"),
    }),

    query: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      type: z.string().max(50).optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
    }),
  },

  // Webhook schemas
  webhook: {
    create: z.object({
      url: z.string().url("Invalid webhook URL"),
      events: z.array(z.string()).min(1, "At least one event required"),
      secret: z.string().min(1, "Webhook secret required"),
    }),

    update: z.object({
      url: z.string().url().optional(),
      events: z.array(z.string()).min(1).optional(),
      secret: z.string().min(1).optional(),
    }),
  },

  // File upload schemas
  file: {
    upload: z.object({
      expenseId: z.string().cuid("Invalid expense ID"),
    }),
  },
};

// Custom validation functions
export const customValidators = {
  // Check if password meets strength requirements
  isStrongPassword: (
    password: string
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return { valid: errors.length === 0, errors };
  },

  // Check if email is from allowed domain (optional)
  isAllowedEmailDomain: (email: string, allowedDomains?: string[]): boolean => {
    if (!allowedDomains || allowedDomains.length === 0) return true;

    const domain = email.split("@")[1]?.toLowerCase();
    return allowedDomains.includes(domain);
  },

  // Check if currency is supported
  isSupportedCurrency: (currency: string): boolean => {
    const supportedCurrencies = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CAD",
      "AUD",
      "CHF",
      "CNY",
      "INR",
    ];
    return supportedCurrencies.includes(currency.toUpperCase());
  },

  // Check if file type is allowed
  isAllowedFileType: (fileType: string, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(fileType.toLowerCase());
  },

  // Check if file size is within limit
  isWithinFileSizeLimit: (fileSize: number, maxSize: number): boolean => {
    return fileSize <= maxSize;
  },

  // Check if date range is valid
  isValidDateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end && start <= new Date();
  },

  // Check if amount is within company limits (placeholder)
  isWithinCompanyLimits: (
    amount: number,
    currency: string,
    userRole: string
  ): boolean => {
    // This would typically check against company-specific limits stored in database
    const limits: Record<string, Record<string, number>> = {
      EMPLOYEE: { USD: 1000, EUR: 900, GBP: 800 },
      MANAGER: { USD: 5000, EUR: 4500, GBP: 4000 },
      ADMIN: { USD: Infinity, EUR: Infinity, GBP: Infinity },
    };

    const userLimits = limits[userRole];
    if (!userLimits) return false;

    const limit = userLimits[currency.toUpperCase()];
    return limit !== undefined && amount <= limit;
  },
};

// Data sanitization functions
export const sanitizers = {
  email: (email: string): string => email.toLowerCase().trim(),

  name: (name: string): string => name.trim().replace(/\s+/g, " "),

  currency: (currency: string): string => currency.toUpperCase().trim(),

  amount: (amount: number): number => Math.round(amount * 100) / 100, // Round to 2 decimal places

  description: (description: string): string =>
    description.trim().replace(/\s+/g, " ").substring(0, 500),

  fileName: (fileName: string): string =>
    fileName.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 255),

  searchQuery: (query: string): string =>
    query
      .trim()
      .replace(/[^\w\s-]/g, "")
      .substring(0, 100),
};

// Error message constants
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: "This field is required",
    INVALID_EMAIL: "Invalid email format",
    INVALID_PASSWORD: "Password must be at least 8 characters long",
    INVALID_CURRENCY: "Invalid currency code",
    INVALID_AMOUNT: "Amount must be positive",
    INVALID_DATE: "Invalid date format",
    INVALID_FILE_TYPE: "File type not allowed",
    FILE_TOO_LARGE: "File size exceeds limit",
  },
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_INVALID: "Invalid token",
    UNAUTHORIZED: "Unauthorized access",
    FORBIDDEN: "Insufficient permissions",
  },
  BUSINESS: {
    EXPENSE_NOT_EDITABLE: "Expense cannot be edited in current status",
    EXPENSE_NOT_FOUND: "Expense not found",
    APPROVAL_NOT_FOUND: "Approval not found",
    USER_NOT_FOUND: "User not found",
    COMPANY_NOT_FOUND: "Company not found",
  },
  SYSTEM: {
    INTERNAL_ERROR: "Internal server error",
    DATABASE_ERROR: "Database operation failed",
    EXTERNAL_SERVICE_ERROR: "External service unavailable",
  },
};

export default validationSchemas;

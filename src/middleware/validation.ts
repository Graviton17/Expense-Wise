import { NextRequest, NextResponse } from "next/server";
import { z, ZodError, ZodSchema } from "zod";
import { ValidationError } from "./error-handler";

// Common validation schemas
export const commonSchemas = {
  id: z.string().cuid("Invalid ID format"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  currency: z.string().length(3, "Currency must be 3 characters (ISO 4217)"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(9999999999.99, "Amount too large"),
  date: z.string().datetime("Invalid date format") || z.date(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),
};

// Request validation schemas
export const validationSchemas = {
  // Authentication
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(1, "First name required").max(50),
    lastName: z.string().min(1, "Last name required").max(50),
    companyId: commonSchemas.id,
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, "Password required"),
  }),

  forgotPassword: z.object({
    email: commonSchemas.email,
  }),

  resetPassword: z.object({
    token: z.string().min(1, "Reset token required"),
    newPassword: commonSchemas.password,
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, "Refresh token required"),
  }),

  // User management
  createUser: z.object({
    email: commonSchemas.email,
    firstName: z.string().min(1, "First name required").max(50),
    lastName: z.string().min(1, "Last name required").max(50),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
    managerId: commonSchemas.id.optional(),
  }),

  updateUser: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
    managerId: commonSchemas.id.optional(),
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
  }),

  // Company management
  createCompany: z.object({
    name: z.string().min(1, "Company name required").max(100),
    country: z.string().min(2).max(2, "Country must be 2-letter code"),
    baseCurrency: commonSchemas.currency,
  }),

  updateCompany: z.object({
    name: z.string().min(1).max(100).optional(),
    country: z.string().min(2).max(2).optional(),
    baseCurrency: commonSchemas.currency.optional(),
  }),

  // Expense management
  createExpense: z.object({
    categoryId: commonSchemas.id,
    amount: commonSchemas.amount,
    currency: commonSchemas.currency,
    description: z.string().min(1, "Description required").max(500),
    date: z.string().datetime(),
    merchantName: z.string().max(100).optional(),
  }),

  updateExpense: z.object({
    categoryId: commonSchemas.id.optional(),
    amount: commonSchemas.amount.optional(),
    currency: commonSchemas.currency.optional(),
    description: z.string().min(1).max(500).optional(),
    date: z.string().datetime().optional(),
    merchantName: z.string().max(100).optional(),
  }),

  // Approval management
  approveExpense: z.object({
    comment: z.string().max(500).optional(),
  }),

  rejectExpense: z.object({
    comment: z.string().min(1, "Rejection reason required").max(500),
  }),

  // File upload
  uploadReceipt: z.object({
    expenseId: commonSchemas.id,
  }),

  // Category management
  createCategory: z.object({
    name: z.string().min(1, "Category name required").max(50),
  }),

  // Report generation
  expenseReport: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    userId: commonSchemas.id.optional(),
    format: z.enum(["json", "csv", "pdf"]).default("json"),
  }),

  // Webhook management
  createWebhook: z.object({
    url: z.string().url("Invalid webhook URL"),
    events: z.array(z.string()).min(1, "At least one event required"),
    secret: z.string().min(1, "Webhook secret required"),
  }),

  // Query parameters
  getUsersQuery: z.object({
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1))
      .default("1"),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .default("20"),
    role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
  }),

  getExpensesQuery: z.object({
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1))
      .default("1"),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .default("20"),
    status: z
      .enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"])
      .optional(),
    userId: commonSchemas.id.optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),

  getApprovalsQuery: z.object({
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1))
      .default("1"),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .default("20"),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  }),

  getNotificationsQuery: z.object({
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1))
      .default("1"),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .default("20"),
    unreadOnly: z
      .string()
      .transform((val) => val === "true")
      .default("false"),
  }),
};

// Validation middleware factory
export function withValidation(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body"
) {
  return function (handler: Function) {
    return async (request: NextRequest, context?: any) => {
      try {
        let data: any;

        switch (source) {
          case "body":
            const contentType = request.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
              data = await request.json();
            } else if (contentType.includes("multipart/form-data")) {
              const formData = await request.formData();
              data = Object.fromEntries(formData.entries());
            } else {
              data = {};
            }
            break;

          case "query":
            data = Object.fromEntries(request.nextUrl.searchParams.entries());
            break;

          case "params":
            data = context?.params || {};
            break;
        }

        // Validate data
        const validatedData = schema.parse(data);

        // Add validated data to request
        (request as any).validatedData = validatedData;

        return handler(request, context);
      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          }));

          throw new ValidationError("Validation failed", formattedErrors);
        }
        throw error;
      }
    };
  };
}

// Specific validation middlewares
export const validateBody = (schema: ZodSchema) =>
  withValidation(schema, "body");
export const validateQuery = (schema: ZodSchema) =>
  withValidation(schema, "query");
export const validateParams = (schema: ZodSchema) =>
  withValidation(schema, "params");

// File validation
export function validateFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (!file) {
    errors.push("File is required");
    return { valid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push("File size must be less than 10MB");
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push("File type must be JPEG, PNG, or PDF");
  }

  if (file.name.length > 255) {
    errors.push("Filename too long");
  }

  // Check for potentially dangerous file names
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.name)) {
    errors.push("Filename contains invalid characters");
  }

  return { valid: errors.length === 0, errors };
}

// Multi-part form validation for file uploads
export async function validateFileUpload(request: NextRequest): Promise<{
  valid: boolean;
  file?: File;
  data?: any;
  errors: string[];
}> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const errors: string[] = [];

    if (!file) {
      errors.push("File is required");
      return { valid: false, errors };
    }

    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      errors.push(...fileValidation.errors);
    }

    // Validate other form fields
    const data: any = {};
    for (const [key, value] of formData.entries()) {
      if (key !== "file") {
        data[key] = value;
      }
    }

    return {
      valid: errors.length === 0,
      file: errors.length === 0 ? file : undefined,
      data,
      errors,
    };
  } catch (error) {
    return {
      valid: false,
      errors: ["Failed to parse form data"],
    };
  }
}

// Custom validation helpers
export const customValidators = {
  isValidCUID: (id: string): boolean => {
    return /^c[a-z0-9]{24}$/.test(id);
  },

  isValidCurrency: (currency: string): boolean => {
    const validCurrencies = [
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
    return validCurrencies.includes(currency.toUpperCase());
  },

  isValidDateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end && start <= new Date();
  },

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
};

// Sanitization helpers
export const sanitizers = {
  email: (email: string): string => email.toLowerCase().trim(),

  name: (name: string): string => name.trim().replace(/\s+/g, " "),

  currency: (currency: string): string => currency.toUpperCase().trim(),

  amount: (amount: number): number => Math.round(amount * 100) / 100, // Round to 2 decimal places

  description: (description: string): string =>
    description.trim().replace(/\s+/g, " ").substring(0, 500),
};

// Example usage:
/*
import { validateBody, validationSchemas, withValidation } from '@/middleware/validation';

export const POST = validateBody(validationSchemas.createExpense)(
  async (request: NextRequest) => {
    const validatedData = (request as any).validatedData;
    
    // Your business logic with validated data
    
    return NextResponse.json(result);
  }
);
*/

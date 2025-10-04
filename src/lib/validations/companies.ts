import { z } from "zod";

/**
 * Validation schemas for company management endpoints
 * Based on the API documentation and database schema requirements
 */

// Common validation patterns
const companyNameSchema = z
  .string()
  .min(1, "Company name is required")
  .max(100, "Company name must not exceed 100 characters")
  .trim();

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

// Common country codes (ISO 3166-1 alpha-2)
const countryCodeSchema = z.enum(
  [
    "US",
    "CA",
    "GB",
    "AU",
    "DE",
    "FR",
    "JP",
    "CN",
    "IN",
    "BR",
    "MX",
    "IT",
    "ES",
    "NL",
    "SE",
    "NO",
    "DK",
    "FI",
    "CH",
    "AT",
    "BE",
    "IE",
    "PT",
    "GR",
    "PL",
    "CZ",
    "HU",
    "RO",
    "BG",
    "HR",
    "SI",
    "SK",
    "LT",
    "LV",
    "EE",
    "MT",
    "CY",
    "LU",
    "SG",
    "HK",
    "NZ",
    "ZA",
    "KR",
    "TR",
    "RU",
    "AR",
    "CL",
    "PE",
    "CO",
    "UY",
  ],
  {
    message:
      "Invalid country code. Must be a valid ISO 3166-1 alpha-2 country code",
  }
);

// Company industry validation
const industrySchema = z.enum(
  [
    "Technology",
    "Healthcare",
    "Finance",
    "Manufacturing",
    "Retail",
    "Education",
    "Real Estate",
    "Transportation",
    "Energy",
    "Media",
    "Hospitality",
    "Consulting",
    "Non-Profit",
    "Government",
    "Other",
  ],
  {
    message: "Invalid industry selection",
  }
);

// Company size validation
const companySizeSchema = z.enum(
  ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
  {
    message: "Invalid company size selection",
  }
);

// Company settings validation
const companySettingsSchema = z
  .object({
    expenseCategories: z
      .array(z.string().min(1, "Category name cannot be empty"))
      .min(1, "At least one expense category is required")
      .max(20, "Maximum 20 expense categories allowed")
      .optional(),
    defaultApprovalWorkflow: z
      .enum(["SEQUENTIAL", "PARALLEL", "NONE"])
      .optional()
      .default("SEQUENTIAL"),
    maxExpenseAmount: z
      .number()
      .min(0, "Maximum expense amount must be positive")
      .max(1000000, "Maximum expense amount cannot exceed 1,000,000")
      .optional()
      .default(10000),
    requireReceipts: z.boolean().optional().default(true),
    receiptMinAmount: z
      .number()
      .min(0, "Receipt minimum amount must be positive")
      .max(10000, "Receipt minimum amount cannot exceed 10,000")
      .optional()
      .default(25),
    autoApprovalLimit: z
      .number()
      .min(0, "Auto approval limit must be positive")
      .max(10000, "Auto approval limit cannot exceed 10,000")
      .optional()
      .default(0),
    allowPersonalExpenses: z.boolean().optional().default(false),
    fiscalYearStart: z
      .enum(["JANUARY", "APRIL", "JULY", "OCTOBER"])
      .optional()
      .default("JANUARY"),
    timezonePreference: z
      .string()
      .regex(/^[A-Z][a-z]+\/[A-Z][a-z_]+$/, "Invalid timezone format")
      .optional()
      .default("America/New_York"),
  })
  .refine(
    (data) =>
      !data.receiptMinAmount ||
      !data.maxExpenseAmount ||
      data.receiptMinAmount <= data.maxExpenseAmount,
    {
      message: "Receipt minimum amount cannot exceed maximum expense amount",
      path: ["receiptMinAmount"],
    }
  )
  .refine(
    (data) =>
      !data.autoApprovalLimit ||
      !data.maxExpenseAmount ||
      data.autoApprovalLimit <= data.maxExpenseAmount,
    {
      message: "Auto approval limit cannot exceed maximum expense amount",
      path: ["autoApprovalLimit"],
    }
  );

/**
 * Get Company Profile Schema
 * GET /api/companies
 */
export const getCompanyProfileSchema = z.object({
  includeSettings: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  includeStats: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

/**
 * Create Company Schema
 * POST /api/companies
 */
export const createCompanySchema = z.object({
  name: companyNameSchema,
  country: countryCodeSchema,
  baseCurrency: currencyCodeSchema,
  industry: industrySchema.optional(),
  size: companySizeSchema.optional(),
  settings: companySettingsSchema.optional(),
  adminUser: z
    .object({
      name: z
        .string()
        .min(1, "Admin name is required")
        .max(50, "Admin name must not exceed 50 characters")
        .trim(),
      email: z
        .string()
        .email("Invalid email format")
        .max(100, "Email must not exceed 100 characters")
        .toLowerCase()
        .trim(),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must not exceed 128 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
    })
    .optional(),
});

/**
 * Update Company Schema
 * PUT /api/companies/[id]
 */
export const updateCompanySchema = z
  .object({
    name: companyNameSchema.optional(),
    country: countryCodeSchema.optional(),
    baseCurrency: currencyCodeSchema.optional(),
    industry: industrySchema.optional(),
    size: companySizeSchema.optional(),
    settings: companySettingsSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

/**
 * Company Settings Schema
 * PUT /api/companies/[id]/settings
 */
export const updateCompanySettingsSchema = companySettingsSchema.partial();

/**
 * Company Statistics Query Schema
 * GET /api/companies/[id]/stats
 */
export const companyStatsQuerySchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional(),
    includeUsers: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    includeExpenses: z
      .string()
      .optional()
      .transform((val) => val === "true"),
    includeApprovals: z
      .string()
      .optional()
      .transform((val) => val === "true"),
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
export type GetCompanyProfileInput = z.infer<typeof getCompanyProfileSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateCompanySettingsInput = z.infer<
  typeof updateCompanySettingsSchema
>;
export type CompanyStatsQueryInput = z.infer<typeof companyStatsQuerySchema>;

/**
 * Validation utility function for companies
 */
export function validateCompanyInput<T>(
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
 * Validate role-based access for company management
 */
export function validateCompanyAccess(
  userRole: string,
  action: "view" | "update" | "create" | "delete" | "manage-settings"
): {
  success: boolean;
  error?: string;
} {
  switch (action) {
    case "view":
      // All authenticated users can view their company profile
      return { success: true };

    case "update":
    case "manage-settings":
      // Only admins can update company details and settings
      if (userRole === "ADMIN") {
        return { success: true };
      }
      return {
        success: false,
        error:
          "Access denied: Only company admins can update company information",
      };

    case "create":
      // Only system admins or during registration can create companies
      // This will be handled at the application level
      return { success: true };

    case "delete":
      // Company deletion requires special system admin privileges
      return {
        success: false,
        error:
          "Access denied: Company deletion requires system administrator privileges",
      };

    default:
      return {
        success: false,
        error: "Invalid action specified",
      };
  }
}

/**
 * Validate currency change authorization
 */
export function validateCurrencyChange(
  currentCurrency: string,
  newCurrency: string,
  hasTransactions: boolean
): {
  success: boolean;
  error?: string;
  warning?: string;
} {
  if (currentCurrency === newCurrency) {
    return { success: true };
  }

  if (hasTransactions) {
    return {
      success: false,
      error:
        "Cannot change base currency when company has existing expense transactions. Please contact support for assistance.",
    };
  }

  return {
    success: true,
    warning:
      "Changing the base currency will affect all future expense reporting and calculations.",
  };
}

/**
 * Helper function to validate company name uniqueness (to be used in service layer)
 */
export function validateCompanyNameFormat(name: string): {
  success: boolean;
  error?: string;
} {
  // Remove extra whitespace
  const cleanName = name.trim().replace(/\s+/g, " ");

  // Check for minimum length
  if (cleanName.length < 2) {
    return {
      success: false,
      error: "Company name must be at least 2 characters long",
    };
  }

  // Check for valid characters (letters, numbers, spaces, common punctuation)
  if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(cleanName)) {
    return {
      success: false,
      error: "Company name contains invalid characters",
    };
  }

  // Check for reserved words
  const reservedWords = [
    "admin",
    "api",
    "www",
    "mail",
    "ftp",
    "test",
    "staging",
  ];
  if (reservedWords.some((word) => cleanName.toLowerCase().includes(word))) {
    return {
      success: false,
      error: "Company name contains reserved words",
    };
  }

  return { success: true };
}

/**
 * Helper function to validate expense category configuration
 */
export function validateExpenseCategories(categories: string[]): {
  success: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Check for duplicates
  const uniqueCategories = new Set(
    categories.map((cat) => cat.toLowerCase().trim())
  );
  if (uniqueCategories.size !== categories.length) {
    errors.push("Duplicate expense categories are not allowed");
  }

  // Check for empty categories
  const emptyCategories = categories.filter((cat) => !cat.trim());
  if (emptyCategories.length > 0) {
    errors.push("Empty category names are not allowed");
  }

  // Check for reserved category names
  const reservedCategories = ["uncategorized", "other", "misc", "general"];
  const hasReserved = categories.some((cat) =>
    reservedCategories.includes(cat.toLowerCase().trim())
  );
  if (hasReserved) {
    errors.push(
      "Reserved category names ('uncategorized', 'other', 'misc', 'general') are not allowed"
    );
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Validation schemas using Zod

import { z } from "zod";

export const companySignupSchema = z.object({
  companyName: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),

  country: z.string().min(2, "Please select a country"),

  currency: z
    .string()
    .min(3, "Please select a currency")
    .max(3, "Invalid currency code"),

  adminName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  adminEmail: z.string().email("Please enter a valid email address"),

  adminPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const userSigninSchema = z.object({
  email: z.string().email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export const expenseSubmissionSchema = z.object({
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(999999.99, "Amount is too large"),

  currency: z
    .string()
    .min(3, "Please select a currency")
    .max(3, "Invalid currency code"),

  category: z.string().min(1, "Please select a category"),

  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must be less than 500 characters"),

  date: z.date().max(new Date(), "Date cannot be in the future"),
});

export const userManagementSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),

  email: z.string().email("Please enter a valid email address"),

  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"], {
    message: "Please select a role",
  }),

  status: z.enum(["ACTIVE", "INACTIVE"], {
    message: "Please select a status",
  }),
});

export const approvalWorkflowSchema = z.object({
  name: z
    .string()
    .min(3, "Workflow name must be at least 3 characters")
    .max(100, "Workflow name must be less than 100 characters"),

  rules: z
    .array(
      z.object({
        condition: z.enum(["AMOUNT_THRESHOLD", "CATEGORY", "USER_ROLE"]),
        value: z.union([z.string(), z.number()]),
        approverRole: z.enum(["MANAGER", "ADMIN"]),
        isRequired: z.boolean(),
        order: z.number().min(1),
      })
    )
    .min(1, "At least one rule is required"),

  isActive: z.boolean(),
});

// Type inference from schemas
export type CompanySignupFormData = z.infer<typeof companySignupSchema>;
export type UserSigninFormData = z.infer<typeof userSigninSchema>;
export type ExpenseSubmissionFormData = z.infer<typeof expenseSubmissionSchema>;
export type UserManagementFormData = z.infer<typeof userManagementSchema>;
export type ApprovalWorkflowFormData = z.infer<typeof approvalWorkflowSchema>;

// Export company validation schemas
export * from "./validations/companies";

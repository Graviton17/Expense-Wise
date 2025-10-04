import { z } from "zod";

/**
 * Validation schemas for authentication endpoints
 * Based on the API specifications documentation
 */

// Email validation
const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email must be at least 5 characters")
  .max(255, "Email must not exceed 255 characters")
  .transform((email) => email.toLowerCase().trim());

// Password validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one number"
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    "Password must contain at least one special character"
  );

// Company name validation
const companyNameSchema = z
  .string()
  .min(2, "Company name must be at least 2 characters")
  .max(100, "Company name must not exceed 100 characters")
  .trim();

// Name validation
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .trim();

// Industry validation
const industrySchema = z
  .string()
  .min(2, "Industry must be at least 2 characters")
  .max(50, "Industry must not exceed 50 characters");

// Company size validation
const companySizeSchema = z.enum([
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001+",
]);

// Country validation
const countrySchema = z
  .string()
  .min(2, "Country must be at least 2 characters")
  .max(60, "Country must not exceed 60 characters");

// JWT token validation
const tokenSchema = z
  .string()
  .min(10, "Token is too short")
  .regex(
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    "Invalid JWT token format"
  );

/**
 * Company Registration Schema
 * POST /api/auth/register
 */
export const companyRegistrationSchema = z.object({
  company: z.object({
    name: companyNameSchema,
    industry: industrySchema,
    size: companySizeSchema,
    country: countrySchema,
  }),
  admin: z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});

/**
 * User Login Schema
 * POST /api/auth/login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

/**
 * Token Refresh Schema
 * POST /api/auth/refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: tokenSchema,
});

/**
 * Logout Schema
 * POST /api/auth/logout
 */
export const logoutSchema = z.object({
  refreshToken: tokenSchema,
});

/**
 * Password Reset Request Schema
 * POST /api/auth/forgot-password
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Password Reset Confirmation Schema
 * POST /api/auth/reset-password
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Reset token is required"),
  newPassword: passwordSchema,
});

/**
 * User Creation Schema (for admin creating users)
 * POST /api/users
 */
export const createUserSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).default("EMPLOYEE"),
  department: z
    .string()
    .max(50, "Department must not exceed 50 characters")
    .optional(),
  managerId: z.string().cuid("Invalid manager ID").optional(),
});

/**
 * User Update Schema
 * PUT /api/users/me or PUT /api/users/{id}
 */
export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  department: z
    .string()
    .max(50, "Department must not exceed 50 characters")
    .optional(),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]).optional(),
  managerId: z.string().cuid("Invalid manager ID").optional(),
});

/**
 * Change Password Schema
 * PUT /api/users/me/password
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// Type exports for TypeScript
export type CompanyRegistrationInput = z.infer<
  typeof companyRegistrationSchema
>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Validation utility function
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        ),
      };
    }
    return {
      success: false,
      errors: ["Validation failed"],
    };
  }
}

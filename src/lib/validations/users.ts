import { z } from "zod";

/**
 * Validation schemas for user management endpoints
 * Based on the database schema and API documentation requirements
 */

// Common field validations
const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, apostrophes, and hyphens"
  )
  .trim();

const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email must be at least 5 characters")
  .max(100, "Email must not exceed 100 characters")
  .toLowerCase()
  .trim();

const roleSchema = z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]);

const userIdSchema = z
  .string()
  .min(1, "User ID is required")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid user ID format");

/**
 * Update Current User Profile Schema
 * PUT /api/users/me
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
});

/**
 * Create User Schema
 * POST /api/users
 */
export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  role: roleSchema,
  managerId: userIdSchema.optional(),
});

/**
 * Update User Schema (Admin only)
 * PUT /api/users/{id}
 */
export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  role: roleSchema.optional(),
  managerId: userIdSchema.optional().nullable(),
});

/**
 * Query Parameters for List Users
 * GET /api/users
 */
export const usersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  role: roleSchema.optional(),
  search: z
    .string()
    .min(1, "Search term must be at least 1 character")
    .max(100, "Search term must not exceed 100 characters")
    .optional(),
  sortBy: z
    .enum(["name", "email", "role", "createdAt"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Type exports for TypeScript
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UsersQueryInput = z.infer<typeof usersQuerySchema>;

/**
 * Validation utility function for users
 */
export function validateUserInput<T>(
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
 * Validate manager assignment business rules
 */
export function validateManagerAssignment(
  userRole: string,
  managerId?: string | null
): {
  success: boolean;
  error?: string;
} {
  // ADMINs should not have managers
  if (userRole === "ADMIN" && managerId) {
    return {
      success: false,
      error: "Admin users cannot have managers",
    };
  }

  // MANAGERs and EMPLOYEEs should have managers (unless ADMIN is assigning)
  if ((userRole === "MANAGER" || userRole === "EMPLOYEE") && !managerId) {
    return {
      success: false,
      error: "Managers and employees must have a manager assigned",
    };
  }

  return { success: true };
}

/**
 * Validate role hierarchy for updates
 */
export function validateRoleHierarchy(
  currentUserRole: string,
  targetRole?: string
): {
  success: boolean;
  error?: string;
} {
  if (!targetRole) return { success: true };

  // Only ADMINs can assign ADMIN role
  if (targetRole === "ADMIN" && currentUserRole !== "ADMIN") {
    return {
      success: false,
      error: "Only admins can assign admin role",
    };
  }

  // Only ADMINs can assign MANAGER role
  if (targetRole === "MANAGER" && currentUserRole !== "ADMIN") {
    return {
      success: false,
      error: "Only admins can assign manager role",
    };
  }

  return { success: true };
}

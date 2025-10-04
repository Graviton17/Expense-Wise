import { z } from "zod";

/**
 * Validation schemas for expense category endpoints
 * Based on the database schema and business requirements
 */

// Category name validation
const categoryNameSchema = z
  .string()
  .min(2, "Category name must be at least 2 characters")
  .max(50, "Category name must not exceed 50 characters")
  .regex(
    /^[a-zA-Z0-9\s&-]+$/,
    "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"
  )
  .trim();

/**
 * Create Category Schema
 * POST /api/categories
 */
export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

/**
 * Update Category Schema
 * PUT /api/categories/{id}
 */
export const updateCategorySchema = z.object({
  name: categoryNameSchema,
});

// Type exports for TypeScript
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/**
 * Validation utility function for categories
 */
export function validateCategoryInput<T>(
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

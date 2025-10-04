import { z } from "zod";

/**
 * Validation schemas for approval endpoints
 * Based on the API documentation and database schema requirements
 */

// Common validation
const objectIdSchema = z
  .string()
  .min(1, "ID must not be empty")
  .refine((id) => id.length > 0, "Invalid ID format");

// Approval status validation
const approvalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"], {
  message: "Status must be PENDING, APPROVED, or REJECTED",
});

// Approval sequence validation
const approvalSequenceSchema = z.enum(["SEQUENTIAL", "PARALLEL"], {
  message: "Sequence must be SEQUENTIAL or PARALLEL",
});

/**
 * Pending Approvals Query Schema
 * GET /api/approvals/pending
 */
export const pendingApprovalsQuerySchema = z.object({
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
  status: approvalStatusSchema.optional(),
  sortBy: z.enum(["submittedAt", "amount"]).optional().default("submittedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Approve Expense Schema
 * POST /api/approvals/[expenseId]/approve
 */
export const approveExpenseSchema = z.object({
  comment: z
    .string()
    .optional()
    .refine(
      (comment) => !comment || comment.trim().length > 0,
      "Comment must not be empty if provided"
    ),
});

/**
 * Reject Expense Schema
 * POST /api/approvals/[expenseId]/reject
 */
export const rejectExpenseSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason is required for rejection")
    .max(500, "Reason must not exceed 500 characters"),
  comment: z
    .string()
    .min(1, "Comment is required for rejection")
    .max(1000, "Comment must not exceed 1000 characters"),
});

/**
 * Approval Rule Conditions Schema
 */
const approvalRuleConditionsSchema = z.object({
  amountThreshold: z
    .number()
    .min(0, "Amount threshold must be positive")
    .optional(),
  categories: z
    .array(z.string().min(1, "Category ID must not be empty"))
    .optional(),
  userRoles: z.array(z.enum(["ADMIN", "MANAGER", "EMPLOYEE"])).optional(),
  departmentIds: z
    .array(z.string().min(1, "Department ID must not be empty"))
    .optional(),
});

/**
 * Create Approval Rule Schema
 * POST /api/approval-rules
 */
export const createApprovalRuleSchema = z.object({
  name: z
    .string()
    .min(1, "Rule name is required")
    .max(100, "Rule name must not exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  conditions: approvalRuleConditionsSchema,
  approvers: z
    .array(objectIdSchema)
    .min(1, "At least one approver is required")
    .max(10, "Maximum 10 approvers allowed"),
  sequence: approvalSequenceSchema,
  minApprovalPercentage: z
    .number()
    .min(1, "Minimum approval percentage must be at least 1%")
    .max(100, "Minimum approval percentage cannot exceed 100%"),
  isManagerApprovalRequired: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

/**
 * Update Approval Rule Schema
 * PUT /api/approval-rules/[ruleId]
 */
export const updateApprovalRuleSchema = z
  .object({
    name: z
      .string()
      .min(1, "Rule name is required")
      .max(100, "Rule name must not exceed 100 characters")
      .optional(),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    conditions: approvalRuleConditionsSchema.optional(),
    approvers: z
      .array(objectIdSchema)
      .min(1, "At least one approver is required")
      .max(10, "Maximum 10 approvers allowed")
      .optional(),
    sequence: approvalSequenceSchema.optional(),
    minApprovalPercentage: z
      .number()
      .min(1, "Minimum approval percentage must be at least 1%")
      .max(100, "Minimum approval percentage cannot exceed 100%")
      .optional(),
    isManagerApprovalRequired: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

/**
 * Approval Rules Query Schema
 * GET /api/approval-rules
 */
export const approvalRulesQuerySchema = z.object({
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
  isActive: z
    .string()
    .optional()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),
  sortBy: z
    .enum(["name", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Type exports for TypeScript
export type PendingApprovalsQueryInput = z.infer<
  typeof pendingApprovalsQuerySchema
>;
export type ApproveExpenseInput = z.infer<typeof approveExpenseSchema>;
export type RejectExpenseInput = z.infer<typeof rejectExpenseSchema>;
export type CreateApprovalRuleInput = z.infer<typeof createApprovalRuleSchema>;
export type UpdateApprovalRuleInput = z.infer<typeof updateApprovalRuleSchema>;
export type ApprovalRulesQueryInput = z.infer<typeof approvalRulesQuerySchema>;

/**
 * Validation utility function for approvals
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
 * Legacy validation utility function for approvals
 */
export function validateApprovalInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  return validateUserInput(schema, data);
}

/**
 * Validate role-based access for approvals
 */
export function validateApprovalAccess(
  userRole: string,
  action: "view" | "approve" | "reject" | "manage-rules"
): {
  success: boolean;
  error?: string;
} {
  switch (action) {
    case "view":
    case "approve":
    case "reject":
      // Only managers and admins can handle approvals
      if (userRole === "MANAGER" || userRole === "ADMIN") {
        return { success: true };
      }
      return {
        success: false,
        error: "Access denied: Only managers and admins can handle approvals",
      };

    case "manage-rules":
      // Only admins can manage approval rules
      if (userRole === "ADMIN") {
        return { success: true };
      }
      return {
        success: false,
        error: "Access denied: Only admins can manage approval rules",
      };

    default:
      return {
        success: false,
        error: "Invalid action specified",
      };
  }
}

/**
 * Validate expense approval authorization
 */
export function validateExpenseApprovalAuth(
  approverUserId: string,
  requestingUserId: string,
  approvalStatus: string
): {
  success: boolean;
  error?: string;
} {
  // Check if user is the assigned approver
  if (approverUserId !== requestingUserId) {
    return {
      success: false,
      error: "Access denied: You are not authorized to approve this expense",
    };
  }

  // Check if approval is still pending
  if (approvalStatus !== "PENDING") {
    return {
      success: false,
      error: `Expense has already been ${approvalStatus.toLowerCase()}`,
    };
  }

  return { success: true };
}

/**
 * Helper function to validate approval rule configuration
 */
export function validateApprovalRuleConfig(
  approvers: string[],
  sequence: string,
  minApprovalPercentage: number
): {
  success: boolean;
  error?: string;
} {
  // For sequential approval, percentage should be 100%
  if (sequence === "SEQUENTIAL" && minApprovalPercentage !== 100) {
    return {
      success: false,
      error: "Sequential approval requires 100% approval percentage",
    };
  }

  // For parallel approval with single approver, percentage should be 100%
  if (
    sequence === "PARALLEL" &&
    approvers.length === 1 &&
    minApprovalPercentage !== 100
  ) {
    return {
      success: false,
      error: "Single approver requires 100% approval percentage",
    };
  }

  // Calculate minimum required approvers based on percentage
  const requiredApprovers = Math.ceil(
    (approvers.length * minApprovalPercentage) / 100
  );
  if (requiredApprovers === 0) {
    return {
      success: false,
      error: "Approval configuration would require zero approvers",
    };
  }

  return { success: true };
}

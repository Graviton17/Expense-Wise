import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { ApiResponse } from "@/types/api";
import {
  approvalRulesQuerySchema,
  createApprovalRuleSchema,
  validateApprovalAccess,
  validateUserInput,
  validateApprovalRuleConfig,
  type ApprovalRulesQueryInput,
  type CreateApprovalRuleInput,
} from "@/lib/validations/approvals";
import { prisma } from "@/lib/prisma";

// Define user type for TypeScript
interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: string;
}

interface AuthenticatedRequest extends NextRequest {
  user: AuthenticatedUser;
}

interface ApprovalRule {
  id: string;
  name: string;
  description: string | null;
  isManagerApprovalRequired: boolean;
  isSequenceRequired: boolean;
  minApprovalPercentage: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  approvers: Array<{
    id: string;
    name: string;
    email: string;
    sequenceOrder: number | null;
    isRequired: boolean;
  }>;
  conditions: {
    amountThreshold?: number;
    categories?: string[];
    userRoles?: string[];
    departmentIds?: string[];
  };
}

interface ApprovalRulesResponse {
  rules: ApprovalRule[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

interface CreateApprovalRuleResponse {
  rule: ApprovalRule;
}

/**
 * GET /api/approval-rules?page=1&limit=20&isActive=true
 * Get approval rules for the company (Admin only)
 */
export const GET = withAuth(
  async (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<ApprovalRulesResponse>>> => {
    try {
      const user = (request as AuthenticatedRequest).user;

      // Validate role-based access - only admins can manage approval rules
      const accessValidation = validateApprovalAccess(
        user.role,
        "manage-rules"
      );
      if (!accessValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message: accessValidation.error || "Access denied",
            error: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      // Parse and validate query parameters
      const searchParams = Object.fromEntries(
        request.nextUrl.searchParams.entries()
      );
      const validation = validateUserInput(
        approvalRulesQuerySchema,
        searchParams
      );

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid query parameters",
            error: "VALIDATION_ERROR",
            details: validation.errors,
          },
          { status: 400 }
        );
      }

      const validatedQuery: ApprovalRulesQueryInput = validation.data!;

      // Build where conditions
      const whereConditions: Record<string, unknown> = {
        companyId: user.companyId,
      };

      if (validatedQuery.isActive !== undefined) {
        whereConditions.isActive = validatedQuery.isActive;
      }

      // Get total count
      const total = await prisma.approvalRule.count({
        where: whereConditions,
      });

      // Get approval rules with pagination
      const rules = await prisma.approvalRule.findMany({
        where: whereConditions,
        include: {
          approvers: {
            include: {
              approver: true,
            },
            orderBy: {
              sequenceOrder: "asc",
            },
          },
        },
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
        orderBy: {
          [validatedQuery.sortBy]: validatedQuery.sortOrder,
        },
      });

      // Format response
      const formattedRules: ApprovalRule[] = rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        isManagerApprovalRequired: rule.isManagerApprovalRequired,
        isSequenceRequired: rule.isSequenceRequired,
        minApprovalPercentage: rule.minApprovalPercentage,
        isActive: true, // TODO: Add isActive field to schema
        createdAt: rule.createdAt.toISOString(),
        updatedAt: rule.updatedAt.toISOString(),
        approvers: rule.approvers.map((approver) => ({
          id: approver.approver.id,
          name: approver.approver.name,
          email: approver.approver.email,
          sequenceOrder: approver.sequenceOrder,
          isRequired: approver.isRequired,
        })),
        conditions: {
          // TODO: Parse conditions from database or add conditions field
        },
      }));

      return NextResponse.json(
        {
          success: true,
          message: "Approval rules retrieved successfully",
          data: {
            rules: formattedRules,
            pagination: {
              total,
              page: validatedQuery.page,
              limit: validatedQuery.limit,
              totalPages: Math.ceil(total / validatedQuery.limit),
              hasNext:
                validatedQuery.page < Math.ceil(total / validatedQuery.limit),
              hasPrevious: validatedQuery.page > 1,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching approval rules:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch approval rules",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

/**
 * POST /api/approval-rules
 * Create a new approval rule (Admin only)
 */
export const POST = withAuth(
  async (
    request: NextRequest
  ): Promise<NextResponse<ApiResponse<CreateApprovalRuleResponse>>> => {
    try {
      const user = (request as AuthenticatedRequest).user;

      // Validate role-based access - only admins can manage approval rules
      const accessValidation = validateApprovalAccess(
        user.role,
        "manage-rules"
      );
      if (!accessValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message: accessValidation.error || "Access denied",
            error: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      const validation = validateUserInput(createApprovalRuleSchema, body);

      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid request body",
            error: "VALIDATION_ERROR",
            details: validation.errors,
          },
          { status: 400 }
        );
      }

      const ruleData: CreateApprovalRuleInput = validation.data!;

      // Validate approval rule configuration
      const configValidation = validateApprovalRuleConfig(
        ruleData.approvers,
        ruleData.sequence,
        ruleData.minApprovalPercentage
      );

      if (!configValidation.success) {
        return NextResponse.json(
          {
            success: false,
            message:
              configValidation.error || "Invalid approval rule configuration",
            error: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      // Verify all approvers exist and belong to the same company
      const approvers = await prisma.user.findMany({
        where: {
          id: { in: ruleData.approvers },
          companyId: user.companyId,
        },
      });

      if (approvers.length !== ruleData.approvers.length) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Some approvers do not exist or do not belong to your company",
            error: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

      // Create approval rule
      const newRule = await prisma.approvalRule.create({
        data: {
          name: ruleData.name,
          description: ruleData.description || null,
          isManagerApprovalRequired: ruleData.isManagerApprovalRequired,
          isSequenceRequired: ruleData.sequence === "SEQUENTIAL",
          minApprovalPercentage: ruleData.minApprovalPercentage,
          companyId: user.companyId,
          approvers: {
            create: ruleData.approvers.map((approverId, index) => ({
              approverId,
              sequenceOrder:
                ruleData.sequence === "SEQUENTIAL" ? index + 1 : null,
              isRequired: true,
            })),
          },
        },
        include: {
          approvers: {
            include: {
              approver: true,
            },
            orderBy: {
              sequenceOrder: "asc",
            },
          },
        },
      });

      // Format response
      const formattedRule: ApprovalRule = {
        id: newRule.id,
        name: newRule.name,
        description: newRule.description,
        isManagerApprovalRequired: newRule.isManagerApprovalRequired,
        isSequenceRequired: newRule.isSequenceRequired,
        minApprovalPercentage: newRule.minApprovalPercentage,
        isActive: ruleData.isActive,
        createdAt: newRule.createdAt.toISOString(),
        updatedAt: newRule.updatedAt.toISOString(),
        approvers: newRule.approvers.map((approver) => ({
          id: approver.approver.id,
          name: approver.approver.name,
          email: approver.approver.email,
          sequenceOrder: approver.sequenceOrder,
          isRequired: approver.isRequired,
        })),
        conditions: ruleData.conditions,
      };

      return NextResponse.json(
        {
          success: true,
          message: "Approval rule created successfully",
          data: {
            rule: formattedRule,
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error creating approval rule:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to create approval rule",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

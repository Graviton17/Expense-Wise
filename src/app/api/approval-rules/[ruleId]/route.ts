import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/auth";
import { ApiResponse } from "@/types/api";
import {
  updateApprovalRuleSchema,
  validateApprovalAccess,
  validateUserInput,
  validateApprovalRuleConfig,
  type UpdateApprovalRuleInput,
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

interface UpdateApprovalRuleResponse {
  rule: ApprovalRule;
}

/**
 * PUT /api/approval-rules/[ruleId]
 * Update an approval rule (Admin only)
 */
export const PUT = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse<ApiResponse<UpdateApprovalRuleResponse>>> => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const ruleId = context?.params?.ruleId;

      if (!ruleId) {
        return NextResponse.json(
          {
            success: false,
            message: "Rule ID is required",
            error: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

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
      const validation = validateUserInput(updateApprovalRuleSchema, body);

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

      const updateData: UpdateApprovalRuleInput = validation.data!;

      // Check if the rule exists and belongs to the user's company
      const existingRule = await prisma.approvalRule.findFirst({
        where: {
          id: ruleId,
          companyId: user.companyId,
        },
        include: {
          approvers: {
            include: {
              approver: true,
            },
          },
        },
      });

      if (!existingRule) {
        return NextResponse.json(
          {
            success: false,
            message: "Approval rule not found",
            error: "NOT_FOUND",
          },
          { status: 404 }
        );
      }

      // Validate approval rule configuration if approvers or settings are being updated
      if (updateData.approvers || updateData.minApprovalPercentage) {
        const approversToValidate =
          updateData.approvers ||
          existingRule.approvers.map((a) => a.approverId);
        const sequenceToValidate =
          updateData.sequence ||
          (existingRule.isSequenceRequired ? "SEQUENTIAL" : "PARALLEL");
        const percentageToValidate =
          updateData.minApprovalPercentage ||
          existingRule.minApprovalPercentage ||
          100;

        const configValidation = validateApprovalRuleConfig(
          approversToValidate,
          sequenceToValidate,
          percentageToValidate
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
      }

      // If approvers are being updated, verify they exist and belong to the same company
      if (updateData.approvers) {
        const approvers = await prisma.user.findMany({
          where: {
            id: { in: updateData.approvers },
            companyId: user.companyId,
          },
        });

        if (approvers.length !== updateData.approvers.length) {
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
      }

      // Prepare update data
      const updateFields: Record<string, unknown> = {};

      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.description !== undefined)
        updateFields.description = updateData.description;
      if (updateData.isManagerApprovalRequired !== undefined)
        updateFields.isManagerApprovalRequired =
          updateData.isManagerApprovalRequired;
      if (updateData.sequence)
        updateFields.isSequenceRequired = updateData.sequence === "SEQUENTIAL";
      if (updateData.minApprovalPercentage !== undefined)
        updateFields.minApprovalPercentage = updateData.minApprovalPercentage;

      // Update approval rule
      const updatedRule = await prisma.approvalRule.update({
        where: { id: ruleId },
        data: updateFields,
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

      // Update approvers if provided
      if (updateData.approvers) {
        // Delete existing approvers
        await prisma.ruleApprover.deleteMany({
          where: { ruleId },
        });

        // Create new approvers
        await prisma.ruleApprover.createMany({
          data: updateData.approvers.map((approverId, index) => ({
            ruleId,
            approverId,
            sequenceOrder:
              updateData.sequence === "SEQUENTIAL" ? index + 1 : null,
            isRequired: true,
          })),
        });

        // Refetch the rule with updated approvers
        const finalRule = await prisma.approvalRule.findUnique({
          where: { id: ruleId },
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

        if (!finalRule) {
          throw new Error("Failed to retrieve updated rule");
        }

        // Format response
        const formattedRule: ApprovalRule = {
          id: finalRule.id,
          name: finalRule.name,
          description: finalRule.description,
          isManagerApprovalRequired: finalRule.isManagerApprovalRequired,
          isSequenceRequired: finalRule.isSequenceRequired,
          minApprovalPercentage: finalRule.minApprovalPercentage,
          isActive: updateData.isActive ?? true,
          createdAt: finalRule.createdAt.toISOString(),
          updatedAt: finalRule.updatedAt.toISOString(),
          approvers: finalRule.approvers.map((approver) => ({
            id: approver.approver.id,
            name: approver.approver.name,
            email: approver.approver.email,
            sequenceOrder: approver.sequenceOrder,
            isRequired: approver.isRequired,
          })),
          conditions: updateData.conditions || {},
        };

        return NextResponse.json(
          {
            success: true,
            message: "Approval rule updated successfully",
            data: {
              rule: formattedRule,
            },
          },
          { status: 200 }
        );
      }

      // Format response for non-approver updates
      const formattedRule: ApprovalRule = {
        id: updatedRule.id,
        name: updatedRule.name,
        description: updatedRule.description,
        isManagerApprovalRequired: updatedRule.isManagerApprovalRequired,
        isSequenceRequired: updatedRule.isSequenceRequired,
        minApprovalPercentage: updatedRule.minApprovalPercentage,
        isActive: updateData.isActive ?? true,
        createdAt: updatedRule.createdAt.toISOString(),
        updatedAt: updatedRule.updatedAt.toISOString(),
        approvers: updatedRule.approvers.map((approver) => ({
          id: approver.approver.id,
          name: approver.approver.name,
          email: approver.approver.email,
          sequenceOrder: approver.sequenceOrder,
          isRequired: approver.isRequired,
        })),
        conditions: updateData.conditions || {},
      };

      return NextResponse.json(
        {
          success: true,
          message: "Approval rule updated successfully",
          data: {
            rule: formattedRule,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating approval rule:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to update approval rule",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

/**
 * DELETE /api/approval-rules/[ruleId]
 * Delete an approval rule (Admin only)
 */
export const DELETE = withAuth(
  async (
    request: NextRequest,
    context?: { params?: Record<string, string> }
  ): Promise<NextResponse<ApiResponse<{ message: string }>>> => {
    try {
      const user = (request as AuthenticatedRequest).user;
      const ruleId = context?.params?.ruleId;

      if (!ruleId) {
        return NextResponse.json(
          {
            success: false,
            message: "Rule ID is required",
            error: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }

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

      // Check if the rule exists and belongs to the user's company
      const existingRule = await prisma.approvalRule.findFirst({
        where: {
          id: ruleId,
          companyId: user.companyId,
        },
      });

      if (!existingRule) {
        return NextResponse.json(
          {
            success: false,
            message: "Approval rule not found",
            error: "NOT_FOUND",
          },
          { status: 404 }
        );
      }

      // TODO: Check if the rule is currently being used in any pending approvals
      // If so, prevent deletion or require force flag

      // Delete the approval rule (this will cascade delete approvers due to foreign key constraints)
      await prisma.approvalRule.delete({
        where: { id: ruleId },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Approval rule deleted successfully",
          data: {
            message: `Approval rule "${existingRule.name}" has been deleted`,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error deleting approval rule:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete approval rule",
          error: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  },
  { roles: ["ADMIN"] }
);

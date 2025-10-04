import { prisma } from "@/lib/prisma";
import { userCache } from "@/lib/cache";
import { hashPassword, comparePassword } from "@/lib/jwt";
import { generateTokenPair } from "@/lib/jwt";
import {
  User,
  UserPublic,
  UserCreateInput,
  UserUpdateInput,
  UserRole,
  ServiceResult,
  PaginatedResult,
  UserFilters,
  PaginationParams,
} from "@/types";
import { sendEmail } from "@/lib/email";
import { businessLogger } from "@/middleware/logger";

export class UserService {
  // Create a new user
  static async createUser(
    data: UserCreateInput
  ): Promise<ServiceResult<UserPublic>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: {
            message: "User with this email already exists",
            code: "USER_ALREADY_EXISTS",
          },
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
        include: {
          company: true,
          manager: true,
        },
      });

      // Remove password from response
      const userPublic = this.toPublicUser(user);

      // Cache user data
      await userCache.set(`user:${user.id}`, userPublic, 3600); // 1 hour

      // Send welcome email
      await sendEmail({
        to: user.email,
        template: "welcome",
        context: {
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.company?.name,
        },
      }).catch((error) => {
        businessLogger.error("Failed to send welcome email", error, {
          userId: user.id,
        });
      });

      businessLogger.logUserAction("user_created", user.id, {
        role: user.role,
      });

      return {
        success: true,
        data: userPublic,
      };
    } catch (error) {
      businessLogger.error("Failed to create user", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to create user",
          code: "USER_CREATION_FAILED",
        },
      };
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<ServiceResult<UserPublic>> {
    try {
      // Try cache first
      const cachedUser = await userCache.get<UserPublic>(`user:${id}`);
      if (cachedUser) {
        return {
          success: true,
          data: cachedUser,
        };
      }

      // Fetch from database
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          company: true,
          manager: true,
          directReports: true,
        },
      });

      if (!user) {
        return {
          success: false,
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        };
      }

      const userPublic = this.toPublicUser(user);

      // Cache user data
      await userCache.set(`user:${id}`, userPublic, 3600);

      return {
        success: true,
        data: userPublic,
      };
    } catch (error) {
      businessLogger.error("Failed to get user", error as Error, {
        userId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve user",
          code: "USER_FETCH_FAILED",
        },
      };
    }
  }

  // Get users with pagination and filters
  static async getUsers(
    filters: UserFilters,
    pagination: PaginationParams
  ): Promise<ServiceResult<PaginatedResult<UserPublic>>> {
    try {
      const where: any = {};

      // Apply filters
      if (filters.companyId) {
        where.companyId = filters.companyId;
      }

      if (filters.role) {
        where.role = Array.isArray(filters.role)
          ? { in: filters.role }
          : filters.role;
      }

      if (filters.managerId) {
        where.managerId = filters.managerId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.search) {
        where.OR = [
          { firstName: { contains: filters.search, mode: "insensitive" } },
          { lastName: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Get total count
      const total = await prisma.user.count({ where });

      // Get users
      const users = await prisma.user.findMany({
        where,
        include: {
          company: true,
          manager: true,
        },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const userPublics = users.map((user) => this.toPublicUser(user));

      return {
        success: true,
        data: {
          data: userPublics,
          meta: {
            page: pagination.page,
            limit: pagination.limit,
            total,
            pages: Math.ceil(total / pagination.limit),
            hasNext: pagination.offset + pagination.limit < total,
            hasPrevious: pagination.page > 1,
          },
        },
      };
    } catch (error) {
      businessLogger.error("Failed to get users", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to retrieve users",
          code: "USERS_FETCH_FAILED",
        },
      };
    }
  }

  // Update user
  static async updateUser(
    id: string,
    data: UserUpdateInput,
    updatedBy: string
  ): Promise<ServiceResult<UserPublic>> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return {
          success: false,
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        };
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data,
        include: {
          company: true,
          manager: true,
        },
      });

      const userPublic = this.toPublicUser(user);

      // Update cache
      await userCache.set(`user:${id}`, userPublic, 3600);

      businessLogger.logUserAction("user_updated", updatedBy, {
        targetUserId: id,
        changes: data,
      });

      return {
        success: true,
        data: userPublic,
      };
    } catch (error) {
      businessLogger.error("Failed to update user", error as Error, {
        userId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to update user",
          code: "USER_UPDATE_FAILED",
        },
      };
    }
  }

  // Deactivate user (soft delete)
  static async deactivateUser(
    id: string,
    deactivatedBy: string
  ): Promise<ServiceResult<boolean>> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      // Remove from cache
      await userCache.del(`user:${id}`);

      businessLogger.logUserAction("user_deactivated", deactivatedBy, {
        targetUserId: id,
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      businessLogger.error("Failed to deactivate user", error as Error, {
        userId: id,
      });
      return {
        success: false,
        error: {
          message: "Failed to deactivate user",
          code: "USER_DEACTIVATION_FAILED",
        },
      };
    }
  }

  // Authenticate user
  static async authenticateUser(
    email: string,
    password: string
  ): Promise<ServiceResult<{ user: UserPublic; tokens: any }>> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          company: true,
          manager: true,
        },
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          },
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: {
            message: "Invalid credentials",
            code: "INVALID_CREDENTIALS",
          },
        };
      }

      // Generate tokens
      const tokens = await generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const userPublic = this.toPublicUser(user);

      // Cache user data
      await userCache.set(`user:${user.id}`, userPublic, 3600);

      businessLogger.logUserAction("user_login", user.id);

      return {
        success: true,
        data: {
          user: userPublic,
          tokens,
        },
      };
    } catch (error) {
      businessLogger.error("Failed to authenticate user", error as Error, {
        email,
      });
      return {
        success: false,
        error: {
          message: "Authentication failed",
          code: "AUTHENTICATION_FAILED",
        },
      };
    }
  }

  // Change user password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ServiceResult<boolean>> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return {
          success: false,
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: {
            message: "Current password is incorrect",
            code: "INVALID_CURRENT_PASSWORD",
          },
        };
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      businessLogger.logSecurityEvent("password_change", userId);

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      businessLogger.error("Failed to change password", error as Error, {
        userId,
      });
      return {
        success: false,
        error: {
          message: "Failed to change password",
          code: "PASSWORD_CHANGE_FAILED",
        },
      };
    }
  }

  // Get users by manager
  static async getUsersByManager(
    managerId: string
  ): Promise<ServiceResult<UserPublic[]>> {
    try {
      const users = await prisma.user.findMany({
        where: {
          managerId,
          isActive: true,
        },
        include: {
          company: true,
        },
        orderBy: {
          firstName: "asc",
        },
      });

      const userPublics = users.map((user) => this.toPublicUser(user));

      return {
        success: true,
        data: userPublics,
      };
    } catch (error) {
      businessLogger.error("Failed to get users by manager", error as Error, {
        managerId,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve users",
          code: "USERS_FETCH_FAILED",
        },
      };
    }
  }

  // Helper method to convert User to UserPublic
  private static toPublicUser(user: any): UserPublic {
    const { password, ...userPublic } = user;
    return userPublic as UserPublic;
  }
}

export default UserService;

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  Notification,
  NotificationPublic,
  NotificationType,
  ServiceResult,
  PaginatedResult,
  PaginationParams,
} from "@/types";
import { businessLogger } from "@/middleware/logger";

export class NotificationService {
  // Create notification
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
  }): Promise<ServiceResult<NotificationPublic>> {
    try {
      const notification = await prisma.notification.create({
        data: {
          ...data,
          isRead: false,
        },
      });

      businessLogger.logSystemEvent("notification_created", {
        notificationId: notification.id,
        userId: data.userId,
        type: data.type,
      });

      return {
        success: true,
        data: this.toPublicNotification(notification),
      };
    } catch (error) {
      businessLogger.error("Failed to create notification", error as Error);
      return {
        success: false,
        error: {
          message: "Failed to create notification",
          code: "NOTIFICATION_CREATION_FAILED",
        },
      };
    }
  }

  // Get notifications for user
  static async getNotificationsForUser(
    userId: string,
    pagination: PaginationParams,
    unreadOnly: boolean = false
  ): Promise<ServiceResult<PaginatedResult<NotificationPublic>>> {
    try {
      const where: any = { userId };

      if (unreadOnly) {
        where.isRead = false;
      }

      const total = await prisma.notification.count({ where });

      const notifications = await prisma.notification.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: {
          createdAt: "desc",
        },
      });

      const notificationPublics = notifications.map((notification) =>
        this.toPublicNotification(notification)
      );

      return {
        success: true,
        data: {
          data: notificationPublics,
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
      businessLogger.error("Failed to get notifications", error as Error, {
        userId,
      });
      return {
        success: false,
        error: {
          message: "Failed to retrieve notifications",
          code: "NOTIFICATIONS_FETCH_FAILED",
        },
      };
    }
  }

  // Mark notification as read
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<ServiceResult<NotificationPublic>> {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure user owns the notification
        },
        data: {
          isRead: true,
        },
      });

      return {
        success: true,
        data: this.toPublicNotification(notification),
      };
    } catch (error) {
      businessLogger.error(
        "Failed to mark notification as read",
        error as Error,
        { notificationId }
      );
      return {
        success: false,
        error: {
          message: "Failed to mark notification as read",
          code: "NOTIFICATION_UPDATE_FAILED",
        },
      };
    }
  }

  // Mark all notifications as read for user
  static async markAllAsRead(userId: string): Promise<ServiceResult<boolean>> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      businessLogger.error(
        "Failed to mark all notifications as read",
        error as Error,
        { userId }
      );
      return {
        success: false,
        error: {
          message: "Failed to mark all notifications as read",
          code: "NOTIFICATIONS_UPDATE_FAILED",
        },
      };
    }
  }

  // Get unread count for user
  static async getUnreadCount(userId: string): Promise<ServiceResult<number>> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return {
        success: true,
        data: count,
      };
    } catch (error) {
      businessLogger.error("Failed to get unread count", error as Error, {
        userId,
      });
      return {
        success: false,
        error: {
          message: "Failed to get unread count",
          code: "UNREAD_COUNT_FAILED",
        },
      };
    }
  }

  // Delete notification
  static async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<ServiceResult<boolean>> {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
          userId, // Ensure user owns the notification
        },
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      businessLogger.error("Failed to delete notification", error as Error, {
        notificationId,
      });
      return {
        success: false,
        error: {
          message: "Failed to delete notification",
          code: "NOTIFICATION_DELETION_FAILED",
        },
      };
    }
  }

  // Business-specific notification methods
  static async notifyExpenseSubmitted(
    expenseId: string,
    expenseAmount: number,
    expenseCurrency: string,
    submitterName: string,
    approverIds: string[]
  ): Promise<void> {
    const title = "New Expense Approval Required";
    const message = `${submitterName} submitted an expense of ${expenseCurrency} ${expenseAmount} for approval.`;

    for (const approverId of approverIds) {
      await this.createNotification({
        userId: approverId,
        type: "APPROVAL_REQUIRED",
        title,
        message,
        data: { expenseId, amount: expenseAmount, currency: expenseCurrency },
      });
    }
  }

  static async notifyExpenseApproved(
    expenseId: string,
    expenseAmount: number,
    expenseCurrency: string,
    approverName: string,
    submitterId: string
  ): Promise<void> {
    await this.createNotification({
      userId: submitterId,
      type: "EXPENSE_APPROVED",
      title: "Expense Approved",
      message: `Your expense of ${expenseCurrency} ${expenseAmount} has been approved by ${approverName}.`,
      data: { expenseId, amount: expenseAmount, currency: expenseCurrency },
    });
  }

  static async notifyExpenseRejected(
    expenseId: string,
    expenseAmount: number,
    expenseCurrency: string,
    approverName: string,
    rejectionReason: string,
    submitterId: string
  ): Promise<void> {
    await this.createNotification({
      userId: submitterId,
      type: "EXPENSE_REJECTED",
      title: "Expense Rejected",
      message: `Your expense of ${expenseCurrency} ${expenseAmount} has been rejected by ${approverName}. Reason: ${rejectionReason}`,
      data: {
        expenseId,
        amount: expenseAmount,
        currency: expenseCurrency,
        reason: rejectionReason,
      },
    });
  }

  static async notifySystemMaintenance(
    userIds: string[],
    maintenanceDate: string,
    duration: string
  ): Promise<void> {
    const title = "Scheduled System Maintenance";
    const message = `System maintenance is scheduled for ${maintenanceDate} and will last approximately ${duration}. Please save your work.`;

    for (const userId of userIds) {
      await this.createNotification({
        userId,
        type: "SYSTEM_NOTIFICATION",
        title,
        message,
        data: { maintenanceDate, duration },
      });
    }
  }

  // Send email notifications for important events
  static async sendEmailNotification(
    userId: string,
    subject: string,
    emailTemplate: string,
    templateData: any
  ): Promise<void> {
    try {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (!user) {
        businessLogger.error(
          "User not found for email notification",
          undefined,
          { userId }
        );
        return;
      }

      await sendEmail({
        to: user.email,
        subject,
        template: emailTemplate,
        context: templateData,
      });

      businessLogger.logSystemEvent("email_notification_sent", {
        userId,
        template: emailTemplate,
        subject,
      });
    } catch (error) {
      businessLogger.error(
        "Failed to send email notification",
        error as Error,
        { userId }
      );
    }
  }

  // Cleanup old notifications
  static async cleanupOldNotifications(
    olderThanDays: number = 30
  ): Promise<ServiceResult<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true, // Only delete read notifications
        },
      });

      businessLogger.logSystemEvent("notifications_cleanup", {
        deletedCount: result.count,
        olderThanDays,
      });

      return {
        success: true,
        data: result.count,
      };
    } catch (error) {
      businessLogger.error(
        "Failed to cleanup old notifications",
        error as Error
      );
      return {
        success: false,
        error: {
          message: "Failed to cleanup old notifications",
          code: "NOTIFICATION_CLEANUP_FAILED",
        },
      };
    }
  }

  // Helper method to convert Notification to NotificationPublic
  private static toPublicNotification(notification: any): NotificationPublic {
    return notification as NotificationPublic;
  }
}

export default NotificationService;

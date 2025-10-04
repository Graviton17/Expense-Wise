import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

export class NotificationService {
  // Get notifications for user
  static async getNotificationsForUser(
    userId: string,
    pagination: { page: number; limit: number; offset: number },
    unreadOnly: boolean = false
  ) {
    try {
      const where: { userId: string; isRead?: boolean } = { userId };

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

      return {
        success: true,
        data: {
          data: notifications,
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
      console.error("Failed to get notifications:", error);
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
  static async markAsRead(notificationId: string, userId: string) {
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
        data: notification,
      };
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
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
  static async markAllAsRead(userId: string) {
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
      console.error("Failed to mark all notifications as read:", error);
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
  static async getUnreadCount(userId: string) {
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
      console.error("Failed to get unread count:", error);
      return {
        success: false,
        error: {
          message: "Failed to get unread count",
          code: "UNREAD_COUNT_FAILED",
        },
      };
    }
  }

  // Create notification (for internal use)
  static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          ...data,
          isRead: false,
        },
      });

      return {
        success: true,
        data: notification,
      };
    } catch (error) {
      console.error("Failed to create notification:", error);
      return {
        success: false,
        error: {
          message: "Failed to create notification",
          code: "NOTIFICATION_CREATION_FAILED",
        },
      };
    }
  }
}

export default NotificationService;

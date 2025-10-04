import { z } from "zod";
import { NotificationType } from "@/types/database";

// Query parameters for GET /api/notifications
export const NotificationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(parseInt(val) || 20, 100) : 20))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  unreadOnly: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  type: z.nativeEnum(NotificationType).optional(),
});

// Path parameters for notification ID
export const NotificationIdSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
});

// Request body for creating notifications (used internally by services)
export const CreateNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  data: z.record(z.string(), z.any()).optional(),
});

// Update notification request (for internal use)
export const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  title: z.string().min(1).max(255).optional(),
  message: z.string().min(1).max(1000).optional(),
  data: z.record(z.string(), z.any()).optional(),
});

// Export type definitions
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;
export type NotificationId = z.infer<typeof NotificationIdSchema>;
export type CreateNotificationInput = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof UpdateNotificationSchema>;

import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { NotificationService } from "@/services/notification.service";
import { NotificationIdSchema } from "@/lib/validations/notification";

/**
 * Mark Notification as Read
 * PUT /api/notifications/{id}/read
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Validate notification ID
    const validationResult = NotificationIdSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid notification ID",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { id: notificationId } = validationResult.data;

    // Mark notification as read
    const result = await NotificationService.markAsRead(
      notificationId,
      user.sub
    );

    if (!result.success) {
      if (result.error?.code === "NOTIFICATION_UPDATE_FAILED") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Notification not found or access denied",
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to mark notification as read",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Delete Notification
 * DELETE /api/notifications/{id}
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const user = authResult.user!;

    // Validate notification ID
    const validationResult = NotificationIdSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid notification ID",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { id: notificationId } = validationResult.data;

    // Delete notification
    const result = await NotificationService.deleteNotification(
      notificationId,
      user.sub
    );

    if (!result.success) {
      if (result.error?.code === "NOTIFICATION_DELETION_FAILED") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Notification not found or access denied",
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete notification",
        },
      },
      { status: 500 }
    );
  }
}

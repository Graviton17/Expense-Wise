import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { NotificationService } from "@/services/notification-simple.service";

/**
 * Mark All Notifications as Read
 * PUT /api/notifications/read-all
 */
export async function PUT(request: NextRequest) {
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

    // Mark all notifications as read
    const result = await NotificationService.markAllAsRead(user.sub);

    if (!result.success) {
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
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to mark all notifications as read",
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/middleware/auth";
import { NotificationService } from "@/services/notification-simple.service";
import { NotificationQuerySchema } from "@/lib/validations/notification";

/**
 * Get User Notifications
 * GET /api/notifications?page=1&limit=20&unreadOnly=true
 */
export async function GET(request: NextRequest) {
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

    // Validate query parameters
    const searchParams = Object.fromEntries(
      request.nextUrl.searchParams.entries()
    );
    const validationResult = NotificationQuerySchema.safeParse(searchParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: validationResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { page, limit, unreadOnly, type } = validationResult.data;

    // Calculate pagination
    const offset = (page - 1) * limit;
    const pagination = { page, limit, offset };

    // Build filters
    const filters = {
      unreadOnly,
      type,
    };

    // Get notifications using service
    const result = await NotificationService.getNotificationsForUser(
      user.sub,
      pagination,
      filters
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    // Get unread count
    const unreadCountResult = await NotificationService.getUnreadCount(
      user.sub
    );
    const unreadCount = unreadCountResult.success ? unreadCountResult.data : 0;

    return NextResponse.json({
      success: true,
      data: {
        notifications: result.data.data,
        pagination: result.data.meta,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch notifications",
        },
      },
      { status: 500 }
    );
  }
}

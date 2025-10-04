const { PrismaClient, NotificationType } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log("Seeding test notifications...");

    // First, let's get a user to associate notifications with
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log("No users found. Please create a user first.");
      return;
    }

    console.log(`Creating notifications for user: ${user.email}`);

    // Create test notifications
    const notifications = [
      {
        userId: user.id,
        type: NotificationType.EXPENSE_APPROVED,
        title: "Expense Approved",
        message: "Your expense of $125.50 has been approved by your manager.",
        data: {
          expenseId: "exp_test123",
          amount: 125.5,
          currency: "USD"
        },
        isRead: false
      },
      {
        userId: user.id,
        type: NotificationType.EXPENSE_REJECTED,
        title: "Expense Rejected",
        message: "Your expense of $89.25 has been rejected. Please review and resubmit.",
        data: {
          expenseId: "exp_test456",
          amount: 89.25,
          currency: "USD",
          reason: "Missing receipt"
        },
        isRead: false
      },
      {
        userId: user.id,
        type: NotificationType.APPROVAL_REQUIRED,
        title: "Approval Required",
        message: "A new expense of $245.00 requires your approval.",
        data: {
          expenseId: "exp_test789",
          amount: 245.0,
          currency: "USD",
          submittedBy: "John Doe"
        },
        isRead: true
      },
      {
        userId: user.id,
        type: NotificationType.SYSTEM_NOTIFICATION,
        title: "System Maintenance",
        message: "Scheduled maintenance will occur this weekend from 2:00 AM to 4:00 AM EST.",
        data: {
          maintenanceWindow: "2025-10-06T02:00:00Z to 2025-10-06T04:00:00Z"
        },
        isRead: false
      }
    ];

    const createdNotifications = await prisma.notification.createMany({
      data: notifications
    });

    console.log(`Created ${createdNotifications.count} test notifications`);

    // Display the created notifications
    const allNotifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log("\nCreated notifications:");
    allNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.isRead ? 'Read' : 'Unread'}`);
    });

  } catch (error) {
    console.error("Error seeding notifications:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedNotifications();
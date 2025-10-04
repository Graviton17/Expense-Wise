const { PrismaClient, Role } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedTestUser() {
  try {
    console.log("Creating test user and company...");

    // Create a test company first
    const company = await prisma.company.create({
      data: {
        name: "Test Company",
        country: "United States",
        baseCurrency: "USD"
      }
    });

    console.log(`Created company: ${company.name}`);

    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: "hashedpassword123", // In a real app, this would be properly hashed
        role: Role.EMPLOYEE,
        companyId: company.id
      }
    });

    console.log(`Created user: ${user.email}`);
    console.log(`User ID: ${user.id}`);

    return { user, company };

  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedTestUser();
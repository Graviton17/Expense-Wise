const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log("Creating test user with proper password hashing...");

    // Check if company exists, create if not
    let company = await prisma.company.findFirst({
      where: { name: "Test Company" }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "Test Company",
          country: "United States",
          baseCurrency: "USD"
        }
      });
      console.log(`Created company: ${company.name}`);
    }

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@company.com" }
    });

    if (existingUser) {
      console.log("Test user already exists!");
      return;
    }

    // Hash the password properly
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Create a test user with hashed password
    const user = await prisma.user.create({
      data: {
        email: "admin@company.com",
        name: "Admin User",
        password: hashedPassword,
        role: Role.ADMIN,
        companyId: company.id
      }
    });

    console.log(`Created admin user: ${user.email}`);
    console.log(`Password: admin123`);
    console.log(`User ID: ${user.id}`);

    // Create a regular employee user too
    const employeePassword = await bcrypt.hash("employee123", 12);
    const employee = await prisma.user.create({
      data: {
        email: "employee@company.com",
        name: "Employee User",
        password: employeePassword,
        role: Role.EMPLOYEE,
        companyId: company.id
      }
    });

    console.log(`Created employee user: ${employee.email}`);
    console.log(`Password: employee123`);

  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestUser();
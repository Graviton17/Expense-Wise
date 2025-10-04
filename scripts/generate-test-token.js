const jwt = require("jsonwebtoken");

// Mock JWT secret (should match your .env file)
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long";

async function generateTestToken() {
  try {
    const payload = {
      sub: "cmgc2mh1v0002xoila2er705c", // User ID from previous creation
      iss: "expense-wise-api",
      aud: "expense-wise-api",
      role: "EMPLOYEE",
      companyId: "cmgc2mh1t0000xoil5u8mfks8", // Company ID
      permissions: ["expense:create", "expense:read:own", "receipt:upload"],
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      iat: Math.floor(Date.now() / 1000),
      jti: `test_token_${Date.now()}`
    };

    const token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" });
    console.log("Generated JWT Token:");
    console.log(token);
    console.log("\nUse this token in Authorization header as: Bearer " + token);

    // Test token verification
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("\nToken verification successful:");
    console.log("User ID:", decoded.sub);
    console.log("Role:", decoded.role);
    console.log("Expires:", new Date(decoded.exp * 1000));

  } catch (error) {
    console.error("Error generating token:", error);
  }
}

generateTestToken();
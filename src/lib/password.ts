import bcrypt from "bcryptjs";

/**
 * Password Service
 * Handles password hashing and verification using bcrypt
 */

const SALT_ROUNDS = 12; // Recommended for production security

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Password hashing failed");
  }
}

/**
 * Verify a password against its hash
 * @param password - Plain text password
 * @param hashedPassword - Stored hashed password
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

/**
 * Check if password meets security requirements
 * @param password - Plain text password
 * @returns object with validation result and error messages
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Maximum length (prevent DoS attacks)
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // At least one number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // At least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Common password patterns (basic check)
  const commonPatterns = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "password123",
  ];

  if (
    commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))
  ) {
    errors.push("Password contains common patterns and is not secure");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns string - Generated password
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

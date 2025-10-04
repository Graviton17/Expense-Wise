import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getRedisClient } from "./redis";

/**
 * JWT Token Service
 * Implements RS256 JWT tokens as specified in the documentation
 */

// Generate RSA key pair for development (in production, use pre-generated keys)
const generateKeyPair = () => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
};

// In production, these should be loaded from environment variables or secrets manager
const keyPair = generateKeyPair();
const PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || keyPair.privateKey;
const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY || keyPair.publicKey;

export interface User {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: string;
}

export interface AccessTokenPayload {
  sub: string; // user id
  iss: string; // issuer
  aud: string; // audience
  role: string;
  companyId: string;
  permissions: string[];
  exp: number;
  iat: number;
  jti: string; // JWT ID for blacklisting
}

export interface RefreshTokenPayload {
  sub: string; // user id
  iss: string; // issuer
  type: "refresh";
  exp: number;
  iat: number;
  jti: string; // JWT ID for blacklisting
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Legacy interface for backward compatibility
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
  iat?: number;
  exp?: number;
}

/**
 * Get user permissions based on role
 */
function getUserPermissions(role: string): string[] {
  const permissions = {
    ADMIN: ["*"], // All permissions
    MANAGER: [
      "expense:read:team",
      "expense:approve",
      "expense:reject",
      "user:read",
      "report:read",
      "approval:create",
      "approval:update",
    ],
    EMPLOYEE: [
      "expense:create",
      "expense:read:own",
      "expense:update:own",
      "expense:delete:own",
      "receipt:upload",
      "receipt:read:own",
    ],
  };
  return permissions[role as keyof typeof permissions] || [];
}

/**
 * Generate a unique JWT ID
 */
function generateJti(): string {
  return `jti_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

/**
 * Generate an access token (short-lived: 1 hour)
 */
export function generateAccessToken(user: User): string {
  const payload: Omit<AccessTokenPayload, "exp" | "iat" | "jti"> = {
    sub: user.id,
    iss: process.env.JWT_ISSUER || "https://api.expensewise.com",
    aud: "expensewise-api",
    role: user.role,
    companyId: user.companyId,
    permissions: getUserPermissions(user.role),
  };

  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "1h",
    jwtid: generateJti(),
  });
}

/**
 * Generate a refresh token (long-lived: 30 days)
 */
export function generateRefreshToken(user: User): string {
  const payload: Omit<RefreshTokenPayload, "exp" | "iat" | "jti"> = {
    sub: user.id,
    iss: process.env.JWT_ISSUER || "https://api.expensewise.com",
    type: "refresh",
  };

  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "30d",
    jwtid: generateJti(),
  });
}

/**
 * Generate both access and refresh tokens for a user
 */
export function generateTokenPair(user: User): TokenPair {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: 3600, // 1 hour in seconds
  };
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(
  token: string
): AccessTokenPayload | RefreshTokenPayload {
  try {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    }) as AccessTokenPayload | RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("INVALID_TOKEN");
    }
    throw new Error("TOKEN_VERIFICATION_FAILED");
  }
}

/**
 * Verify access token (legacy compatibility)
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    const decoded = verifyToken(token) as AccessTokenPayload;
    return {
      userId: decoded.sub,
      email: "", // Not included in new token structure
      role: decoded.role,
      companyId: decoded.companyId,
      iat: decoded.iat,
      exp: decoded.exp,
    };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Verify refresh token (legacy compatibility)
 */
export function verifyRefreshToken(token: string): {
  userId: string;
  type: string;
} {
  try {
    const decoded = verifyToken(token) as RefreshTokenPayload;
    return {
      userId: decoded.sub,
      type: decoded.type,
    };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
}

/**
 * Extract JWT ID from token without verification (for blacklisting)
 */
export function getJtiFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as { jti?: string };
    return decoded?.jti || null;
  } catch {
    return null;
  }
}

// Extract token from Authorization header
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

// Blacklist token using JTI (for logout)
export async function blacklistToken(token: string): Promise<void> {
  try {
    const jti = getJtiFromToken(token);
    if (jti) {
      const decoded = jwt.decode(token) as { exp?: number };
      if (decoded && decoded.exp) {
        const redis = await getRedisClient();
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redis.setEx(`blacklist:${jti}`, ttl, "true");
        }
      }
    }
  } catch (error) {
    console.error("Error blacklisting token:", error);
  }
}

// Check if token is blacklisted using JTI
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const jti = getJtiFromToken(token);
    if (!jti) return false;

    const redis = await getRedisClient();
    const result = await redis.get(`blacklist:${jti}`);
    return result === "true";
  } catch (error) {
    console.error("Error checking token blacklist:", error);
    return false;
  }
}

// Store refresh token
export async function storeRefreshToken(
  userId: string,
  refreshToken: string
): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.setEx(`refresh:${userId}`, 30 * 24 * 60 * 60, refreshToken); // 30 days
  } catch (error) {
    console.error("Error storing refresh token:", error);
  }
}

// Validate refresh token
export async function validateRefreshToken(
  userId: string,
  refreshToken: string
): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const storedToken = await redis.get(`refresh:${userId}`);
    return storedToken === refreshToken;
  } catch (error) {
    console.error("Error validating refresh token:", error);
    return false;
  }
}

// Remove refresh token
export async function removeRefreshToken(userId: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.del(`refresh:${userId}`);
  } catch (error) {
    console.error("Error removing refresh token:", error);
  }
}

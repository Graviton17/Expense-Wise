import jwt from "jsonwebtoken";
import { getRedisClient } from "./redis";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Generate access token
export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

// Generate refresh token
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    algorithm: "HS256",
  });
}

// Generate token pair
export function generateTokenPair(
  payload: Omit<JWTPayload, "iat" | "exp">
): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload.userId);

  return { accessToken, refreshToken };
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Verify refresh token
export function verifyRefreshToken(token: string): {
  userId: string;
  type: string;
} {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
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

// Blacklist token (for logout)
export async function blacklistToken(token: string): Promise<void> {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (decoded && decoded.exp) {
      const redis = await getRedisClient();
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setEx(`blacklist:${token}`, ttl, "true");
      }
    }
  } catch (error) {
    console.error("Error blacklisting token:", error);
  }
}

// Check if token is blacklisted
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const result = await redis.get(`blacklist:${token}`);
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

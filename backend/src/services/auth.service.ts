import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import logger from "../utils/logger";

const ACCESS_TOKEN_EXPIRY = "15m"; // short-lived
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export interface TokenPayload {
  userId: string;
  role: string;
  email?: string;
}

/**
 * Hash password helper
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Verify password helper
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate Access and Refresh JWT tokens
 */
export const generateTokens = (payload: TokenPayload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "gamex-cambodia-api",
    audience: "gamex-cambodia-admin",
  });

  // Unique refresh token
  const refreshToken = jwt.sign(
    { userId: payload.userId, purpose: "refresh" },
    secret,
    {
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
      issuer: "gamex-cambodia-api",
      audience: "gamex-cambodia-admin",
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Save a refresh token to the database
 */
export const storeRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  return await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

/**
 * Revoke/delete a refresh token
 */
export const revokeRefreshToken = async (token: string) => {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
  } catch (err: any) {
    logger.warn(`Failed to revoke refresh token: ${err.message}`);
  }
};

/**
 * Verify and refresh an access token using a refresh token
 */
export const refreshAccessToken = async (refreshTokenStr: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  // 1. Verify token signature
  let decoded: any;
  try {
    decoded = jwt.verify(refreshTokenStr, secret, {
      issuer: "gamex-cambodia-api",
      audience: "gamex-cambodia-admin",
    });
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }

  if (decoded.purpose !== "refresh") {
    throw new Error("Invalid token purpose");
  }

  // 2. Look up in DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenStr },
    include: { user: true },
  });

  if (!storedToken) {
    throw new Error("Refresh token not found or revoked");
  }

  // 3. Check expiration date
  if (storedToken.expiresAt.getTime() < Date.now()) {
    // Delete expired token
    await prisma.refreshToken.delete({ where: { token: refreshTokenStr } }).catch(() => {});
    throw new Error("Refresh token expired");
  }

  // 4. Generate new access token
  const payload: TokenPayload = {
    userId: storedToken.user.id,
    role: storedToken.user.role,
    email: storedToken.user.email || undefined,
  };

  const newAccessToken = jwt.sign(payload, secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: "gamex-cambodia-api",
    audience: "gamex-cambodia-admin",
  });

  return { accessToken: newAccessToken };
};

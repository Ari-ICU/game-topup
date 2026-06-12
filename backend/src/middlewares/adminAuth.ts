import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { Role } from "@prisma/client";
import rateLimiter from "./rateLimiter";

// Typings for express request with credentials context
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
    email?: string;
  };
  admin?: any; // for backward compatibility
}

/**
 * Re-export the Redis-backed rate limiter for admin routes
 */
export const adminRateLimiter = (limit: number, windowMs: number) => {
  return rateLimiter(limit, windowMs);
};

/**
 * Admin JWT authentication check
 */
export const adminAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Missing bearer token." });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error("[FATAL] JWT_SECRET environment variable is not configured!");
    return res.status(500).json({ error: "Server misconfiguration. Contact administrator." });
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: "gamex-cambodia-api",
      audience: "gamex-cambodia-admin",
    }) as any;

    if (decoded.purpose === "refresh") {
      return res.status(401).json({ error: "Unauthorized. Refresh token cannot be used for api access." });
    }

    req.user = decoded;
    req.admin = decoded; // support legacy endpoints checking req.admin
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
  }
};

/**
 * Require specific roles middleware
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Unauthorized. Authentication details missing." });
    }

    const hasRole = allowedRoles.includes(req.user.role as Role);
    if (!hasRole) {
      logger.warn(`[Auth] Forbidden access attempt by ${req.user.email || req.user.userId} with role ${req.user.role}`);
      return res.status(403).json({ error: "Forbidden. You do not have permissions to access this resource." });
    }

    next();
  };
};

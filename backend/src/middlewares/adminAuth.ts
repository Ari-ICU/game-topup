import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

// In-memory rate limiting map (IP -> { count, resetTime })
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware for admin endpoints
 */
export const adminRateLimiter = (limit: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const now = Date.now();
    const rateData = rateLimitMap.get(ip);

    if (!rateData || now > rateData.resetTime) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (rateData.count >= limit) {
      logger.warn(`[Firewall] Rate-limiting triggered for IP: ${ip} on admin routes.`);
      return res.status(429).json({
        error: "Too many requests. Admin security firewall rate-limiting triggered. Please wait a moment."
      });
    }

    rateData.count += 1;
    next();
  };
};

/**
 * Admin JWT authentication check
 */
export const adminAuth = (req: any, res: Response, next: NextFunction): any => {
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
    });
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized. Invalid or expired token." });
  }
};

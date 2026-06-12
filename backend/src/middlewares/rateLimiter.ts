import { Request, Response, NextFunction } from "express";
import redis from "../lib/redis";
import logger from "../utils/logger";

// In-memory fallback rate limiting map (IP + path -> { count, resetTime })
const fallbackMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Enterprise Redis Rate Limiter with In-Memory Fallback
 */
export const rateLimiter = (limit: number, windowMs: number) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    const path = req.baseUrl + req.path;
    const key = `rate_limit:${ip}:${path}`;
    const now = Date.now();

    // Check if Redis is initialized and connected
    const isRedisConnected = redis && redis.status === "ready";

    if (isRedisConnected) {
      try {
        const currentVal = await redis.get(key);
        
        if (currentVal && parseInt(currentVal, 10) >= limit) {
          logger.warn(`[Firewall] Redis rate limit triggered for IP: ${ip} on path: ${path}`);
          const ttl = await redis.ttl(key);
          res.setHeader("Retry-After", ttl > 0 ? ttl : Math.ceil(windowMs / 1000));
          return res.status(429).json({
            error: "Too many requests. Security firewall rate-limiting triggered. Please wait a moment."
          });
        }

        // Increment count and set expiry on first hit
        const multi = redis.multi();
        multi.incr(key);
        if (!currentVal) {
          multi.pexpire(key, windowMs);
        }
        await multi.exec();
        
        return next();
      } catch (err: any) {
        logger.error(`Redis rate limiting failed, switching to in-memory fallback: ${err.message}`);
      }
    }

    // In-memory fallback logic
    const fallbackKey = `${ip}:${path}`;
    const rateData = fallbackMap.get(fallbackKey);

    if (!rateData || now > rateData.resetTime) {
      fallbackMap.set(fallbackKey, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (rateData.count >= limit) {
      logger.warn(`[Firewall] Fallback in-memory rate limit triggered for IP: ${ip} on path: ${path}`);
      res.setHeader("Retry-After", Math.ceil((rateData.resetTime - now) / 1000));
      return res.status(429).json({
        error: "Too many requests. Security firewall rate-limiting triggered. Please wait a moment."
      });
    }

    rateData.count += 1;
    next();
  };
};
export default rateLimiter;

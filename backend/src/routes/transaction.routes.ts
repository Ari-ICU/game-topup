import { Router, Request, Response, NextFunction } from "express";
import * as transactionController from "../controllers/transaction.controller";
import { validate } from "../middlewares/validation";
import logger from "../utils/logger";

const router = Router();

// ─── Public rate limiter: 20 requests per minute per IP ───────────────────────
const publicRateLimitMap = new Map<string, { count: number; resetTime: number }>();

const publicRateLimiter = (req: Request, res: Response, next: NextFunction): any => {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 20;

  const data = publicRateLimitMap.get(ip);

  if (!data || now > data.resetTime) {
    publicRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (data.count >= limit) {
    logger.warn(`[RateLimit] Public rate limit hit for IP: ${ip}`);
    return res.status(429).json({
      error: "Too many requests. Please wait a moment before trying again.",
    });
  }

  data.count += 1;
  next();
};

// Create pending transaction
router.post(
  "/",
  publicRateLimiter,
  validate(transactionController.createTransactionSchema),
  transactionController.createTx
);

// Validate promo code
router.post(
  "/promos/validate",
  publicRateLimiter,
  validate(transactionController.validatePromoSchema),
  transactionController.validatePromo
);

// Get active promos list
router.get(
  "/promos",
  publicRateLimiter,
  transactionController.getActivePromos
);

// Get recent completed transactions
router.get(
  "/recent",
  publicRateLimiter,
  transactionController.getRecentCompletedTx
);

// Get transaction by ID
router.get(
  "/:id",
  publicRateLimiter,
  validate(transactionController.getTransactionSchema),
  transactionController.getTx
);

// ─── Payment simulation — disabled in production ───────────────────────────────
// This endpoint marks a transaction as COMPLETED. Only available in dev/staging.
if (process.env.NODE_ENV !== "production") {
  router.post(
    "/:id/pay",
    validate(transactionController.getTransactionSchema),
    transactionController.payTx
  );
} else {
  router.post("/:id/pay", (_req: Request, res: Response) => {
    res.status(403).json({ error: "Payment simulation is disabled in production." });
  });
}

export default router;

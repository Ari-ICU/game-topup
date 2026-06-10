import { Router } from "express";
import * as webhookController from "../controllers/webhook.controller";
import * as telegramController from "../controllers/telegram.controller";
import { validate } from "../middlewares/validation";

const router = Router();

/**
 * POST /api/webhooks/bakong
 *
 * Receives real-time payment confirmation from Bakong's system.
 * Bakong sends a POST to this endpoint after a user scans the KHQR
 * and completes the payment in their banking app.
 *
 * Headers:
 *   X-Bakong-Signature: HMAC-SHA512 signature of the request body
 *
 * Body (JSON):
 *   {
 *     "transactionId": "BILL-1234567890",   // our billNumber
 *     "paymentRef": "BAK-XX-XXXXXXXX",       // Bakong's reference
 *     "status": "SUCCESS",                   // SUCCESS | FAILED | EXPIRED
 *     "amount": 1.50,
 *     "currency": "USD",
 *     "paidAt": "2025-06-10T10:30:00.000Z"
 *   }
 */
router.post(
  "/bakong",
  validate(webhookController.bakongWebhookSchema),
  webhookController.handleBakongWebhook
);

/**
 * POST /api/webhooks/telegram
 *
 * Receives messages and commands from the Telegram Bot.
 */
router.post(
  "/telegram",
  validate(telegramController.telegramWebhookSchema),
  telegramController.handleTelegramWebhook
);

export default router;
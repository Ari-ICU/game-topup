import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { verifyBakongSignature } from "../utils/bakong-signature";
import * as transactionService from "../services/transaction.service";

/**
 * Schema for incoming Bakong webhook payload.
 * This mirrors the structure Bakong sends after a payment is processed.
 */
export const bakongWebhookSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1, "transactionId is required"),
    paymentRef: z.string().min(1, "paymentRef is required"),
    status: z.enum(["SUCCESS", "FAILED", "EXPIRED", "PROCESSING"]),
    amount: z.number().positive(),
    currency: z.string().min(1),
    paidAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "paidAt must be a valid ISO date string",
    }),
  }),
});

/**
 * Bakong webhook handler.
 *
 * Flow:
 * 1. Verify BKMDC signature from X-Bakong-Signature header (production mode)
 * 2. Validate the webhook payload structure
 * 3. Process the payment callback → update transaction status
 * 4. Return acknowledgment to Bakong
 */
export const handleBakongWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const signature = req.headers["x-bakong-signature"] as string | undefined;
    const webhookSecret = process.env.BAKONG_WEBHOOK_SECRET;

    // Signature verification (skip in development if no secret configured)
    if (webhookSecret) {
      if (!signature) {
        return res.status(401).json({
          error: {
            message: "Missing X-Bakong-Signature header",
            status: 401,
          },
        });
      }

      const rawBody = JSON.stringify(req.body);
      const isValid = verifyBakongSignature(rawBody, signature, webhookSecret);

      if (!isValid) {
        console.warn("[Webhook] Invalid signature received");
        return res.status(401).json({
          error: {
            message: "Invalid webhook signature",
            status: 401,
          },
        });
      }
    } else {
      console.warn(
        "[Webhook] BAKONG_WEBHOOK_SECRET not configured — skipping signature verification (DEV mode)"
      );
    }

    // Process the webhook
    const result = await transactionService.processBakongWebhook(req.body);

    if (!result) {
      return res.status(404).json({
        error: {
          message: "No matching transaction found for this payment",
          status: 404,
        },
      });
    }

    // Respond with acknowledgment. Bakong expects HTTP 200 on success.
    return res.status(200).json({
      success: true,
      transactionId: result.id,
      status: result.status,
      message:
        result.status === "COMPLETED"
          ? "Payment processed successfully"
          : "Payment status updated",
    });
  } catch (error: any) {
    if (error.message === "Transaction not found") {
      return res.status(404).json({
        error: {
          message: "No matching transaction found for this payment",
          status: 404,
        },
      });
    }
    next(error);
  }
};
import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller";
import { validate } from "../middlewares/validation";

const router = Router();

// Create pending transaction
router.post(
  "/",
  validate(transactionController.createTransactionSchema),
  transactionController.createTx
);

// Validate promo code
router.post(
  "/promos/validate",
  validate(transactionController.validatePromoSchema),
  transactionController.validatePromo
);

// Get active promos list
router.get(
  "/promos",
  transactionController.getActivePromos
);

// Get recent completed transactions
router.get(
  "/recent",
  transactionController.getRecentCompletedTx
);

// Get transaction by ID
router.get(
  "/:id",
  validate(transactionController.getTransactionSchema),
  transactionController.getTx
);

// Simulates user paying or webhook receipt for a transaction
router.post(
  "/:id/pay",
  validate(transactionController.getTransactionSchema),
  transactionController.payTx
);

export default router;

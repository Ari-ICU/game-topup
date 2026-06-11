import { Request, Response, NextFunction } from "express";
import * as transactionService from "../services/transaction.service";
import { z } from "zod";

// Zod schemas for validation (simplified parameters for compatibility)
export const createTransactionSchema = z.object({
  body: z.object({
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid package ID format"), // BSON ObjectId
    paymentMethod: z.string().min(1, "Payment method is required"),
    playerInfo: z.record(z.string(), z.any()),
    token: z.string().optional(),
    accountId: z.string().optional(),
    promoCode: z.string().optional(),
    vipDiscountPercentage: z.number().min(0).max(100).optional(),
  }),
});

export const validatePromoSchema = z.object({
  body: z.object({
    code: z.string().min(1, "Promo code is required"),
    packageId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid package ID format"),
  }),
});

export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid transaction ID format"),
  }),
});

/**
 * Handle initiating a top-up transaction
 */
export const createTx = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { packageId, playerInfo, paymentMethod, token, accountId, promoCode, vipDiscountPercentage } = req.body;
    const transaction = await transactionService.createNewTransaction({
      packageId,
      playerInfo,
      paymentMethod,
      token,
      accountId,
      promoCode,
      vipDiscountPercentage,
    });
    res.status(201).json(transaction);
  } catch (error: any) {
    if (error.message === "Package not found" || error.message === "Invalid promo code" || error.message === "Promo code limit reached") {
      return res.status(400).json({
        error: {
          message: error.message,
          status: 400,
        },
      });
    }
    next(error);
  }
};

/**
 * Validate a promo code against a package
 */
export const validatePromo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { code, packageId } = req.body;
    const result = await transactionService.validatePromoCode(code, packageId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({
      error: {
        message: error.message || "Invalid promo code",
        status: 400,
      }
    });
  }
};

/**
 * Handle fetching transaction details by ID
 */
export const getTx = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  try {
    const transaction = await transactionService.getTransactionById(id as string);
    res.json(transaction);
  } catch (error: any) {
    if (error.message === "Transaction not found") {
      return res.status(404).json({
        error: {
          message: error.message,
          status: 404,
        },
      });
    }
    next(error);
  }
};

/**
 * Handle payment simulation trigger
 */
export const payTx = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  try {
    const transaction = await transactionService.simulatePaymentCompletion(id as string);
    res.json({
      message: "Payment simulation completed",
      transaction,
    });
  } catch (error: any) {
    if (error.message === "Transaction not found") {
      return res.status(404).json({
        error: {
          message: error.message,
          status: 404,
        },
      });
    }
    next(error);
  }
};

/**
 * Handle fetching recent completed transactions
 */
export const getRecentCompletedTx = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const transactions = await transactionService.getRecentCompletedTransactions(limit);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

/**
 * Handle fetching active promos list
 */
export const getActivePromos = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const promos = await transactionService.getActivePromos();
    res.json(promos);
  } catch (error) {
    next(error);
  }
};

import { prisma } from "../lib/prisma";
import { TransactionStatus } from "@prisma/client";
import { generateKhqrCode } from "../utils/khqr";
import { SmileOneClient, UniPinClient, TopUpLiveClient } from "../utils/providerClient";
import crypto from "crypto";
import https from "https";
import { URL } from "url";
import { notifyTransactionStatus } from "../utils/telegram";

interface CreateTransactionInput {
  packageId: string;
  playerInfo: any;
  paymentMethod: string;
  userId?: string;
  token?: string;
  accountId?: string;
  promoCode?: string;
  vipDiscountPercentage?: number;
}

interface BakongWebhookPayload {
  transactionId: string; // billNumber or our transaction ID
  paymentRef: string;    // Bakong's payment reference
  status: string;        // "SUCCESS" | "FAILED" | "EXPIRED"
  amount: number;
  currency: string;
  paidAt: string;        // ISO date string
}

/**
 * Initiate a new top-up transaction in PENDING status
 */
/**
 * Validate a promo code
 */
export const validatePromoCode = async (code: string, packageId: string) => {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!promo || !promo.isActive) {
    throw new Error("Invalid promo code");
  }

  if (promo.useCount >= promo.maxUses) {
    throw new Error("Promo code limit reached");
  }

  const pkg = await prisma.package.findUnique({
    where: { id: packageId }
  });

  if (!pkg) {
    throw new Error("Package not found");
  }

  // Verify game bounds if this is a game-specific promo code
  if (promo.gameId && promo.gameId !== pkg.gameId) {
    throw new Error("Promo code is not valid for this game");
  }

  const discountAmount = Number((pkg.price * promo.discount).toFixed(2));
  const finalPrice = Math.max(0, Number((pkg.price - discountAmount).toFixed(2)));

  return {
    valid: true,
    code: promo.code,
    discountPercentage: promo.discount * 100,
    discountAmount,
    finalPrice
  };
};

export const createNewTransaction = async (data: CreateTransactionInput) => {
  // Fetch package details to get current price
  const pkg = await prisma.package.findUnique({
    where: { id: data.packageId },
  });

  if (!pkg) {
    throw new Error("Package not found");
  }

  let promoDiscountAmount = 0;
  let promoCodeUsed: string | null = null;
  if (data.promoCode) {
    try {
      const val = await validatePromoCode(data.promoCode, data.packageId);
      promoDiscountAmount = val.discountAmount;
      promoCodeUsed = val.code;
      // Increment use count
      await prisma.promoCode.update({
        where: { code: val.code },
        data: { useCount: { increment: 1 } }
      });
    } catch (err: any) {
      throw new Error(err.message || "Invalid promo code");
    }
  }

  let vipDiscountAmount = 0;
  if (data.vipDiscountPercentage) {
    vipDiscountAmount = Number((pkg.price * (data.vipDiscountPercentage / 100)).toFixed(2));
  }

  const finalTotal = Math.max(0, Number((pkg.price - promoDiscountAmount - vipDiscountAmount).toFixed(2)));

  // 1. Create transaction in database first
  const transaction = await prisma.transaction.create({
    data: {
      packageId: data.packageId,
      userId: data.userId || null,
      status: TransactionStatus.PENDING,
      paymentMethod: data.paymentMethod,
      playerInfo: data.playerInfo,
      totalAmount: finalTotal,
      promoCodeUsed,
      discountAmount: promoDiscountAmount,
      vipDiscountAmount,
      qrCode: null,
    },
  });

  let qrCode: string | null = null;
  // 2. Generate KHQR if payment method is KHQR using the transaction's database ID as billNumber
  if (data.paymentMethod === "KHQR") {
    // Query active merchant settings from DB
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    const generated = generateKhqrCode({
      token: data.token,
      accountId: settings?.accountId || data.accountId,
      merchantName: settings?.merchantName,
      merchantCity: settings?.merchantCity,
      amount: finalTotal,
      billNumber: transaction.id, // Use the real transaction ID as bill number!
    });
    if (generated) {
      qrCode = generated;
    }
  }

  // Update transaction with the generated QR code (or keep null) and return with all inclusions
  return await prisma.transaction.update({
    where: { id: transaction.id },
    data: { qrCode },
    include: {
      package: {
        include: {
          game: true,
        },
      },
    },
  });
};

// Helper to query Bakong Open API status by MD5 hash
const checkTransactionByMd5 = async (md5: string): Promise<string> => {
  const apiToken = process.env.BAKONG_API_TOKEN;
  const apiBase = process.env.BAKONG_API_URL || "https://api-bakong.nbc.gov.kh";

  if (!apiToken) {
    console.warn("[Bakong API] Missing BAKONG_API_TOKEN in environment configuration.");
    return "UNPAID";
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({ md5 });
    const url = new URL("/v1/check_transaction_by_md5", apiBase);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const json = JSON.parse(data || "{}");
          if (json?.responseCode === 0 && json?.data) {
            resolve("PAID");
          } else {
            resolve("UNPAID");
          }
        } catch {
          resolve("UNPAID");
        }
      });
    });

    req.on("error", (err) => {
      console.error("[Bakong API] Connection error:", err.message);
      resolve("UNPAID");
    });
    req.write(payload);
    req.end();
  });
};

/**
 * Retrieve transaction status and details
 */
export const getTransactionById = async (id: string) => {
  let transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      package: {
        include: {
          game: true,
        },
      },
    },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // If transaction is still pending, check direct status via Bakong Open API
  if (
    transaction.status === TransactionStatus.PENDING &&
    transaction.paymentMethod === "KHQR" &&
    transaction.qrCode
  ) {
    // Check if the transaction is older than 5 minutes
    const isStale = Date.now() - transaction.createdAt.getTime() > 5 * 60 * 1000;
    if (isStale) {
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.EXPIRED },
        include: {
          package: {
            include: {
              game: true,
            },
          },
        },
      });
      console.log(`[Bakong API] Transaction ${transaction.id} expired (5-minute limit reached).`);
      return transaction;
    }

    try {
      const md5 = crypto.createHash("md5").update(transaction.qrCode).digest("hex");
      const paymentStatus = await checkTransactionByMd5(md5);

      if (paymentStatus === "PAID") {
        const randomPaymentRef = `PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        
        const updatedResult = await prisma.transaction.updateMany({
          where: {
            id: transaction.id,
            status: TransactionStatus.PENDING,
          },
          data: {
            status: TransactionStatus.COMPLETED,
            paymentRef: randomPaymentRef,
          },
        });

        if (updatedResult.count > 0) {
          console.log(`[Bakong API] Payment confirmed for transaction ${transaction.id}. Updated status to COMPLETED.`);
          
          // Trigger reseller API fulfillment
          await fulfillOrder(transaction.id);
          
          // Refetch to get updated providerRef
          transaction = await prisma.transaction.findUnique({
            where: { id: transaction.id },
            include: {
              package: {
                include: {
                  game: true,
                },
              },
            },
          }) as any;

          if (transaction) {
            notifyTransactionStatus(transaction).catch(err => console.error("[Telegram Alert] Failed to send:", err));
          }
        } else {
          console.log(`[Bakong API] Transaction ${transaction.id} already completed concurrently.`);
          transaction = await prisma.transaction.findUnique({
            where: { id: transaction.id },
            include: {
              package: {
                include: {
                  game: true,
                },
              },
            },
          }) as any;
        }
      }
    } catch (error) {
      console.error("[Bakong API] Error verifying payment status:", error);
    }
  }

  return transaction;
};

/**
 * Simulate payment webhook or user callback that completes transaction
 */
export const simulatePaymentCompletion = async (id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status === TransactionStatus.COMPLETED) {
    return transaction;
  }

  // Generate random payment reference for mock simulation
  const randomPaymentRef = `PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  await prisma.transaction.update({
    where: { id },
    data: {
      status: TransactionStatus.COMPLETED,
      paymentRef: randomPaymentRef,
    },
  });

  // Call the external reseller API to trigger fulfillment
  await fulfillOrder(id);

  const updated = await prisma.transaction.findUnique({
    where: { id },
    include: {
      package: {
        include: {
          game: true,
        },
      },
    },
  });

  if (updated) {
    notifyTransactionStatus(updated).catch(err => console.error("[Telegram Alert] Failed to send:", err));
  }

  return updated;
};

/**
 * Process Bakong webhook callback.
 * Handles idempotency: if already COMPLETED or FAILED, returns the existing transaction.
 * Maps Bakong's billNumber back to our transaction ID.
 */
export const processBakongWebhook = async (payload: BakongWebhookPayload) => {
  const { transactionId: bakongTransactionId, paymentRef, status, amount, currency, paidAt } = payload;

  // Try to find by paymentRef first (idempotency check)
  const existingByPaymentRef = await prisma.transaction.findFirst({
    where: { paymentRef },
    include: {
      package: {
        include: { game: true },
      },
    },
  });

  if (existingByPaymentRef) {
    console.log(`[Webhook] Duplicate payment ref: ${paymentRef}, transaction already processed.`);
    return existingByPaymentRef;
  }

  // Strip prefix "BILL-" if present (for backward compatibility / mock billing numbers)
  let lookupId = bakongTransactionId;
  if (lookupId.startsWith("BILL-")) {
    lookupId = lookupId.replace("BILL-", "");
  }

  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(lookupId);

  let transaction = null;
  if (isValidObjectId) {
    transaction = await prisma.transaction.findUnique({
      where: { id: lookupId },
    });
  }

  if (!transaction) {
    console.error(`[Webhook] No transaction found for billNumber: ${bakongTransactionId}`);
    throw new Error("Transaction not found");
  }

  if (
    transaction.status === TransactionStatus.COMPLETED ||
    transaction.status === TransactionStatus.FAILED ||
    transaction.status === TransactionStatus.EXPIRED
  ) {
    console.log(`[Webhook] Transaction ${transaction.id} already in final state: ${transaction.status}`);
    return await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        package: { include: { game: true } },
      },
    });
  }

  // Verify amount matches exactly
  if (amount !== transaction.totalAmount) {
    console.error(`[Webhook] Price Mismatch for transaction ${transaction.id}! Expected: ${transaction.totalAmount}, Paid: ${amount}`);
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.FAILED,
        paymentRef,
        updatedAt: new Date(paidAt),
      },
    });
    throw new Error("Payment amount mismatch");
  }

  // Verify currency matches exactly (USD)
  if (currency.toUpperCase() !== "USD") {
    console.error(`[Webhook] Currency Mismatch for transaction ${transaction.id}! Expected: USD, Paid: ${currency}`);
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: TransactionStatus.FAILED,
        paymentRef,
        updatedAt: new Date(paidAt),
      },
    });
    throw new Error("Payment currency mismatch");
  }

  let newStatus: TransactionStatus;
  switch (status.toUpperCase()) {
    case "SUCCESS":
      newStatus = TransactionStatus.COMPLETED;
      break;
    case "FAILED":
    case "EXPIRED":
      newStatus = TransactionStatus.FAILED;
      break;
    default:
      newStatus = TransactionStatus.PROCESSING;
  }

  // Atomic state locking status check to prevent concurrency race double fulfillments
  const updatedResult = await prisma.transaction.updateMany({
    where: {
      id: transaction.id,
      status: TransactionStatus.PENDING,
    },
    data: {
      status: newStatus,
      paymentRef,
      updatedAt: new Date(paidAt),
    },
  });

  if (updatedResult.count === 0) {
    console.log(`[Webhook] Transaction ${transaction.id} already completed or modified by concurrent process.`);
    return await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        package: { include: { game: true } },
      },
    });
  }

  const updated = await prisma.transaction.findUnique({
    where: { id: transaction.id },
    include: {
      package: {
        include: {
          game: true,
        },
      },
    },
  });

  if (!updated) {
    throw new Error("Updated transaction not found");
  }

  console.log(
    `[Webhook] Transaction ${updated.id} updated to ${updated.status} | PaymentRef: ${paymentRef}`
  );

  if (newStatus === TransactionStatus.COMPLETED) {
    await fulfillOrder(transaction.id);
    const finishedTx = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        package: {
          include: {
            game: true,
          },
        },
      },
    });

    if (finishedTx) {
      notifyTransactionStatus(finishedTx).catch(err => console.error("[Telegram Alert] Failed to send:", err));
    }

    return finishedTx;
  }

  return updated;
};

/**
 * Mark expired PENDING transactions as EXPIRED status.
 */
export const expireOldTransactions = async (maxAgeMinutes: number = 60) => {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000);

  const expired = await prisma.transaction.updateMany({
    where: {
      status: TransactionStatus.PENDING,
      createdAt: { lt: cutoff },
    },
    data: {
      status: TransactionStatus.EXPIRED,
    },
  });

  if (expired.count > 0) {
    console.log(`[Cron] Expired ${expired.count} stale PENDING transactions`);
  }

  return expired.count;
};

/**
 * Determine the correct provider client for a package using the explicit provider field.
 * Falls back to SKU-prefix detection for legacy packages that don't have provider set.
 */
const getProviderClient = (pkg: { provider?: string | null; providerSku: string }) => {
  const provider = pkg.provider || "";
  const sku = pkg.providerSku?.toLowerCase() || "";

  // Explicit provider field takes priority (new packages)
  if (provider === "UNIPIN" || sku.startsWith("unipin")) {
    return { client: new UniPinClient(), name: "UniPin" };
  }
  if (provider === "TOPUPLIVE" || sku.startsWith("topuplive")) {
    return { client: new TopUpLiveClient(), name: "TopUpLive" };
  }
  // Default: Smile One
  return { client: new SmileOneClient(), name: "SmileOne" };
};

/**
 * Attempt a single provider call and return structured result.
 */
const attemptFulfill = async (
  providerName: string,
  client: SmileOneClient | UniPinClient | TopUpLiveClient,
  payload: { providerSku: string; playerInfo: any; transactionId: string }
): Promise<{ success: boolean; providerRef?: string; error?: string }> => {
  try {
    const res = await client.processTopup(payload);
    return res;
  } catch (err: any) {
    return { success: false, error: err.message || `${providerName} connection error` };
  }
};

/**
 * Fulfill the top-up order by calling the third-party reseller API.
 * Routes by explicit Package.provider enum (not fragile SKU-prefix guessing).
 * Includes 1 automatic retry on failure and tracks fulfillmentStatus.
 */
export const fulfillOrder = async (transactionId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      package: {
        include: { game: true },
      },
    },
  });

  if (!transaction) {
    console.error(`[Fulfillment] Transaction ${transactionId} not found`);
    return null;
  }

  const { client, name: providerName } = getProviderClient(transaction.package);
  const payload = {
    providerSku: transaction.package.providerSku,
    playerInfo: transaction.playerInfo as any,
    transactionId: transaction.id,
  };

  const currentAttempts = transaction.fulfillmentAttempts ?? 0;

  // --- Check if credentials exist. If not, record as MOCK and skip real call ---
  const settings = await prisma.khqrSettings.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  const hasSmileOneCreds = !!(settings?.smileOneEmail && settings?.smileOneApiKey);
  const hasUniPinCreds = !!(settings?.uniPinSecret);
  const hasTopUpLiveCreds = !!(settings?.topUpLiveMerchantId && settings?.topUpLiveApiKey);

  const providerField = transaction.package.provider || "SMILE_ONE";
  const isMockMode =
    (providerField === "SMILE_ONE" && !hasSmileOneCreds) ||
    (providerField === "UNIPIN" && !hasUniPinCreds) ||
    (providerField === "TOPUPLIVE" && !hasTopUpLiveCreds);

  if (isMockMode) {
    const mockRef = `MOCK-${providerName.toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    console.log(`[Fulfillment] MOCK mode — no credentials for ${providerName}. Ref: ${mockRef}`);
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        providerRef: mockRef,
        fulfillmentStatus: "MOCK",
        fulfillmentError: null,
        fulfillmentAttempts: currentAttempts + 1,
      },
    });
  }

  // --- Attempt 1 ---
  console.log(`[Fulfillment] Attempt 1 via ${providerName} for tx: ${transactionId}`);
  let result = await attemptFulfill(providerName, client, payload);

  // --- Attempt 2 (automatic retry on failure) ---
  if (!result.success) {
    console.warn(`[Fulfillment] Attempt 1 failed (${result.error}). Retrying in 3s...`);
    await new Promise((r) => setTimeout(r, 3000));
    console.log(`[Fulfillment] Attempt 2 via ${providerName} for tx: ${transactionId}`);
    result = await attemptFulfill(providerName, client, payload);
  }

  if (result.success && result.providerRef) {
    console.log(`[Fulfillment] ✅ Delivered via ${providerName}. ProviderRef: ${result.providerRef}`);
    return await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        providerRef: result.providerRef,
        fulfillmentStatus: "DELIVERED",
        fulfillmentError: null,
        fulfillmentAttempts: currentAttempts + 2,
      },
    });
  }

  // Both attempts failed — record error so admin can see and retry manually
  console.error(`[Fulfillment] ❌ Both attempts failed for tx ${transactionId}: ${result.error}`);
  return await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      fulfillmentStatus: "FAILED",
      fulfillmentError: result.error || "Provider rejected the order after 2 attempts",
      fulfillmentAttempts: currentAttempts + 2,
    },
  });
};

/**
 * Manually retry fulfillment for a COMPLETED transaction where delivery failed.
 * Called by admin via POST /admin/transactions/:id/fulfill
 * Bypasses automated checks to re-attempt top-up reseller delivery.
 */
export const retryFulfillOrder = async (transactionId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { package: { include: { game: true } } },
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  if (transaction.status !== "COMPLETED") {
    throw new Error("Only COMPLETED transactions can be re-fulfilled");
  }

  if (transaction.fulfillmentStatus === "DELIVERED") {
    throw new Error("This transaction was already successfully delivered");
  }

  console.log(`[Fulfillment] Admin manually triggered re-fulfillment for tx: ${transactionId}`);
  return await fulfillOrder(transactionId);
};

/**
 * Get recent completed transactions with masked player info
 */
export const getRecentCompletedTransactions = async (limit: number = 10) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.COMPLETED,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: limit,
    include: {
      package: {
        include: {
          game: true,
        },
      },
    },
  });

  return transactions.map((tx) => {
    let username = "User";
    if (tx.playerInfo) {
      const info = typeof tx.playerInfo === "string"
        ? JSON.parse(tx.playerInfo)
        : tx.playerInfo;

      if (info.username) {
        username = info.username;
      } else if (info.playerId) {
        username = info.playerId;
      }
    }

    // Mask username: e.g., Sokha -> Sok***, 123456 -> 123***
    let maskedUser = "User***";
    if (username && username !== "User") {
      const len = username.length;
      if (len <= 3) {
        maskedUser = username[0] + "***";
      } else {
        maskedUser = username.substring(0, Math.ceil(len / 2)) + "***";
      }
    } else {
      maskedUser = "User" + tx.id.substring(tx.id.length - 4) + "***";
    }

    return {
      id: tx.id,
      user: maskedUser,
      game: tx.package?.game?.name || "Game",
      item: tx.package?.name || "Package",
      time: tx.updatedAt,
    };
  });
};

/**
 * Get all active promo codes
 */
export const getActivePromos = async () => {
  return await prisma.promoCode.findMany({
    where: {
      isActive: true,
    },
    include: {
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Validate a player ID for a specific game.
 * Uses the same provider routing logic as fulfillOrder.
 */
export const validatePlayerId = async (gameSlug: string, playerId: string, zoneId?: string) => {
  const game = await prisma.game.findUnique({
    where: { slug: gameSlug },
    include: { packages: true },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const firstPkg = game.packages[0];
  if (!firstPkg) {
    throw new Error("No packages configured for this game");
  }

  // Use the same routing helper as fulfillOrder — enum-first, SKU-prefix fallback
  const { client, name: providerName } = getProviderClient(firstPkg);
  console.log(`[ValidatePlayer] Using ${providerName} for game: ${gameSlug}`);
  return await client.validatePlayer(playerId, zoneId);
};

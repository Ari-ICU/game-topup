import { prisma } from "../lib/prisma";
import { TransactionStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

/**
 * Compute aggregate store metrics (total sales, count, game counts)
 */
export const getStats = async () => {
  const transactions = await prisma.transaction.findMany({
    include: {
      package: {
        include: {
          game: true
        }
      }
    }
  });

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === TransactionStatus.COMPLETED);
  const totalSales = completedTransactions.reduce((acc, t) => acc + t.totalAmount, 0);

  const statusCounts = {
    PENDING: transactions.filter(t => t.status === TransactionStatus.PENDING).length,
    COMPLETED: completedTransactions.length,
    FAILED: transactions.filter(t => t.status === TransactionStatus.FAILED).length,
    EXPIRED: transactions.filter(t => t.status === TransactionStatus.EXPIRED).length,
    PROCESSING: transactions.filter(t => t.status === TransactionStatus.PROCESSING).length,
  };

  // Calculate sales per game
  const gameSalesMap: Record<string, { name: string; sales: number; count: number }> = {};
  completedTransactions.forEach(t => {
    const game = t.package?.game;
    if (game) {
      if (!gameSalesMap[game.id]) {
        gameSalesMap[game.id] = { name: game.name, sales: 0, count: 0 };
      }
      gameSalesMap[game.id].sales += t.totalAmount;
      gameSalesMap[game.id].count += 1;
    }
  });

  const topGames = Object.values(gameSalesMap).sort((a, b) => b.sales - a.sales).slice(0, 5);

  // Recent 10 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return {
    totalSales,
    totalTransactions,
    statusCounts,
    topGames,
    recentTransactions
  };
};

/**
 * Retrieve active settings credentials
 */
export const getKhqrSettings = async () => {
  let settings = await prisma.khqrSettings.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" }
  });

  if (!settings) {
    return {
      id: "default",
      accountId: process.env.BAKONG_ACCOUNT_ID || "thoeurn_ratha@bkrt",
      merchantName: "Gamex Cambodia",
      merchantCity: "Phnom Penh",
      smileOneEmail: process.env.SMILEONE_EMAIL || "",
      smileOneApiKey: process.env.SMILEONE_API_KEY || "",
      smileOneApiUrl: process.env.SMILEONE_API_URL || "https://api.smileone.com/v1/order",
      uniPinSecret: process.env.UNIPIN_SECRET || "",
      uniPinApiUrl: process.env.UNIPIN_API_URL || "https://api.unipin.com/v1/topup",
      topUpLiveMerchantId: process.env.TOPUPLIVE_MERCHANT_ID || "",
      topUpLiveApiKey: process.env.TOPUPLIVE_API_KEY || "",
      topUpLiveApiUrl: process.env.TOPUPLIVE_API_URL || "https://api.topuplive.com/v1/order",
      isActive: true,
      updatedAt: new Date()
    };
  }

  return settings;
};

/**
 * Save new settings and deactivate older logs
 */
export const updateKhqrSettings = async (data: { 
  accountId: string; 
  merchantName: string; 
  merchantCity: string;
  smileOneEmail?: string;
  smileOneApiKey?: string;
  smileOneApiUrl?: string;
  uniPinSecret?: string;
  uniPinApiUrl?: string;
  topUpLiveMerchantId?: string;
  topUpLiveApiKey?: string;
  topUpLiveApiUrl?: string;
}) => {
  await prisma.khqrSettings.updateMany({
    data: { isActive: false }
  });

  return await prisma.khqrSettings.create({
    data: {
      accountId: data.accountId,
      merchantName: data.merchantName,
      merchantCity: data.merchantCity,
      smileOneEmail: data.smileOneEmail || "",
      smileOneApiKey: data.smileOneApiKey || "",
      smileOneApiUrl: data.smileOneApiUrl || "https://api.smileone.com/v1/order",
      uniPinSecret: data.uniPinSecret || "",
      uniPinApiUrl: data.uniPinApiUrl || "https://api.unipin.com/v1/topup",
      topUpLiveMerchantId: data.topUpLiveMerchantId || "",
      topUpLiveApiKey: data.topUpLiveApiKey || "",
      topUpLiveApiUrl: data.topUpLiveApiUrl || "https://api.topuplive.com/v1/order",
      isActive: true
    }
  });
};

/**
 * Fetch all catalog games (with nested packages)
 */
export const getAllGamesCatalog = async () => {
  return await prisma.game.findMany({
    include: {
      packages: true
    },
    orderBy: { createdAt: "desc" }
  });
};

/**
 * Create a new game catalog entry
 */
export const createGame = async (data: {
  name: string;
  slug: string;
  iconUrl: string;
  bannerUrl?: string | null;
  inputConfig?: any;
  isHot?: boolean;
}) => {
  return await prisma.game.create({
    data: {
      name: data.name,
      slug: data.slug,
      iconUrl: data.iconUrl,
      bannerUrl: data.bannerUrl || null,
      inputConfig: data.inputConfig || { playerId: "string" },
      isActive: true,
      isHot: data.isHot !== undefined ? Boolean(data.isHot) : false
    }
  });
};

/**
 * Edit game details
 */
export const updateGame = async (id: string, data: {
  name?: string;
  slug?: string;
  iconUrl?: string;
  bannerUrl?: string | null;
  inputConfig?: any;
  isActive?: boolean;
  isHot?: boolean;
}) => {
  return await prisma.game.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      iconUrl: data.iconUrl,
      bannerUrl: data.bannerUrl,
      inputConfig: data.inputConfig,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      isHot: data.isHot !== undefined ? Boolean(data.isHot) : undefined
    }
  });
};

/**
 * Delete a game catalog entry
 */
export const deleteGame = async (id: string) => {
  return await prisma.game.delete({
    where: { id }
  });
};

/**
 * Add a price denomination package
 */
export const createPackage = async (data: {
  gameId: string;
  name: string;
  amount: number;
  price: number;
  originalPrice?: number;
  bestValue?: boolean;
  providerSku?: string;
}) => {
  return await prisma.package.create({
    data: {
      gameId: data.gameId,
      name: data.name,
      amount: data.amount,
      price: data.price,
      originalPrice: data.originalPrice !== undefined ? data.originalPrice : data.price,
      bestValue: Boolean(data.bestValue),
      providerSku: data.providerSku || "SKU-DEFAULT"
    }
  });
};

/**
 * Edit pricing package details
 */
export const updatePackage = async (id: string, data: {
  name?: string;
  amount?: number;
  price?: number;
  originalPrice?: number;
  bestValue?: boolean;
  providerSku?: string;
}) => {
  return await prisma.package.update({
    where: { id },
    data: {
      name: data.name,
      amount: data.amount,
      price: data.price,
      originalPrice: data.originalPrice,
      bestValue: data.bestValue !== undefined ? Boolean(data.bestValue) : undefined,
      providerSku: data.providerSku
    }
  });
};

/**
 * Delete package
 */
export const deletePackage = async (id: string) => {
  return await prisma.package.delete({
    where: { id }
  });
};

/**
 * Search audit logs dynamically
 */
export const getTransactions = async (filters: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const skip = (filters.page - 1) * filters.limit;

  let allTransactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      package: {
        include: {
          game: true
        }
      }
    }
  });

  if (filters.status) {
    allTransactions = allTransactions.filter(t => t.status === filters.status);
  }

  if (filters.search) {
    const s = filters.search.toLowerCase();
    allTransactions = allTransactions.filter(t => {
      const playerIdMatch = t.playerInfo && typeof t.playerInfo === "object" &&
        Object.values(t.playerInfo as object).some(val => String(val).toLowerCase().includes(s));
      return (
        t.id.toLowerCase().includes(s) ||
        (t.paymentRef && t.paymentRef.toLowerCase().includes(s)) ||
        (t.package?.game?.name && t.package.game.name.toLowerCase().includes(s)) ||
        (t.package?.name && t.package.name.toLowerCase().includes(s)) ||
        playerIdMatch
      );
    });
  }

  const total = allTransactions.length;
  const paginated = allTransactions.slice(skip, skip + filters.limit);

  return {
    transactions: paginated,
    total,
    page: filters.page,
    limit: filters.limit
  };
};

/**
 * Force mark transaction state to COMPLETED
 */
export const completeTransactionManually = async (id: string) => {
  const checkTx = await prisma.transaction.findUnique({ where: { id } });
  if (!checkTx) {
    throw new Error("Transaction not found");
  }

  return await prisma.transaction.update({
    where: { id },
    data: {
      status: TransactionStatus.COMPLETED,
      paymentRef: `MANUAL-ADMIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
    },
    include: {
      package: {
        include: {
          game: true
        }
      }
    }
  });
};

/**
 * Decodes base64 string and writes file to server disks
 */
export const saveUploadedFile = async (name: string, base64Data: string) => {
  // Security: only allow safe image extensions
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  const buffer = Buffer.from(base64Data, "base64");

  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error("File exceeds the maximum allowed size of 5MB.");
  }

  const ext = (path.extname(name) || ".png").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File type "${ext}" is not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
  }

  // Security: sanitize base name to prevent path traversal
  const baseName = path.basename(name, path.extname(name)).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
  const fileName = `${baseName}_${Date.now()}${ext}`;

  const frontendPublicDir = path.join(process.cwd(), "../frontend/public/uploads");
  const backendPublicDir = path.join(process.cwd(), "uploads");

  let savedPathUrl = "";

  // 1. Try frontend public
  try {
    if (!fs.existsSync(frontendPublicDir)) {
      fs.mkdirSync(frontendPublicDir, { recursive: true });
    }
    const filePath = path.join(frontendPublicDir, fileName);
    fs.writeFileSync(filePath, buffer);
    savedPathUrl = `/uploads/${fileName}`;
  } catch (err) {
    console.warn("[Upload] Could not write to frontend public, trying backend local", err);
  }

  // 2. Backend static uploads directory fallback
  try {
    if (!fs.existsSync(backendPublicDir)) {
      fs.mkdirSync(backendPublicDir, { recursive: true });
    }
    const filePath = path.join(backendPublicDir, fileName);
    fs.writeFileSync(filePath, buffer);
    if (!savedPathUrl) {
      savedPathUrl = `http://localhost:${process.env.PORT || 5001}/uploads/${fileName}`;
    }
  } catch (err) {
    console.error("[Upload] Backend write failed", err);
  }

  if (!savedPathUrl) {
    throw new Error("Failed to write file to storage");
  }

  return { url: savedPathUrl };
};

/**
 * Fetch all promo codes
 */
export const getAllPromos = async () => {
  return await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      game: {
        select: {
          name: true,
        },
      },
    },
  });
};

/**
 * Create a new promo code
 */
export const createPromo = async (data: { code: string; discount: number; maxUses?: number; gameId?: string | null }) => {
  return await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      discount: data.discount,
      maxUses: data.maxUses ?? 100,
      gameId: data.gameId || null,
    },
  });
};

/**
 * Delete a promo code
 */
export const deletePromo = async (id: string) => {
  return await prisma.promoCode.delete({
    where: { id },
  });
};

/**
 * Toggle promo code active/inactive status
 */
export const togglePromo = async (id: string, isActive: boolean) => {
  return await prisma.promoCode.update({
    where: { id },
    data: { isActive },
  });
};

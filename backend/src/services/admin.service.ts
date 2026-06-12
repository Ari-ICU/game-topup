import { prisma } from "../lib/prisma";
import { TransactionStatus, Provider } from "@prisma/client";
import fs from "fs";
import path from "path";
import logger from "../utils/logger";

/**
 * Compute aggregate store metrics using DB-level aggregation (no full table scan)
 */
export const getStats = async () => {
  // Aggregate totals in the DB — no full table scan
  const [totalCount, completedAgg, statusGroups] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.aggregate({
      _sum: { totalAmount: true },
      _count: { _all: true },
      where: { status: TransactionStatus.COMPLETED },
    }),
    prisma.transaction.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const totalSales = completedAgg._sum.totalAmount ?? 0;
  const totalTransactions = totalCount;

  const statusCounts = {
    PENDING: 0,
    COMPLETED: 0,
    FAILED: 0,
    EXPIRED: 0,
    PROCESSING: 0,
  } as Record<string, number>;
  statusGroups.forEach((g) => {
    statusCounts[g.status] = g._count._all;
  });

  // Top 5 games by sales using groupBy
  const gameSaleRows = await prisma.transaction.groupBy({
    by: ["packageId"],
    _sum: { totalAmount: true },
    _count: { _all: true },
    where: { status: TransactionStatus.COMPLETED },
    orderBy: { _sum: { totalAmount: "desc" } },
    take: 20, // fetch more to allow joining to game names
  });

  // Resolve game names for top packages
  const packages = await prisma.package.findMany({
    where: { id: { in: gameSaleRows.map((r) => r.packageId) } },
    include: { game: { select: { id: true, name: true } } },
  });
  const pkgMap = new Map(packages.map((p) => [p.id, p]));

  const gameSalesMap: Record<string, { name: string; sales: number; count: number }> = {};
  gameSaleRows.forEach((row) => {
    const pkg = pkgMap.get(row.packageId);
    if (pkg?.game) {
      const g = pkg.game;
      if (!gameSalesMap[g.id]) {
        gameSalesMap[g.id] = { name: g.name, sales: 0, count: 0 };
      }
      gameSalesMap[g.id].sales += row._sum.totalAmount ?? 0;
      gameSalesMap[g.id].count += row._count._all;
    }
  });
  const topGames = Object.values(gameSalesMap).sort((a, b) => b.sales - a.sales).slice(0, 5);

  // Recent 10 transactions — lightweight select, no full scan
  const recentTransactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      package: { include: { game: { select: { name: true } } } },
    },
  });

  return {
    totalSales,
    totalTransactions,
    statusCounts,
    topGames,
    recentTransactions,
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
  provider?: Provider;
}) => {
  return await prisma.package.create({
    data: {
      gameId: data.gameId,
      name: data.name,
      amount: data.amount,
      price: data.price,
      originalPrice: data.originalPrice !== undefined ? data.originalPrice : data.price,
      bestValue: Boolean(data.bestValue),
      providerSku: data.providerSku || "SKU-DEFAULT",
      provider: data.provider
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
  provider?: Provider;
}) => {
  return await prisma.package.update({
    where: { id },
    data: {
      name: data.name,
      amount: data.amount,
      price: data.price,
      originalPrice: data.originalPrice,
      bestValue: data.bestValue !== undefined ? Boolean(data.bestValue) : undefined,
      providerSku: data.providerSku,
      provider: data.provider
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
 * Search audit logs dynamically — filters pushed to DB, not in-memory
 */
export const getTransactions = async (filters: {
  search?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const skip = (filters.page - 1) * filters.limit;

  // Build Prisma where clause — avoid loading entire table into memory
  const where: any = {};

  if (filters.status) {
    where.status = filters.status as TransactionStatus;
  }

  if (filters.search) {
    const s = filters.search;
    where.OR = [
      { id: { contains: s, mode: "insensitive" } },
      { paymentRef: { contains: s, mode: "insensitive" } },
      { package: { name: { contains: s, mode: "insensitive" } } },
      { package: { game: { name: { contains: s, mode: "insensitive" } } } },
    ];
  }

  const [total, paginated] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: filters.limit,
      include: {
        package: {
          include: { game: true },
        },
      },
    }),
  ]);

  return {
    transactions: paginated,
    total,
    page: filters.page,
    limit: filters.limit,
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
 * Verifies that the file buffer matches its declared extension by examining magic bytes (file signature)
 */
function verifyMagicBytes(buffer: Buffer, ext: string): boolean {
  if (buffer.length < 4) return false;

  // PNG: 89 50 4E 47
  if (ext === ".png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // JPEG/JPG: FF D8 FF
  if (ext === ".jpg" || ext === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // GIF: GIF (47 49 46)
  if (ext === ".gif") {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  }

  // WEBP: RIFF (52 49 46 46) ... WEBP (57 45 42 50) at offset 8
  if (ext === ".webp") {
    if (buffer.length < 12) return false;
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  // SVG: starts with XML tag or "<svg" (ignoring whitespace and BOM)
  if (ext === ".svg") {
    const text = buffer.toString("utf8", 0, Math.min(buffer.length, 1000)).trim().toLowerCase();
    return text.includes("<svg") || text.startsWith("<?xml");
  }

  // AVIF: ftypavif or ftypavis at offset 4
  if (ext === ".avif") {
    if (buffer.length < 12) return false;
    const isFtyp = buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70;
    const isAvif = buffer[8] === 0x61 && buffer[9] === 0x76 && buffer[10] === 0x69 && (buffer[11] === 0x66 || buffer[11] === 0x73);
    return isFtyp && isAvif;
  }

  return false;
}

/**
 * Decodes base64 string and writes file to server disks
 */
export const saveUploadedFile = async (name: string, base64Data: string, backendUrl?: string) => {
  // Security: only allow safe image extensions
  const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  // If the base64 string contains a data URI prefix, strip it to prevent binary corruption
  const cleanBase64 = base64Data.includes(";base64,")
    ? base64Data.split(";base64,")[1]
    : base64Data;

  const buffer = Buffer.from(cleanBase64, "base64");

  if (buffer.length > MAX_SIZE_BYTES) {
    throw new Error("File exceeds the maximum allowed size of 5MB.");
  }

  const ext = (path.extname(name) || ".png").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`File type "${ext}" is not permitted. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
  }

  // Verify that magic bytes match the declared extension
  if (!verifyMagicBytes(buffer, ext)) {
    throw new Error(`File content verification failed. The file signature does not match the "${ext}" extension.`);
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
    logger.warn("[Upload] Could not write to frontend public, trying backend local", err);
  }

  // 2. Backend static uploads directory fallback
  try {
    if (!fs.existsSync(backendPublicDir)) {
      fs.mkdirSync(backendPublicDir, { recursive: true });
    }
    const filePath = path.join(backendPublicDir, fileName);
    fs.writeFileSync(filePath, buffer);
    if (!savedPathUrl) {
      const baseUrl = backendUrl || `http://localhost:${process.env.PORT || 5001}`;
      savedPathUrl = `${baseUrl}/uploads/${fileName}`;
    }
  } catch (err) {
    logger.error("[Upload] Backend write failed", err);
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

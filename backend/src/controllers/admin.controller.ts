import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import jwt from "jsonwebtoken";

// Failed passcode attempts tracker (IP -> { count, blockUntil })
const failedAttemptsMap = new Map<string, { count: number; blockUntil: number }>();

/**
 * Brute force lockout firewall check specifically for login requests
 */
export const loginFirewall = (req: Request, res: Response, next: NextFunction): any => {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  const attemptData = failedAttemptsMap.get(ip);

  if (attemptData && now < attemptData.blockUntil) {
    const remainingTime = Math.ceil((attemptData.blockUntil - now) / 1000);
    return res.status(403).json({
      error: `Access Denied: Temporarily blocked by firewall due to multiple failed admin passcode attempts. Try again in ${remainingTime} seconds.`
    });
  }

  next();
};

/**
 * Handle admin passcode validation and issue secure JWT tokens
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  try {
    const { passcode } = req.body;
    const expected = process.env.ADMIN_PASSCODE;
    if (!expected) {
      console.error("[FATAL] ADMIN_PASSCODE environment variable is not configured!");
      return res.status(500).json({ error: "Server misconfiguration. Contact administrator." });
    }

    if (passcode !== expected) {
      const now = Date.now();
      const currentAttempts = failedAttemptsMap.get(ip) || { count: 0, blockUntil: 0 };
      
      const newCount = currentAttempts.count + 1;
      let blockUntil = 0;
      
      if (newCount >= 5) {
        blockUntil = now + 5 * 60 * 1000; // Block for 5 minutes
        console.warn(`[Firewall] Locked out IP: ${ip} from login for 5 minutes (5 consecutive failures).`);
      }
      
      failedAttemptsMap.set(ip, {
        count: newCount >= 5 ? 0 : newCount,
        blockUntil: blockUntil || currentAttempts.blockUntil
      });

      return res.status(401).json({ error: "Unauthorized. Invalid admin passcode." });
    }

    // Success: Clear failed attempts
    failedAttemptsMap.delete(ip);

    // Sign token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured!");
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
    const token = jwt.sign(
      { role: "admin" },
      secret,
      {
        expiresIn: expiresIn as any,
        issuer: "gamex-cambodia-api",
        audience: "gamex-cambodia-admin",
      }
    );

    res.json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch dashboard aggregated sales metrics
 */
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve active settings credentials
 */
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await adminService.getKhqrSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Save active settings configurations
 */
export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { 
      accountId, 
      merchantName, 
      merchantCity,
      smileOneEmail,
      smileOneApiKey,
      smileOneApiUrl,
      uniPinSecret,
      uniPinApiUrl,
      topUpLiveMerchantId,
      topUpLiveApiKey,
      topUpLiveApiUrl
    } = req.body;
    if (!accountId || !merchantName || !merchantCity) {
      return res.status(400).json({ error: "Missing required settings fields" });
    }
    const settings = await adminService.updateKhqrSettings({ 
      accountId, 
      merchantName, 
      merchantCity,
      smileOneEmail,
      smileOneApiKey,
      smileOneApiUrl,
      uniPinSecret,
      uniPinApiUrl,
      topUpLiveMerchantId,
      topUpLiveApiKey,
      topUpLiveApiUrl
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all games in the catalog (including nested packages)
 */
export const getGames = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const games = await adminService.getAllGamesCatalog();
    res.json(games);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a game catalog profile
 */
export const createGame = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, slug, iconUrl, bannerUrl, inputConfig, isHot } = req.body;
    if (!name || !slug || !iconUrl) {
      return res.status(400).json({ error: "Missing required game fields" });
    }
    const game = await adminService.createGame({ name, slug, iconUrl, bannerUrl, inputConfig, isHot });
    res.status(201).json(game);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit game details
 */
export const updateGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, slug, iconUrl, bannerUrl, inputConfig, isActive, isHot } = req.body;
    const game = await adminService.updateGame(id, { name, slug, iconUrl, bannerUrl, inputConfig, isActive, isHot });
    res.json(game);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a game catalog profile
 */
export const deleteGame = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await adminService.deleteGame(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Add package denomination
 */
export const createPackage = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { gameId, name, amount, price, originalPrice, bestValue, providerSku } = req.body;
    if (!gameId || !name || amount === undefined || price === undefined) {
      return res.status(400).json({ error: "Missing required package fields" });
    }
    const pkg = await adminService.createPackage({ gameId, name, amount, price, originalPrice, bestValue, providerSku });
    res.status(201).json(pkg);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit pricing package details
 */
export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, amount, price, originalPrice, bestValue, providerSku } = req.body;
    const pkg = await adminService.updatePackage(id, { name, amount, price, originalPrice, bestValue, providerSku });
    res.json(pkg);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete pricing package
 */
export const deletePackage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await adminService.deletePackage(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Search audit logs dynamically
 */
export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status, page = "1", limit = "50" } = req.query;
    const result = await adminService.getTransactions({
      search: search ? (search as string) : undefined,
      status: status ? (status as string) : undefined,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 50
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Force manual completion status override
 */
export const completeTransaction = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const transaction = await adminService.completeTransactionManually(id);
    res.json(transaction);
  } catch (error: any) {
    if (error.message === "Transaction not found") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Decodes base64 upload buffer and writes file to storage path
 */
export const uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: "Missing name or base64 data" });
    }
    const result = await adminService.saveUploadedFile(name, data);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch all promo codes
 */
export const getPromos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const promos = await adminService.getAllPromos();
    res.json(promos);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new promo code
 */
export const createPromo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { code, discount, maxUses, gameId } = req.body;
    if (!code || discount === undefined) {
      return res.status(400).json({ error: "Missing required promo fields" });
    }
    const promo = await adminService.createPromo({
      code,
      discount: parseFloat(discount),
      maxUses: parseInt(maxUses) || 100,
      gameId: gameId || null,
    });
    res.status(201).json(promo);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a promo code
 */
export const deletePromo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await adminService.deletePromo(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle promo code active/inactive status
 */
export const togglePromo = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean value." });
    }
    const promo = await adminService.togglePromo(id, isActive);
    res.json(promo);
  } catch (error) {
    next(error);
  }
};

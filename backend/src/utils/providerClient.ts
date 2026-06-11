import crypto from "crypto";
import { prisma } from "../lib/prisma";

interface TopupRequest {
  providerSku: string;
  playerInfo: {
    playerId: string;
    zoneId?: string;
  };
  transactionId: string;
}

export class SmileOneClient {
  async processTopup(data: TopupRequest) {
    // Dynamically retrieve active credentials from database settings
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    const apiEmail = settings?.smileOneEmail || process.env.SMILEONE_EMAIL || "";
    const apiKey = settings?.smileOneApiKey || process.env.SMILEONE_API_KEY || "";
    const apiBase = settings?.smileOneApiUrl || process.env.SMILEONE_API_URL || "https://api.smileone.com/v1/order";

    if (!apiEmail || !apiKey) {
      console.log(`[Smile One Mock] Missing credentials. Simulating successful order for SKU: ${data.providerSku}`);
      return { success: true, providerRef: `SMILE-MOCK-${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
    }

    const { providerSku, playerInfo, transactionId } = data;
    const params = {
      email: apiEmail,
      uid: playerInfo.playerId,
      zoneid: playerInfo.zoneId || "",
      productid: providerSku,
      orderid: transactionId,
      time: Math.floor(Date.now() / 1000).toString(),
    };

    const paramString = Object.values(params).join("|");
    const signature = crypto
      .createHmac("sha256", apiKey)
      .update(paramString)
      .digest("hex");

    console.log(`[Smile One API] Placing order for tx: ${transactionId}, SKU: ${providerSku}`);

    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: JSON.stringify({ ...params, sign: signature }),
      });

      const result = await response.json();
      if (result.status === "success") {
        return { success: true, providerRef: result.provider_order_id };
      } else {
        throw new Error(result.message || "Aggregator rejected the purchase");
      }
    } catch (error: any) {
      console.error("[Smile One API] Connection or order error:", error.message);
      return { success: false, error: error.message || "Aggregator connection failed" };
    }
  }

  async validatePlayer(playerId: string, zoneId?: string) {
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    const apiEmail = settings?.smileOneEmail || process.env.SMILEONE_EMAIL || "";
    const apiKey = settings?.smileOneApiKey || process.env.SMILEONE_API_KEY || "";
    const apiBase = settings?.smileOneApiUrl || process.env.SMILEONE_API_URL || "https://api.smileone.com/v1/order";
    const validateUrl = apiBase.replace("/v1/order", "/v1/user/query");

    if (!apiEmail || !apiKey) {
      return { success: false, error: "Smile One credentials are not configured. Please contact support." };
    }

    const params = {
      email: apiEmail,
      uid: playerId,
      zoneid: zoneId || "",
      time: Math.floor(Date.now() / 1000).toString(),
    };

    const paramString = Object.values(params).join("|");
    const signature = crypto
      .createHmac("sha256", apiKey)
      .update(paramString)
      .digest("hex");

    try {
      const response = await fetch(validateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: JSON.stringify({ ...params, sign: signature }),
      });

      const result = await response.json();
      if (result.status === 200 && result.nickname) {
        return { success: true, nickname: result.nickname };
      } else {
        return { success: false, error: result.error || "Player ID not found. Please check your ID and Zone ID." };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Could not connect to verification service. Please try again." };
    }
  }
}

export class UniPinClient {
  async processTopup(data: TopupRequest) {
    // Dynamically retrieve active credentials from database settings
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    const apiSecret = settings?.uniPinSecret || process.env.UNIPIN_SECRET || "";
    const apiBase = settings?.uniPinApiUrl || process.env.UNIPIN_API_URL || "https://api.unipin.com/v1/topup";

    if (!apiSecret) {
      console.log(`[UniPin Mock] Missing credentials. Simulating successful order for SKU: ${data.providerSku}`);
      return { success: true, providerRef: `UNIPIN-MOCK-${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
    }

    const { providerSku, playerInfo, transactionId } = data;
    const params = {
      orderId: transactionId,
      productId: providerSku,
      userId: playerInfo.playerId,
      zoneId: playerInfo.zoneId || "",
      timestamp: Math.floor(Date.now() / 1000).toString()
    };

    const paramString = `${params.orderId}|${params.productId}|${params.userId}|${params.zoneId}|${params.timestamp}`;
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(paramString)
      .digest("hex");

    console.log(`[UniPin API] Placing order for tx: ${transactionId}, SKU: ${providerSku}`);

    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature
        },
        body: JSON.stringify({ ...params, sign: signature })
      });

      const result = await response.json();
      if (result.code === 200) {
        return { success: true, providerRef: result.refId };
      } else {
        throw new Error(result.message || "UniPin rejected the purchase");
      }
    } catch (error: any) {
      console.error("[UniPin API] Connection or order error:", error.message);
      return { success: false, error: error.message || "UniPin API connection failed" };
    }
  }

  async validatePlayer(playerId: string, zoneId?: string) {
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    const apiSecret = settings?.uniPinSecret || process.env.UNIPIN_SECRET || "";
    const apiBase = settings?.uniPinApiUrl || process.env.UNIPIN_API_URL || "https://api.unipin.com/v1/topup";
    const validateUrl = apiBase.replace("/v1/topup", "/v1/user/query");

    if (!apiSecret) {
      return { success: false, error: "UniPin credentials are not configured. Please contact support." };
    }

    const params = {
      userId: playerId,
      zoneId: zoneId || "",
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };

    const paramString = `${params.userId}|${params.zoneId}|${params.timestamp}`;
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(paramString)
      .digest("hex");

    try {
      const response = await fetch(validateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: JSON.stringify({ ...params, sign: signature }),
      });

      const result = await response.json();
      if (result.code === 200 && result.nickname) {
        return { success: true, nickname: result.nickname };
      } else {
        return { success: false, error: result.message || "Player ID not found. Please check your ID and Zone ID." };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Could not connect to verification service. Please try again." };
    }
  }
}

export class TopUpLiveClient {
  async processTopup(data: TopupRequest) {
    // Dynamically retrieve active credentials from database settings
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    const merchantId = settings?.topUpLiveMerchantId || process.env.TOPUPLIVE_MERCHANT_ID || "";
    const apiKey = settings?.topUpLiveApiKey || process.env.TOPUPLIVE_API_KEY || "";
    const apiBase = settings?.topUpLiveApiUrl || process.env.TOPUPLIVE_API_URL || "https://api.topuplive.com/v1/order";

    if (!merchantId || !apiKey) {
      console.log(`[TopUpLive Mock] Missing credentials. Simulating successful order for SKU: ${data.providerSku}`);
      return { success: true, providerRef: `TUL-MOCK-${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
    }

    const { providerSku, playerInfo, transactionId } = data;
    const params = {
      merchantId,
      productId: providerSku,
      orderId: transactionId,
      playerId: playerInfo.playerId,
      zoneId: playerInfo.zoneId || "",
      timestamp: Math.floor(Date.now() / 1000).toString()
    };

    const paramString = `${params.merchantId}|${params.productId}|${params.orderId}|${params.playerId}|${params.zoneId}|${params.timestamp}`;
    const signature = crypto
      .createHmac("sha256", apiKey)
      .update(paramString)
      .digest("hex");

    console.log(`[TopUpLive API] Placing order for tx: ${transactionId}, SKU: ${providerSku}`);

    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature
        },
        body: JSON.stringify({ ...params, sign: signature })
      });

      const result = await response.json();
      if (result.status === "success" || result.code === 200) {
        return { success: true, providerRef: result.refId || result.providerOrderId || `TUL-${Math.random().toString(36).substring(2, 9).toUpperCase()}` };
      } else {
        throw new Error(result.message || "TopUpLive rejected the purchase");
      }
    } catch (error: any) {
      console.error("[TopUpLive API] Connection or order error:", error.message);
      return { success: false, error: error.message || "TopUpLive API connection failed" };
    }
  }

  async validatePlayer(playerId: string, zoneId?: string) {
    const settings = await prisma.khqrSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" }
    });

    const merchantId = settings?.topUpLiveMerchantId || process.env.TOPUPLIVE_MERCHANT_ID || "";
    const apiKey = settings?.topUpLiveApiKey || process.env.TOPUPLIVE_API_KEY || "";
    const apiBase = settings?.topUpLiveApiUrl || process.env.TOPUPLIVE_API_URL || "https://api.topuplive.com/v1/order";
    const validateUrl = apiBase.replace("/v1/order", "/v1/user/query");

    if (!merchantId || !apiKey) {
      return { success: false, error: "TopUpLive credentials are not configured. Please contact support." };
    }

    const params = {
      merchantId,
      playerId,
      zoneId: zoneId || "",
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };

    const paramString = `${params.merchantId}|${params.playerId}|${params.zoneId}|${params.timestamp}`;
    const signature = crypto
      .createHmac("sha256", apiKey)
      .update(paramString)
      .digest("hex");

    try {
      const response = await fetch(validateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: JSON.stringify({ ...params, sign: signature }),
      });

      const result = await response.json();
      if ((result.status === "success" || result.code === 200) && result.nickname) {
        return { success: true, nickname: result.nickname };
      } else {
        return { success: false, error: result.message || "Player ID not found. Please check your ID and Zone ID." };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Could not connect to verification service. Please try again." };
    }
  }
}

// @ts-ignore
import { BakongKHQR, khqrData, IndividualInfo } from "bakong-khqr";

interface GenerateKhqrInput {
  token?: string; // Optional JWT token containing the merchant/account ID
  accountId?: string; // Fallback or direct account ID, e.g. "7f61fa8cfc3d4c00"
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  billNumber: string;
}

/**
 * Decodes the JWT token to extract the account ID without verifying signature
 */
export const decodeToken = (token: string): string | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    return payload?.data?.id || null;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

/**
 * Generates a Bakong KHQR code string
 */
export const generateKhqrCode = (input: GenerateKhqrInput): string | null => {
  try {
    let accountId = input.accountId;

    if (input.token) {
      const decodedId = decodeToken(input.token);
      if (decodedId === "7f61fa8cfc3d4c00") {
        accountId = process.env.BAKONG_ACCOUNT_ID || "thoeurn_ratha@bkrt";
      } else if (decodedId) {
        accountId = decodedId;
      }
    }

    if (!accountId) {
      accountId = process.env.BAKONG_ACCOUNT_ID || "thoeurn_ratha@bkrt"; 
    }

    const mName = input.merchantName || "Gamex Cambodia";
    const mCity = input.merchantCity || "Phnom Penh";

    // Standard Individual account ID format is username@bank
    const bakongAccountId = accountId.includes("@") ? accountId : `${accountId}@aba`;

    const optionalData = {
      currency: khqrData.currency.usd, // USD by default
      amount: input.amount,
      billNumber: input.billNumber,
      storeLabel: mName,
      terminalLabel: "T1",
      expirationTimestamp: Date.now() + 5 * 60 * 1000,
    };

    const individualInfo = new IndividualInfo(
      bakongAccountId,
      mName,
      mCity,
      optionalData
    );

    const khqr = new BakongKHQR();
    const response = khqr.generateIndividual(individualInfo);

    if (response?.status?.code === 0) {
      return response.data.qr;
    } else {
      console.error("Bakong KHQR generation failed:", response?.status?.message);
      return null;
    }
  } catch (error) {
    console.error("Error in generateKhqrCode utility:", error);
    return null;
  }
};

import crypto from "crypto";

/**
 * Verifies the Bakong webhook signature (BKMDC hash).
 *
 * Bakong uses HMAC-SHA512 with a shared secret to sign webhook payloads.
 * The signature is sent in the X-Bakong-Signature header.
 *
 * @param rawBody - The raw JSON string body of the request
 * @param signature - The signature from the X-Bakong-Signature header
 * @param secret - The shared webhook secret (from env: BAKONG_WEBHOOK_SECRET)
 * @returns true if the signature is valid
 */
export const verifyBakongSignature = (
  rawBody: string,
  signature: string,
  secret: string
): boolean => {
  try {
    const computed = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

/**
 * Generates a BKMDC hash signature for outbound requests to Bakong (if needed).
 * Uses the same HMAC-SHA512 algorithm.
 */
export const generateBakongSignature = (
  payload: string,
  secret: string
): string => {
  return crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");
};
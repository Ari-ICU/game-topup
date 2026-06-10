import https from "https";
import { URL } from "url";

/**
 * Send raw HTML message to Telegram group/channel
 */
export const sendTelegramMessage = async (text: string, customChatId?: string | number): Promise<boolean> => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[Telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID. Skipping notification.");
    return false;
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    });

    const url = new URL(`https://api.telegram.org/bot${token}/sendMessage`);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(url, options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          console.error(`[Telegram] API error (status ${res.statusCode}):`, responseBody);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.error("[Telegram] Request failed:", err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Helper to notify details of a transaction update
 */
export const notifyTransactionStatus = async (transaction: any): Promise<void> => {
  const gameName = transaction.package?.game?.name || "Unknown Game";
  const packageName = transaction.package?.name || "Unknown Package";
  const amountPaid = transaction.totalAmount;
  const status = transaction.status;
  const txId = transaction.id;
  const paymentRef = transaction.paymentRef || "—";
  const providerRef = transaction.providerRef || "—";

  // Parse playerInfo
  let playerInfoStr = "—";
  if (transaction.playerInfo) {
    const info = typeof transaction.playerInfo === "string"
      ? JSON.parse(transaction.playerInfo)
      : transaction.playerInfo;

    const parts = [];
    if (info.playerId) parts.push(`Player ID: <code>${info.playerId}</code>`);
    if (info.zoneId) parts.push(`Zone/Server ID: <code>${info.zoneId}</code>`);
    if (info.username) parts.push(`Username: <code>${info.username}</code>`);
    if (parts.length > 0) playerInfoStr = parts.join(" | ");
  }

  let statusEmoji = "⏳";
  if (status === "COMPLETED") statusEmoji = "✅";
  if (status === "FAILED") statusEmoji = "❌";
  if (status === "EXPIRED") statusEmoji = "⏰";

  const message = `
${statusEmoji} <b>Top-up Transaction Alert</b>
--------------------------------------------
<b>Game:</b> ${gameName}
<b>Package:</b> ${packageName}
<b>Amount Paid:</b> $${amountPaid.toFixed(2)}
<b>Player Info:</b> ${playerInfoStr}
--------------------------------------------
<b>Status:</b> <code>${status}</code>
<b>Tx ID:</b> <code>${txId}</code>
<b>Payment Ref:</b> <code>${paymentRef}</code>
<b>Provider Ref:</b> <code>${providerRef}</code>
`;

  await sendTelegramMessage(message.trim());
};

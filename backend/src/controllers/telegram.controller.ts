import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { sendTelegramMessage } from "../utils/telegram";

export const telegramWebhookSchema = z.object({
  body: z.object({
    update_id: z.number(),
    message: z.any().optional(),
    edited_message: z.any().optional(),
  }),
});

// Helper to get start of today in Cambodia time (UTC+7)
const getCambodiaStartOfToday = (): Date => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Phnom_Penh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  const year = parts.find(p => p.type === "year")?.value;
  
  const isoString = `${year}-${month}-${day}T00:00:00.000+07:00`;
  return new Date(isoString);
};

export const handleTelegramWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const update = req.body;
    const message = update.message || update.edited_message;

    if (!message || !message.text) {
      // Not a message update with text, return 200 OK to acknowledge
      return res.status(200).json({ success: true, message: "Ignored non-text update" });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const username = message.from?.username;

    const parts = text.split(/\s+/);
    const command = parts[0].toLowerCase();
    const arg = parts[1];

    // Handle commands
    if (command === "/start" || command === "/help") {
      const helpMsg = `🤖 <b>TopUpPay Bot Commands:</b>

- <code>/start</code> or <code>/help</code> - Show this list of commands
- <code>/status &lt;transactionId&gt;</code> - Query status of a top-up transaction
- <code>/stats</code> - View today's sales and transaction statistics (Admin only)`;

      await sendTelegramMessage(helpMsg, chatId);
      return res.status(200).json({ success: true, command });
    }

    if (command === "/status") {
      if (!arg) {
        await sendTelegramMessage(
          "⚠️ Please provide a transaction ID.\nExample: <code>/status 65c2b5f7e4b0a23d45678901</code>",
          chatId
        );
        return res.status(200).json({ success: true, command, error: "Missing ID" });
      }

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(arg)) {
        await sendTelegramMessage(
          "⚠️ Invalid transaction ID format. It must be a 24-character hexadecimal string.",
          chatId
        );
        return res.status(200).json({ success: true, command, error: "Invalid ID format" });
      }

      const tx = await prisma.transaction.findUnique({
        where: { id: arg },
        include: {
          package: {
            include: {
              game: true,
            },
          },
        },
      });

      if (!tx) {
        await sendTelegramMessage(
          `❌ Transaction with ID <code>${arg}</code> not found.`,
          chatId
        );
        return res.status(200).json({ success: true, command, error: "Not found" });
      }

      const gameName = tx.package?.game?.name || "Unknown Game";
      const packageName = tx.package?.name || "Unknown Package";
      const amountPaid = tx.totalAmount;
      const status = tx.status;
      const paymentRef = tx.paymentRef || "—";
      const providerRef = tx.providerRef || "—";

      let statusEmoji = "⏳";
      if (status === "COMPLETED") statusEmoji = "✅";
      if (status === "FAILED") statusEmoji = "❌";
      if (status === "EXPIRED") statusEmoji = "⏰";

      // Parse playerInfo
      let playerInfoStr = "—";
      if (tx.playerInfo) {
        const info = typeof tx.playerInfo === "string"
          ? JSON.parse(tx.playerInfo)
          : tx.playerInfo;

        const infoParts = [];
        if (info.playerId) infoParts.push(`Player ID: <code>${info.playerId}</code>`);
        if (info.zoneId) infoParts.push(`Zone/Server ID: <code>${info.zoneId}</code>`);
        if (info.username) infoParts.push(`Username: <code>${info.username}</code>`);
        if (infoParts.length > 0) playerInfoStr = infoParts.join(" | ");
      }

      const dateStr = tx.createdAt.toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" });

      const msg = `🔍 <b>Transaction Status Details</b>
--------------------------------------------
<b>Game:</b> ${gameName}
<b>Package:</b> ${packageName}
<b>Amount Paid:</b> $${amountPaid.toFixed(2)}
<b>Player Info:</b> ${playerInfoStr}
--------------------------------------------
<b>Status:</b> <code>${status}</code> ${statusEmoji}
<b>Date (Cambodia):</b> <code>${dateStr}</code>
<b>Tx ID:</b> <code>${tx.id}</code>
<b>Payment Method:</b> <code>${tx.paymentMethod}</code>
<b>Payment Ref:</b> <code>${paymentRef}</code>
<b>Provider Ref:</b> <code>${providerRef}</code>`;

      await sendTelegramMessage(msg, chatId);
      return res.status(200).json({ success: true, command });
    }

    if (command === "/stats") {
      const adminUsernamesStr = process.env.TELEGRAM_ADMIN_USERNAMES || "";
      const adminUsernames = adminUsernamesStr
        .split(",")
        .map(u => u.trim().toLowerCase())
        .filter(Boolean);

      const senderUsername = (username || "").toLowerCase();

      if (!senderUsername || !adminUsernames.includes(senderUsername)) {
        await sendTelegramMessage(
          "⛔ You are not authorized to run this command.",
          chatId
        );
        return res.status(200).json({ success: true, command, error: "Unauthorized" });
      }

      const startOfToday = getCambodiaStartOfToday();

      const transactions = await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
        include: {
          package: {
            include: {
              game: true,
            },
          },
        },
      });

      let totalVolume = 0;
      let completedCount = 0;
      let pendingCount = 0;
      let failedCount = 0;
      let expiredCount = 0;

      const gameVolume: Record<string, { name: string; volume: number; count: number }> = {};

      for (const tx of transactions) {
        const status = tx.status;
        if (status === "COMPLETED") {
          totalVolume += tx.totalAmount;
          completedCount++;
        } else if (status === "PENDING" || status === "PROCESSING") {
          pendingCount++;
        } else if (status === "FAILED") {
          failedCount++;
        } else if (status === "EXPIRED") {
          expiredCount++;
        }

        const gameId = tx.package?.game?.id || "unknown";
        const gameName = tx.package?.game?.name || "Unknown Game";
        
        if (!gameVolume[gameId]) {
          gameVolume[gameId] = { name: gameName, volume: 0, count: 0 };
        }
        if (status === "COMPLETED") {
          gameVolume[gameId].volume += tx.totalAmount;
        }
        gameVolume[gameId].count++;
      }

      const sortedGames = Object.values(gameVolume).sort((a, b) => b.volume - a.volume);
      const gamesStatsText = sortedGames.length > 0
        ? sortedGames
            .slice(0, 5)
            .map(g => `- <b>${g.name}</b>: $${g.volume.toFixed(2)} (${g.count} txs)`)
            .join("\n")
        : "No transactions recorded today.";

      const cambodiaDateStr = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Phnom_Penh",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const statsMsg = `📊 <b>Today's Sales Summary</b>
--------------------------------------------
<b>Date:</b> ${cambodiaDateStr} (Cambodia Time)
<b>Total Volume (USD):</b> $${totalVolume.toFixed(2)}
<b>Total Transactions:</b> ${transactions.length}

<b>Breakdown by Status:</b>
✅ <b>Completed:</b> ${completedCount}
⏳ <b>Pending/Processing:</b> ${pendingCount}
❌ <b>Failed:</b> ${failedCount}
⏰ <b>Expired:</b> ${expiredCount}

<b>Top Games by Sales:</b>
${gamesStatsText}`;

      await sendTelegramMessage(statsMsg, chatId);
      return res.status(200).json({ success: true, command });
    }

    // Default: command not recognized (or unsupported commands)
    // We only reply to requests starting with "/" to avoid spamming normal conversations.
    if (command.startsWith("/")) {
      await sendTelegramMessage(
        `❓ Unknown command: <code>${command}</code>\nType <code>/help</code> to see available commands.`,
        chatId
      );
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("[Telegram Webhook Error]:", error);
    next(error);
  }
};

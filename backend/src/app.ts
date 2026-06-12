import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { setupSwagger } from "./config/swagger";
import gameRoutes from "./routes/game.routes";
import transactionRoutes from "./routes/transaction.routes";
import webhookRoutes from "./routes/webhook.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";

dotenv.config();

const app = express();

// ─── Startup ENV guard ───────────────────────────────────────────────────────
// Fail fast if critical environment variables are missing
const REQUIRED_ENV = ["JWT_SECRET", "ADMIN_PASSCODE", "DATABASE_URL"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.error(`[FATAL] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
if (process.env.NODE_ENV === "production") {
  if (!process.env.FRONTEND_URL) {
    logger.error("[FATAL] FRONTEND_URL is not set in production!");
    process.exit(1);
  }
  if (!process.env.BAKONG_WEBHOOK_SECRET) {
    logger.error("[FATAL] BAKONG_WEBHOOK_SECRET is not set in production!");
    process.exit(1);
  }
}

// ─── Security headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow image serving
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// ─── Body parsing ────────────────────────────────────────────────────────────
// Tight global limit (10kb). Admin upload route uses its own 10mb limit.
app.use((req: any, res: any, next: any) => {
  if (req.path === "/api/admin/upload" || req.originalUrl === "/api/admin/upload" || req.originalUrl.endsWith("/admin/upload")) {
    return next();
  }
  express.json({
    limit: "10kb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })(req, res, next);
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Custom request logger streaming via Winston
app.use(
  morgan(
    (tokens, req, res) => {
      return [
        `[${tokens.method(req, res)}]`,
        tokens.url(req, res),
        "- Status:",
        tokens.status(req, res),
        "- Time:",
        tokens["response-time"](req, res),
        "ms",
      ].join(" ");
    },
    {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    }
  )
);

// Mount OpenAPI Swagger UI
setupSwagger(app);

// API Routes
app.use("/api/games", gameRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/admin", adminRoutes);

// Health Check Route
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Backend server is running smoothly",
  });
});

// Centralized Error Handling Pipeline
app.use(errorHandler);

export default app;

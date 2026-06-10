import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import gameRoutes from "./routes/game.routes";
import transactionRoutes from "./routes/transaction.routes";
import webhookRoutes from "./routes/webhook.routes";
import adminRoutes from "./routes/admin.routes";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.removeHeader("X-Powered-By");
  next();
});
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Custom request logger displaying [GET]/[POST] details
app.use(
  morgan((tokens, req, res) => {
    return [
      `[${tokens.method(req, res)}]`,
      tokens.url(req, res),
      "- Status:",
      tokens.status(req, res),
      "- Time:",
      tokens["response-time"](req, res),
      "ms",
    ].join(" ");
  })
);

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
